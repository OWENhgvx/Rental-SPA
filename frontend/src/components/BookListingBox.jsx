// src/components/BookListingBox.jsx
import { useState } from 'react';
import {
  Card,
  Button,
  Text,
  Divider,
  Flex,
  Popover,
  Fieldset,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { SendNewBooking } from '../api/BookingApi.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function BookListingBox({ daterange = [null, null], price, listingid }) {
  const token = localStorage.getItem('token');

  const [dateRange, setDateRange] = useState(daterange);
  const [opened, setOpened] = useState(false);

  const hasRange = dateRange[0] && dateRange[1];
  const nights = hasRange
    ? Math.round((dateRange[1] - dateRange[0]) / MS_PER_DAY)
    : 0;
  const totalPrice = hasRange ? nights * price : price;

  const formatDate = (d) =>
    d?.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const onSubmit = () => {
    if (!token) {
      alert('Not logged in');
      return;
    }

    if (!hasRange) {
      alert('Please fill in your date range');
      return;
    }

    SendNewBooking(token, listingid, dateRange, totalPrice);
    alert('Send success!');
  };

  const onReset = () => {
    setDateRange([null, null]);
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Title ta='center' size='xl'>Start your trip🚀</Title>
      {hasRange ? (
        <>

          <Text>${totalPrice} AUD</Text>
          <Text size="sm" c="dimmed">
            for {nights} night{nights > 1 ? 's' : ''} · ${price}/night
          </Text>
        </>
      ) : (
        <>
          <Text>${price} AUD</Text>
          <Text size="sm" c="dimmed">
            per night
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
            {/* CHECK-IN */}
            <Button
              fullWidth
              variant={hasRange ? 'filled' : 'outline'}
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

            {/* CHECK-OUT */}
            <Button
              fullWidth
              variant={hasRange ? 'filled' : 'outline'}
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
              value={dateRange}
              onChange={setDateRange}
            />
          </Fieldset>
        </Popover.Dropdown>
      </Popover>

      <Divider my="md" />

      <Flex gap="xs">
        <Button  variant="filled" onClick={onSubmit} fullWidth>
          Submit
        </Button>

        <Button color="red" variant="light" onClick={onReset} fullWidth>
          Reset
        </Button>
      </Flex>
    </Card>
  );
}
