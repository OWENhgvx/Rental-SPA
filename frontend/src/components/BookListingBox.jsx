import { useEffect, useMemo, useState } from 'react';
import {Card,Button,Text,Divider,Flex,Popover,Fieldset,Title} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { SendNewBooking } from '../api/BookingApi.js';
import AppAlertModal from './AppAlertModal';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Convert input to Date or null
function toDate(x) {
  if (x instanceof Date) return Number.isFinite(x.getTime()) ? x : null;
  if (typeof x === 'number' || typeof x === 'string') {
    const d = new Date(x);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

// Normalize range input to [Date|null, Date|null]
function normalizeRange(r) {
  if (!Array.isArray(r)) return [null, null];
  const s = toDate(r[0]);
  const e = toDate(r[1]);
  return [s, e];
}

// Get milliseconds at midday for a date
function middayMs(d) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    12,
    0,
    0,
    0,
  ).getTime();
}

// Convert date to 'YYYY-MM-DD' format
function dateToYMD(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Check if ymd string is in range [start, end]
function inRange(ymd, start, end) {
  return ymd >= start && ymd <= end;
}

// BookListingBox component
export default function BookListingBox({
  daterange = [null, null],
  price,
  listingid,
  excludedate,
}) {
  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

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

  const [dateRange, setDateRange] = useState(() => normalizeRange(daterange));
  const [opened, setOpened] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState(null);

  useEffect(() => {
    setDateRange(normalizeRange(daterange));
  }, [daterange]);

  const ranges = useMemo(
    () => (Array.isArray(excludedate) ? excludedate : []),
    [excludedate],
  );

  const hasRange = useMemo(
    () => dateRange[0] instanceof Date && dateRange[1] instanceof Date,
    [dateRange],
  );

  const nights = useMemo(() => {
    if (!hasRange) return 0;
    const [s, e] = dateRange;
    const diff = middayMs(e) - middayMs(s);
    const n = Math.round(diff / MS_PER_DAY);
    return Math.max(0, n);
  }, [dateRange, hasRange]);

  const totalPrice = useMemo(
    () => (hasRange ? Number(price) * nights : Number(price) || 0),
    [price, nights, hasRange],
  );

  const formatDate = (d) =>
    d?.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const handleChange = (val) => {
    const [s, e] = normalizeRange(val);
    setDateRange([s, e]);

    if (s && !e) {
      const ymd = dateToYMD(s);
      const win = ranges.find(
        (r) =>
          typeof r?.start === 'string' &&
          typeof r?.end === 'string' &&
          inRange(ymd, r.start, r.end),
      );
      setSelectedWindow(win || null);
    } else if (!s && !e) {
      setSelectedWindow(null);
    } else if (s && e) {
      setSelectedWindow(null);
      setOpened(false);
    }
  };

  const onSubmit = async () => {
    if (!token) {
      openAlert({
        type: 'error',
        title: 'Not logged in',
        message: 'You must log in before making a booking.',
      });
      return;
    }

    if (!hasRange) {
      openAlert({
        type: 'error',
        title: 'Missing dates',
        message: 'Please fill in your date range.',
      });
      return;
    }

    try {
      await SendNewBooking(token, listingid, dateRange, totalPrice);
      openAlert({
        type: 'success',
        title: 'Booking request sent',
        message: 'Send success!',
      });
    } catch (e) {
      openAlert({
        type: 'error',
        title: 'Booking failed',
        message: e?.message || 'Booking failed',
      });
    }
  };

  const onReset = () => {
    setDateRange([null, null]);
    setSelectedWindow(null);
  };

  const excludeDate = (d) => {
    const ymd = dateToYMD(d);
    if (!ymd) return true;

    const todayYmd = dateToYMD(today);
    const isPast = ymd < todayYmd;
    if (isPast) return true;

    if (selectedWindow && dateRange[0] && !dateRange[1]) {
      return !inRange(ymd, selectedWindow.start, selectedWindow.end);
    }

    const allowed = ranges.some(
      (r) =>
        typeof r?.start === 'string' &&
        typeof r?.end === 'string' &&
        inRange(ymd, r.start, r.end),
    );
    return !allowed;
  };

  const loggedOutCard = (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Title ta="center" size="xl">
        Start your trip 🚀
      </Title>
      <Divider my="md" />
      <Text size="sm" c="dimmed" ta="center">
        You are not logged in, so you cannot make a booking.
      </Text>
    </Card>
  );

  const bookingCard = (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Title ta="center" size="xl">
        Start your trip 🚀
      </Title>
      <Divider my="md" />
      {hasRange ? (
        <>
          <Text fz="md" fw={700}>
            Your total cost: ${totalPrice} AUD
          </Text>
          <Text size="sm" c="dimmed">
            for {nights} night{nights > 1 ? 's' : ''} · $
            {Number(price) || 0}/night
          </Text>
        </>
      ) : (
        <>
          <Text fz="md" fw={700}>
            Your total cost: ${Number(price) || 0} AUD
          </Text>
          <Text size="sm" c="dimmed">
            for ${Number(price) || 0} per night
          </Text>
        </>
      )}

      <Popover
        opened={opened}
        onChange={setOpened}
        position="bottom"
        withArrow
        withinPortal
        shadow="md"
        offset={4}
      >
        <Popover.Target>
          <Flex mt="md" direction={{ base: 'column', md: 'row' }} gap="xs">
            <Button
              fullWidth
              variant={hasRange ? 'light' : 'outline'}
              onClick={() => setOpened((o) => !o)}
            >
              <div style={{ textAlign: 'left' }}>
                <Text size="sm" fw={600}>
                  CHECK-IN
                </Text>
                <Text size="xs" fw={300} c="dimmed">
                  {dateRange[0] ? formatDate(dateRange[0]) : 'Add date'}
                </Text>
              </div>
            </Button>

            <Button
              fullWidth
              variant={hasRange ? 'light' : 'outline'}
              onClick={() => setOpened((o) => !o)}
            >
              <div style={{ textAlign: 'left' }}>
                <Text size="sm" fw={600}>
                  CHECK-OUT
                </Text>
                <Text size="xs" fw={300} c="dimmed">
                  {dateRange[1] ? formatDate(dateRange[1]) : 'Add date'}
                </Text>
              </div>
            </Button>
          </Flex>
        </Popover.Target>

        <Popover.Dropdown>
          <Fieldset legend="Choose date range" radius="md">
            <DatePicker
              type="range"
              allowDeselect
              value={dateRange}
              onChange={handleChange}
              excludeDate={excludeDate}
              minDate={today}
            />
          </Fieldset>
        </Popover.Dropdown>
      </Popover>

      <Divider my="md" />

      <Flex gap="xs">
        <Button variant="filled" onClick={onSubmit} fullWidth>
          Submit
        </Button>
        <Button color="red" variant="light" onClick={onReset} fullWidth>
          Reset
        </Button>
      </Flex>
    </Card>
  );

  return (
    <>
      {isLoggedIn ? bookingCard : loggedOutCard}

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
