// src/components/RatingBox.jsx
import { useMemo, useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Rating,
  Tooltip,
  Modal,
  ScrollArea,
  Divider
} from '@mantine/core';

// reviews: [{ rating: number(1~5), comment: string, date?: string }, ...]
export default function RatingBox({ reviews = [] }) {
  const [opened, setOpened] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);

  // count for the rate
  const { avg, total, counts } = useMemo(() => {
    const result = { avg: 0, total: reviews.length, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

    if (reviews.length === 0) {
      return result;
    }

    let sum = 0;
    for (const r of reviews) {
      const score = Math.round(r.rating || 0);
      if (score >= 1 && score <= 5) {
        result.counts[score] += 1;
        sum += score;
      }
    }
    result.avg = sum / reviews.length;

    return result;
  }, [reviews]);

  const percentage = (star) =>
    total === 0 ? 0 : Math.round((counts[star] * 100) / total);

  const handleRowClick = (star) => {
    if (!counts[star]) return;
    setSelectedStar(star);
    setOpened(true);
  };

  const filteredReviews = useMemo(
    () => reviews.filter((r) => Math.round(r.rating) === selectedStar),
    [reviews, selectedStar],
  );

  // Tooltip 里显示的内容（星级分布）
  const tooltipContent = (
    <Stack gap={4}>
      <Text size="xs" fw={500}>
        Rating breakdown
      </Text>
      {([5, 4, 3, 2, 1]).map((star) => (
        <Group
          key={star}
          justify="space-between"
          gap="xs"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleRowClick(star);
          }}
          style={{
            cursor: counts[star] ? 'pointer' : 'default',
            opacity: counts[star] ? 1 : 0.4,
          }}
        >
          <Group gap={4}>
            <Rating value={star} readOnly size="xs" />
            <Text size="xs">{star} star{star > 1 ? 's' : ''}</Text>
          </Group>

          <Group gap={6}>
            <Text size="xs" c="dimmed">
              {percentage(star)}%
            </Text>
            <Text size="xs" c="dimmed">
              ({counts[star]})
            </Text>
          </Group>
        </Group>
      ))}
    </Stack>
  );

  return (
    <>
      <Card
        withBorder
        radius="md"
        padding="xs"
        style={{ display: 'inline-block' }}
      >
        <Tooltip
          label={tooltipContent}
          multiline
          width={260}
          position="top"
          transitionProps={{ duration: 150 }}
          withinPortal
        >
          <Group gap="xs" align="center">
            <Rating value={avg} readOnly fractions={2} size="sm" />
            <Text size="sm" fw={500}>
              {avg.toFixed(2)}
            </Text>
            <Text size="xs" c="dimmed">
              ({total} reviews)
            </Text>
          </Group>
        </Tooltip>
      </Card>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          selectedStar
            ? `Reviews with ${selectedStar}-star rating`
            : 'Reviews'
        }
        size="lg"
        centered
      >
        <Stack gap="sm">
          {selectedStar && (
            <Group justify="space-between">
              <Group gap="xs">
                <Rating value={selectedStar} readOnly size="sm" />
                <Text size="sm">
                  {selectedStar} star{selectedStar > 1 ? 's' : ''}
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {counts[selectedStar]} review{counts[selectedStar] !== 1 ? 's' : ''}
              </Text>
            </Group>
          )}

          <Divider />

          <ScrollArea h={320}>
            {filteredReviews.length === 0 && (
              <Text size="sm" c="dimmed">
                No reviews with this rating yet.
              </Text>
            )}

            {filteredReviews.map((r, idx) => (
              <Card
                key={idx}
                withBorder
                radius="md"
                padding="sm"
                mb="sm"
              >
                <Group justify="space-between" mb={4}>
                  <Group gap="xs" align="center">
                    <Rating value={r.rating} readOnly size="xs" />
                    {r.author && (
                      <Text size="xs" fw={500}>
                        {r.author}
                      </Text>
                    )}
                  </Group>
                  {r.date && (
                    <Text size="xs" c="dimmed">
                      {r.date}
                    </Text>
                  )}
                </Group>

                <Text size="sm">{r.comment}</Text>
              </Card>
            ))}
          </ScrollArea>
        </Stack>
      </Modal>
    </>
  );
}
