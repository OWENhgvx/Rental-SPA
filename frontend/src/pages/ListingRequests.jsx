import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {Card,Title,Text,Button,Divider,Stack,Group,Loader,Alert,} from "@mantine/core";

function ListingRequests() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Utility
  const getDayDiff = (start, end) =>
    Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

  const getDaysOnline = (postedOn) => {
    if (!postedOn) return "Not published yet";
    const diff = Math.floor(
      (new Date() - new Date(postedOn)) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? diff : "Not published yet";
  };

  const getBookedDaysThisYear = (acceptedBookings) => {
    const year = new Date().getFullYear();
    return acceptedBookings.reduce((sum, b) => {
      const start = new Date(b.dateRange?.start);
      if (start.getFullYear() === year) {
        return sum + getDayDiff(b.dateRange.start, b.dateRange.end);
      }
      return sum;
    }, 0);
  };

  const getTotalProfitThisYear = (acceptedBookings) => {
    const year = new Date().getFullYear();
    return acceptedBookings
      .filter((b) => new Date(b.dateRange?.start).getFullYear() === year)
      .reduce((sum, b) => sum + b.totalPrice, 0);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch listing info
      const listingRes = await fetch(
        `http://localhost:5005/listings/${listingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!listingRes.ok) throw new Error("Failed to load listing");
      const listingData = await listingRes.json();
      setListing(listingData.listing);

      // 2. Fetch all bookings
      const bookingsRes = await fetch(`http://localhost:5005/bookings`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!bookingsRes.ok) throw new Error("Failed to load bookings");
      const bookingsData = await bookingsRes.json();

      // Support [] or {} structure
      const rawBookings = bookingsData.bookings;
      const allBookings = Array.isArray(rawBookings)
        ? rawBookings
        : rawBookings && typeof rawBookings === "object"
        ? Object.values(rawBookings)
        : [];

      const related = allBookings.filter(
        (b) => b.listingId === Number(listingId)
      );

      setPendingRequests(related.filter((b) => b.status === "pending"));
      setHistory(related.filter((b) => b.status !== "pending"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId, action) => {
    await fetch(`http://localhost:5005/bookings/${action}/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    fetchData(); // no reload, just refresh
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  if (loading)
    return (
      <Group position="center" mt="xl">
        <Loader size="lg" />
      </Group>
    );

  if (error)
    return (
      <Alert color="red" title="Error" mt="md">
        {error}
      </Alert>
    );

  if (!listing) return <Text>Listing not found.</Text>;

  const accepted = history.filter((b) => b.status === "accepted");

  return (
    <Stack p="lg" spacing="xl">
  
      {/* 页面标题 */}
      <Group position="apart">
        <Title order={2}>Booking Management – {listing.title}</Title>
        <Button variant="light" onClick={() => navigate(-1)}>
          ← Back to Listings
        </Button>
      </Group>
  
      {/* 房源摘要卡片 */}
      <Card shadow="sm" radius="md" withBorder p="lg">
        <Stack spacing="xs">
          <Group spacing="sm">
            <Text size="lg" weight={600}>
               Hosted by {listing.owner}
            </Text>
          </Group>
  
          <Text>
            <b>Price per night:</b> ${listing.price}
          </Text>
          <Text>
            <b>Days online:</b> {getDaysOnline(listing.postedOn)}
          </Text>
          <Text>
            <b>Booked days this year:</b> {getBookedDaysThisYear(accepted)} days
          </Text>
          <Text>
            <b>Earnings this year:</b> ${getTotalProfitThisYear(accepted)}
          </Text>
        </Stack>
      </Card>
  
      <Divider my="md" />
  
      {/* Pending Requests */}
      <Title order={3}>Pending Booking Requests</Title>
      {pendingRequests.length === 0 ? (
        <Text color="dimmed">No pending requests.</Text>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date Range</th>
              <th>Total Price</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.owner || req.email}</td>
                <td>
                  {req.dateRange?.start} → {req.dateRange?.end}
                </td>
                <td>${req.totalPrice}</td>
                <td>
                  <Text color="orange">pending</Text>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Group position="right" spacing="xs">
                    <Button
                      color="green"
                      size="xs"
                      onClick={() => handleAction(req.id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => handleAction(req.id, "decline")}
                    >
                      Decline
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
  
      <Divider my="md" />
  
      {/* Booking History */}
      <Title order={3}>Booking History</Title>
      {history.length === 0 ? (
        <Text color="dimmed">No booking history.</Text>
      ) : (
        <Table striped>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date Range</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((req) => (
              <tr key={req.id}>
                <td>{req.owner || req.email}</td>
                <td>
                  {req.dateRange?.start} → {req.dateRange?.end}
                </td>
                <td>${req.totalPrice}</td>
                <td>
                  <Text color={req.status === "accepted" ? "green" : "red"}>
                    {req.status}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Stack>
  );
  
}

export default ListingRequests;
