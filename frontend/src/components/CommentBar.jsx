// src/components/CommentBar.jsx
import { useEffect, useMemo, useState } from 'react';
import {Card,Stack,Group,Select,Textarea,Button,Text,Rating} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { GetSuccessListingBookingDetail } from '../api/BookingApi.js';
import { SendComment } from '../api/GetListingDetail.js';

export default function CommentBar({ listingId }) {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState(null); // string
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const isLoggedIn = !!token && !!email;
  const hasBookings = Array.isArray(bookings) && bookings.length > 0;

  const bookingOptions = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    const fmt = (d) => {
      try {
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return String(d ?? '');
        return date.toLocaleDateString();
      } catch {
        return String(d ?? '');
      }
    };

    return bookings.map((b) => {
      const s = b.start || b.dateRange?.start || b.dateRange?.[0] || b.from;
      const e = b.end || b.dateRange?.end || b.dateRange?.[1] || b.to;
      const labelDate = s && e ? ` (${fmt(s)} → ${fmt(e)})` : '';
      return {
        value: String(b.id),
        label: `Booking #${b.id}${labelDate}`,
      };
    });
  }, [bookings]);

  const submit = async () => {
    if (!isLoggedIn) {
      notifications.show({ color: 'red', message: 'Please login first.' });
      return;
    }
    if (!bookingId) {
      notifications.show({ color: 'red', message: 'Please choose a booking.' });
      return;
    }
    if (!score) {
      notifications.show({ color: 'red', message: 'Please give a score.' });
      return;
    }
    if (!comment.trim()) {
      notifications.show({ color: 'red', message: 'Please write a comment.' });
      return;
    }

    try {
      await SendComment(listingId, bookingId, token, score, comment);
      setScore(0);
      setComment('');
      notifications.show({ color: 'green', message: 'Review submitted.' });
    } catch (err) {
      notifications.show({
        color: 'red',
        message: err.message || 'Failed to send review',
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isLoggedIn) {
        setBookings([]);
        setBookingId(null);
        return;
      }

      try {
        const successList = await GetSuccessListingBookingDetail(
          token,
          email,
          listingId,
        );
        if (cancelled) return;
        setBookings(successList || []);
        if (successList && successList.length > 0) {
          setBookingId(String(successList[0].id));
        } else {
          setBookingId(null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setBookings([]);
          setBookingId(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token, email, listingId]);

  if (!isLoggedIn) {
    return (
      <Card withBorder radius="md" mt="md" p="md" style={{ opacity: 0.6 }}>
        <Stack gap="sm" align="center">
          <Text fw={600}>Leave a review</Text>
          <Text size="sm" c="dimmed" ta="center">
            Please login to view your bookings and leave a review for this listing.
          </Text>
          <Button
            size="xs"
            variant="light"
            onClick={() => navigate('/login')}
          >
            Go to login
          </Button>
        </Stack>
      </Card>
    );
  }

  if (!hasBookings) {
    return (
      <Card withBorder radius="md" mt="md" p="md" style={{ opacity: 0.5 }}>
        <Stack gap="sm" align="center">
          <Text fw={600}>Leave a review</Text>
          <Text size="sm" c="dimmed" ta="center">
            You have not completed any accepted booking for this listing yet,
            so you cannot leave a review.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" mt="md" p="md">
      <Stack gap="sm">
        <Text fw={600}>Leave a review</Text>

        <Group gap="sm" align="flex-end" wrap="wrap">
          <Select
            label="Which booking?"
            placeholder="Select a booking"
            data={bookingOptions}
            value={bookingId}
            onChange={setBookingId}
            w={{ base: '100%', sm: '60%' }}
          />

          <Stack gap={2} style={{ minWidth: 160 }}>
            <Text size="xs" c="dimmed">
              Score
            </Text>
            <Group gap="xs">
              <Rating value={score} onChange={setScore} size="md" />
              <Text size="sm">{score || '-'}/5</Text>
            </Group>
          </Stack>
        </Group>

        <Textarea
          label="Your comment"
          placeholder="Share your experience…"
          minRows={3}
          autosize
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {comment.length}/500
          </Text>
          <Button onClick={submit}>Post review</Button>
        </Group>
      </Stack>
    </Card>
  );
}
