// src/components/RatingBox.jsx
import { useMemo, useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Rating,
  HoverCard,
  Modal,
  ScrollArea,
  Divider,
  Badge,
} from '@mantine/core';

export default function RatingBox({ reviews = [] }) {
  const [opened, setOpened] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);

  const { avg, total, counts } = useMemo(() => {
    const result = { avg: 0, total: reviews.length, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    if (reviews.length === 0) return result;

    let sum = 0;
    for (const r of reviews) {
      const s = Math.round(Number(r.rating) || 0);
      if (s >= 1 && s <= 5) {
        result.counts[s] += 1;
        sum += s;
      }
    }
    result.avg = sum / reviews.length;
    return result;
  }, [reviews]);

  const percentage = (star) => (total === 0 ? 0 : Math.round((counts[star] * 100) / total));

  const handleRowClick = (star) => {
    if (!counts[star]) return;
    setSelectedStar(star);
    setOpened(true);
  };

  const filteredReviews = useMemo(() => {
    if (!selectedStar) return [];
    return reviews.filter((r) => Math.round(Number(r.rating) || 0) === selectedStar);
  }, [reviews, selectedStar]);

  const breakdown = (
    <Stack gap={6}>
      <Text size="xs" fw={600}>
        Rating breakdown
      </Text>

      {[5, 4, 3, 2, 1].map((star) => (
        <Group
          key={star}
          justify="space-between"
          gap="xs"
          onClick={() => handleRowClick(star)}
          style={{
            cursor: counts[star] ? 'pointer' : 'default',
            opacity: counts[star] ? 1 : 0.4,
            userSelect: 'none',
          }}
        >
          <Group gap={6}>
            <Rating value={star} readOnly size="xs" />
            <Text size="xs">{star} star{star > 1 ? 's' : ''}</Text>
          </Group>
          <Group gap={8}>
            <Text size="xs" c="dimmed">{percentage(star)}%</Text>
            <Badge variant="light" size="xs">{counts[star]}</Badge>
          </Group>
        </Group>
      ))}
    </Stack>
  );

  return (
    <>
      <Card withBorder radius="md" p="xs" w="100%" >
        <HoverCard withArrow position="top" openDelay={150} closeDelay={80} withinPortal>
          <HoverCard.Target>
            <Group gap="xs" justify='center' align="center" style={{ cursor: total ? 'pointer' : 'default' }}>
              <Rating value={avg} readOnly fractions={2} size="sm" />
              <Text size="sm" fw={600}>{avg.toFixed(2)}</Text>
              <Text size="xs" c="dimmed">({total} reviews)</Text>
            </Group>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            {breakdown}
          </HoverCard.Dropdown>
        </HoverCard>
      </Card>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="lg"
        centered
        title={
          selectedStar ? (
            <Group gap="xs">
              <Rating value={selectedStar} readOnly size="sm" />
              <Text size="sm">
                {selectedStar} star{selectedStar > 1 ? 's' : ''} · {counts[selectedStar]} review{counts[selectedStar] !== 1 ? 's' : ''}
              </Text>
            </Group>
          ) : 'Reviews'
        }
      >
        <Divider mb="sm" />
        <ScrollArea h={340}>
          {filteredReviews.length === 0 ? (
            <Text size="sm" c="dimmed">No reviews with this rating yet.</Text>
          ) : (
            <Stack gap="sm">
              {filteredReviews.map((r, i) => (
                <Card key={i} withBorder radius="md" p="sm">
                  <Group justify="space-between" mb={4}>
                    <Group gap="xs" align="center">
                      <Rating value={r.rating} readOnly size="xs" />
                      {r.author && <Text size="xs" fw={500}>{r.author}</Text>}
                    </Group>
                    {r.date && <Text size="xs" c="dimmed">{r.date}</Text>}
                  </Group>
                  <Text size="sm">{r.comment}</Text>
                </Card>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Modal>
    </>
  );
}
