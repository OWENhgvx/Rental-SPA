import {
  Group,
  Card,
  Image,
  Text,
  Badge,
  Rating,
  ActionIcon,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function HouseCard({ onEdit, onDelete, pageState, cardInfo }) {
  const {
    id,
    title,
    propertyType,
    address,
    thumbnail,
    price,
    bedrooms,
    bathrooms,
    reviewsNum,
    rating,
  } = cardInfo;

  const navigate = useNavigate();
  const safeReviews = reviewsNum ?? 0;
  const safeRating = typeof rating === 'number' ? rating : 0;

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const navigateDetail = (id) => {
    navigate(`/house/id=${id}`);
  };

  return (
    <Card
      onClick={() => navigateDetail(id)}
      shadow="sm"
      radius="lg"
      withBorder
      style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      sx={{
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Card.Section pos="relative">
        <Image
          src={thumbnail}
          alt="House image"
          height={200}

          fit="cover"
          style={{ objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        />

        {/* photo overlay gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.35))',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
          }}
        />

        {/* oberlay action icons for host page */}
        {pageState === 'host' && (
          <Group pos="absolute" top={10} right={10} gap="xs">
            <ActionIcon
              variant="filled"
              color="blue"
              radius="xl"
              size="lg"
              title="Edit"
              onClick={handleEditClick}
              style={{ transition: 'transform 0.2s ease' }}
              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
            >
              <IconEdit size={22} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="red"
              radius="xl"
              size="lg"
              title="Delete"
              onClick={handleDeleteClick}
              style={{ transition: 'transform 0.2s ease' }}
              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
            >
              <IconTrash size={22} />
            </ActionIcon>
          </Group>
        )}
      </Card.Section>

      <Text fw={600} fz="lg" mt="sm">
        {title}
      </Text>

      <Text c="dimmed" size="sm" mt={2}>
        {address}
      </Text>

      <Group mt="xs" gap="xs">
        <Badge variant="outline" color="gray">
          {propertyType}
        </Badge>
        <Badge color="blue">{bedrooms} BEDROOM</Badge>
        <Badge color="teal">{bathrooms} BATHROOM</Badge>
      </Group>

      <Group mt="sm" justify="space-between">
        <Badge color="violet" size="lg">
          ${price}/night
        </Badge>
        <Group gap={4}>
          <Rating value={safeRating} fractions={2} readOnly size="sm" />
          <Text size="sm" c="dimmed">
            {safeRating.toFixed(2)} · {safeReviews} reviews
          </Text>
        </Group>
      </Group>
    </Card>
  );
}

export default HouseCard;
