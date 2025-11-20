import { useEffect, useState } from 'react';
import { Card, Stack, Text, Badge, Group, ScrollArea, Button, Popover } from '@mantine/core';
import { GetListingBookingDetail } from '../api/BookingApi.js';

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (!Number.isFinite(date.getTime())) return String(d);
  return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusColor(status) {
  if (status === 'accepted') return 'green';
  if (status === 'pending') return 'yellow';
  if (status === 'declined') return 'red';
  if (status === 'cancelled') return 'gray';
  return 'gray';
}

export default function BookingStatusPanel({ listingId }) {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token || !email) {
        setBookings([]);
        return;
      }

      try {
        setLoading(true);
        setErr(null);
        const list = await GetListingBookingDetail(token, email, listingId);
        if (cancelled) return;
        setBookings(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'Failed to load bookings');
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token, email, listingId]);

  if (!token || !email) {
    return (
      <Card withBorder radius="md" mt="md" p="md">
        <Text fw={600} mb="xs">Your bookings</Text>
        <Text size="sm" c="dimmed">
          Please login to see your booking status for this listing.
        </Text>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card withBorder radius="md" mt="md" p="md">
        <Text fw={600} mb="xs">Your bookings</Text>
        <Text size="sm" c="dimmed">Loading your bookings…</Text>
      </Card>
    );
  }

  if (err) {
    return (
      <Card withBorder radius="md" mt="md" p="md">
        <Text fw={600} mb="xs">Your bookings</Text>
        <Text size="sm" c="red">{err}</Text>
      </Card>
    );
  }

  if (!bookings.length) {
    return (
      <Card withBorder radius="md" mt="md" p="md">
        <Text fw={600} mb="xs">Your bookings</Text>
        <Text size="sm" c="dimmed">
          You have not booked this listing yet.
        </Text>
      </Card>
    );
  }

  const renderBookingCard = (b) => {
    const start = b.dateRange?.start || b.start || b.from;
    const end = b.dateRange?.end || b.end || b.to;

    return (
      <Card key={b.id} withBorder padding="xs" radius="md">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              Booking #{b.id}
            </Text>
            {(start || end) && (
              <Text size="xs" c="dimmed">
                {fmtDate(start)} → {fmtDate(end)}
              </Text>
            )}
          </Stack>
          <Badge color={statusColor(b.status)} variant="filled">
            {b.status}
          </Badge>
        </Group>
      </Card>
    );
  };

  if (bookings.length <= 2) {
    return (
      <Card withBorder radius="md" mt="md" p="md">
        <Stack gap="xs">
          <Text fw={600}>Your bookings</Text>
          {bookings.map(renderBookingCard)}
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" mt="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={600}>Your bookings</Text>
          <Badge variant="light">
            {bookings.length} bookings
          </Badge>
        </Group>

        <Popover
          opened={opened}
          onChange={setOpened}
          position="bottom-start"
          withinPortal
          shadow="md"
        >
          <Popover.Target>
            <Button
              size="xs"
              variant="light"
              onClick={() => setOpened((o) => !o)}
            >
              {opened ? 'Hide details' : 'Show details'}
            </Button>
          </Popover.Target>

          <Popover.Dropdown>
            <ScrollArea h={260} w={320}>
              <Stack gap="xs">
                {bookings.map(renderBookingCard)}
              </Stack>
            </ScrollArea>
          </Popover.Dropdown>
        </Popover>

        <Text size="xs" c="dimmed">
          Click “Show details” to see all your bookings for this listing.
        </Text>
      </Stack>
    </Card>
  );
}
