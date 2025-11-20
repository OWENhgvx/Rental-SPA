import { useState, useEffect } from 'react';
import { SimpleGrid, Container, Title, Button, Badge, Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import HouseCard from '../components/HouseCard';
import ProfitChart from "../components/ProfitChart";
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail';
import AppAlertModal from '../components/AppAlertModal';

// Host Listings page
function HostListings() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  const [myIds, setMyIds] = useState([]);
  const [listingDetails, setListingDetails] = useState([]);
  const [houseNumber, setHouseNumber] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  const [alertState, setAlertState] = useState({
    opened: false,
    type: 'info',
    title: '',
    message: '',
  });

  const openAlert = ({ type = 'info', title = '', message = '' }) => {
    setAlertState({
      opened: true,
      type,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, opened: false }));
  };

  async function fetchMyListings() {
    try {
      const allListings = await GetAllListing();

      const ids = allListings
        .filter((l) => l.owner === userEmail)
        .map((l) => String(l.id));

      setMyIds(ids);

      const cardInfos = await Promise.all(ids.map((id) => GetCardInfo(id)));

      setHouseNumber(cardInfos.length);
      setListingDetails(cardInfos);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5005/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const allBookings = data.bookings ? Object.values(data.bookings) : [];

      setBookings(allBookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  }

  useEffect(() => {
    if (myIds.length === 0) {
      setMyBookings([]);
      return;
    }

    const mine = bookings.filter((b) =>
      myIds.includes(String(b.listingId))
    );

    setMyBookings(mine);
  }, [myIds, bookings]);

  useEffect(() => {
    fetchMyListings();
    fetchBookings();
  }, [userEmail]);

  const handleDelete = async (id) => {
    const ok = confirm('Are you sure?');
    if (!ok) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5005/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        openAlert({
          type: 'error',
          title: 'Delete failed',
          message: err.error || 'Delete failed',
        });
        return;
      }

      openAlert({
        type: 'success',
        title: 'Delete complete',
        message: 'Delete complete',
      });
      fetchMyListings();
    } catch (err) {
      console.error(err);
      openAlert({
        type: 'error',
        title: 'Delete error',
        message: 'Delete error',
      });
    }
  };

  return (
    <>
      <Container fluid px={20}>
        <Group position="apart" mb="md">
          <Group>
            <Title order={2}>My Host Listings</Title>
            <Badge size="lg" radius="sm" color="blue">
              {houseNumber} total
            </Badge>
          </Group>

          <Button
            variant="filled"
            color="green"
            radius="md"
            onClick={() => navigate('/host/create-listing')}
          >
            Create a new listing
          </Button>
        </Group>

        {/* Profit Chart */}
        <div
          style={{
            height: "300px",
            border: "1px dashed #aaa",
            borderRadius: "8px",
            marginBottom: "30px",
            paddingTop: "20px",
          }}
        >
          <ProfitChart bookings={myBookings} />
        </div>

        {/* Listing Cards */}
        {listingDetails.length === 0 ? (
          <Text c="dimmed">You have no listings yet.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, xl: 4 }}>
            {listingDetails.map((item) => (
              <HouseCard
                key={item.id}
                onDelete={handleDelete}
                onRefresh={fetchMyListings}
                pageState="host"
                cardInfo={item}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>

      <AppAlertModal
        opened={alertState.opened}
        onClose={closeAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />
    </>
  );
}

export default HostListings;
