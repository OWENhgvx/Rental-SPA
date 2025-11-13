import { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Paper, Text, Loader } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useParams, useNavigate } from 'react-router-dom';
import { GetListingDetail } from '../api/GetListingDetail';

const NET_ADDRESS = 'http://localhost:5005';

function AvailabilityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [range, setRange] = useState([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const listing = await GetListingDetail(id);
        setAvailability(listing.availability || []);
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        alert('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const addRange = () => {
    const [start, end] = range;
    if (!start || !end) {
      alert('Please select both start and end dates');
      return;
    }

    const hasOverlap = availability.some(
      (r) =>
        !(new Date(end) < new Date(r.start) || new Date(start) > new Date(r.end))
    );
    if (hasOverlap) {
      alert('Date range overlaps with existing availability!');
      return;
    }

    const updated = [...availability, { start, end }].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );
    setAvailability(updated);
    setRange([null, null]);
  };

  const removeRange = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSave = async () => {

    const token = localStorage.getItem('token');
    try {
      await fetch(`${NET_ADDRESS}/listings/unpublish/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await fetch(`${NET_ADDRESS}/listings/publish/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({availability}),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish listing');
      }

      alert('Availability updated and listing re-published!');
      navigate('/host/listings');
    } catch (error) {
      console.error('Error while saving:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <Container mt="xl">
        <Group justify="center">
          <Loader color="blue" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Manage Availability
      </Title>

      <Group align="end" mb="md">
        <DatePickerInput
          type="range"
          label="Select date range"
          value={range}
          onChange={setRange}
        />
        <Button color="blue" onClick={addRange}>
          Add
        </Button>
      </Group>

      {availability.length === 0 ? (
        <Text c="dimmed">No date ranges added yet.</Text>
      ) : (
        availability.map((r, i) => (
          <Paper key={i} p="sm" mt="sm" withBorder radius="md">
            <Group justify="space-between">
              <Text>
                {new Date(r.start).toLocaleDateString()} →{' '}
                {new Date(r.end).toLocaleDateString()}
              </Text>
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
        ))
      )}

      <Group justify="center" mt="xl">
        <Button color="green" onClick={handleSave}>
          Save & Publish
        </Button>
      </Group>
    </Container>
  );
}

export default AvailabilityPage;