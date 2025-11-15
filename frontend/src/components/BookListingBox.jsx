import { useEffect, useMemo, useState } from 'react';
import { Card, Button, Text, Divider, Flex, Popover, Fieldset, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { SendNewBooking } from '../api/BookingApi.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDate(x) {
  if (x instanceof Date) return Number.isFinite(x.getTime()) ? x : null;
  if (typeof x === 'number' || typeof x === 'string') {
    const d = new Date(x);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function normalizeRange(r) {
  if (!Array.isArray(r)) return [null, null];
  const s = toDate(r[0]);
  const e = toDate(r[1]);
  return [s, e];
}
function middayMs(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0).getTime();
}

export default function BookListingBox({
  daterange = [null, null],
  price,
  listingid,
}) {
  const token = localStorage.getItem('token');

  const [dateRange, setDateRange] = useState(() => normalizeRange(daterange));
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setDateRange(normalizeRange(daterange));
  }, [daterange]);

  const hasRange = useMemo(
    () => dateRange[0] instanceof Date && dateRange[1] instanceof Date,
    [dateRange]
  );

  const nights = useMemo(() => {
    if (!hasRange) return 0;
    const [s, e] = dateRange;
    const diff = middayMs(e) - middayMs(s);
    const n = Math.round(diff / MS_PER_DAY);
    return Math.max(0, n);
  }, [dateRange, hasRange]);

  const totalPrice = useMemo(() => (hasRange ? Number(price) * nights : Number(price) || 0), [
    price,
    nights,
    hasRange,
  ]);

  const formatDate = (d) =>
    d?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleChange = (val) => {
    const [s, e] = normalizeRange(val);
    setDateRange([s, e]);
    if (s && e) setOpened(false);
  };

  const onSubmit = async () => {
    if (!token) {
      alert('Not logged in');
      return;
    }
    if (!hasRange) {
      alert('Please fill in your date range');
      return;
    }
    try {
      await SendNewBooking(token, listingid, dateRange, totalPrice);
      alert('Send success!');
    } catch (e) {
      alert(e?.message || 'Booking failed');
    }
  };

  const onReset = () => {
    setDateRange([null, null]);
  };

  const todayDate=new Date();

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Title ta="center" size="xl">
        Start your trip 🚀
      </Title>

      {hasRange ? (
        <>
          <Text fz="md" fw={700}>
            Your total cost: ${totalPrice} AUD
          </Text>
          <Text size="sm" c="dimmed">
            for {nights} night{nights > 1 ? 's' : ''} · ${Number(price) || 0}/night
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

      <Popover opened={opened} onChange={setOpened} position="bottom" withArrow withinPortal shadow="md" offset={4}>
        <Popover.Target>
          <Flex mt="md" direction={{ base: 'column', md: 'row' }} gap="xs">
            <Button fullWidth variant={hasRange ? 'light' : 'outline'} onClick={() => setOpened((o) => !o)}>
              <div style={{ textAlign: 'left' }}>
                <Text size="sm" fw={600}>
                  CHECK-IN
                </Text>
                <Text size="xs" fw={300} c="dimmed">
                  {dateRange[0] ? formatDate(dateRange[0]) : 'Add date'}
                </Text>
              </div>
            </Button>

            <Button fullWidth variant={hasRange ? 'light' : 'outline'} onClick={() => setOpened((o) => !o)}>
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
            <DatePicker minDate={todayDate} type="range" allowDeselect value={dateRange} onChange={handleChange} />
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
}
