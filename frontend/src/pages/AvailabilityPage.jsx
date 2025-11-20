import { useState, useEffect } from "react";
import {Container,Title,Button,Group,Paper,Text,Loader,Stack,Divider,Box,Badge,Card,} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useParams, useNavigate } from "react-router-dom";
import { GetListingDetail } from "../api/GetListingDetail";
import AppAlertModal from "../components/AppAlertModal";

const NET_ADDRESS = "http://localhost:5005";

function AvailabilityPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);
  const [range, setRange] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  const [alertState, setAlertState] = useState({
    opened: false,
    type: "info",
    title: "",
    message: "",
  });

  const openAlert = ({ type = "info", title = "", message = "" }) => {
    setAlertState({ opened: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, opened: false }));
  };

  // Load availability from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const listing = await GetListingDetail(id);
        setAvailability(listing.availability || []);
      } catch (err) {
        console.error("Failed to fetch listing:", err);
        openAlert({
          type: "error",
          title: "Load failed",
          message: "Failed to load listing details.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Add new date range
  const addRange = () => {
    const [start, end] = range;

    if (!start || !end) {
      openAlert({
        type: "error",
        title: "Invalid range",
        message: "Please select both start and end dates.",
      });
      return;
    }

    const updated = [...availability, { start, end }].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    setAvailability(updated);
    setRange([null, null]);
  };

  // Remove date range
  const removeRange = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  // Save changes (unpublish + republish)
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${NET_ADDRESS}/listings/unpublish/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await fetch(`${NET_ADDRESS}/listings/publish/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to publish listing.");
      }

      openAlert({
        type: "success",
        title: "Availability saved",
        message: "Availability updated and listing re-published.",
      });
      navigate("/host/listings");
    } catch (error) {
      console.error("Error while saving:", error);
      openAlert({
        type: "error",
        title: "Save failed",
        message: error.message || "Failed to save availability.",
      });
    }
  };

  if (loading) {
    return (
      <Container size="sm" mt="xl">
        <Group justify="center">
          <Loader color="blue" />
        </Group>

        <AppAlertModal
          opened={alertState.opened}
          onClose={closeAlert}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
        />
      </Container>
    );
  }

  // Disable past dates & existing availability
  const getDisabledDayProps = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const isPast = d < today;

    const isBooked = availability.some((r) => {
      const start = new Date(r.start);
      const end = new Date(r.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });

    if (isPast || isBooked) {
      return {
        disabled: true,
        style: { color: "#b5b5b5", backgroundColor: "#f3f3f3" },
      };
    }

    return {};
  };

  return (
    <>
      <Container size="sm" mt="xl">
        <Title order={2} mb="xs">
          Manage Availability
        </Title>

        <Text c="dimmed" mb="md">
          Click the date input below to open the calendar. First click a start
          date, then click an end date, and press Add to save the range. You can
          also publish with no availability selected — your listing will still be
          visible to users.
        </Text>

        <Card withBorder radius="md" p="md" mb="lg">
          <Text fw={600} mb={6}>
            Add date range (optional)
          </Text>
          <Text size="sm" c="dimmed" mb="sm">
            Click the input to open the calendar. Choose a start date, then an
            end date.
          </Text>

          <Stack gap="sm">
            <DatePickerInput
              type="range"
              label="Select date range"
              placeholder="Click to choose start and end dates"
              description="You may leave this empty and publish"
              value={range}
              onChange={setRange}
              getDayProps={getDisabledDayProps}
              minDate={new Date()}
              clearable
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="default"
                onClick={() => setRange([null, null])}
              >
                Clear selection
              </Button>

              <Button color="blue" onClick={addRange}>
                Add
              </Button>
            </Group>
          </Stack>
        </Card>

        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Current availability</Text>
            <Badge variant="light">{availability.length} ranges</Badge>
          </Group>

          <Divider mb="sm" />

          {availability.length === 0 ? (
            <Text c="dimmed">
              No date ranges yet. You can still publish without availability.
            </Text>
          ) : (
            <Stack gap="sm">
              {availability.map((r, i) => (
                <Paper key={i} p="sm" withBorder radius="md">
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box>
                      <Text size="sm" c="dimmed">
                        Range {i + 1}
                      </Text>
                      <Text>
                        {new Date(r.start).toLocaleDateString()} →{" "}
                        {new Date(r.end).toLocaleDateString()}
                      </Text>
                    </Box>

                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      onClick={() => removeRange(i)}
                    >
                      Delete
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Stack align="center" mt="xl" gap={6}>
          <Button color="green" onClick={handleSave} w="100%">
            Save & Publish
          </Button>
          <Text size="sm" c="dimmed">
            Publishing with empty availability is allowed and the listing will
            still be visible.
          </Text>
        </Stack>
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

export default AvailabilityPage;
