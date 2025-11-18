import { useState } from 'react';
import {Group,Card,Image,Text,Badge,Rating,ActionIcon,Button} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconTrash } from '@tabler/icons-react';

// import PropTypes from 'prop-types';
function toYouTubeEmbedUrl(url) {
  if (typeof url !== 'string') return null;

  try {
    const u = new URL(url);

    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }

    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url;

      const id = u.searchParams.get('v');
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }

    return null;
  } catch {
    return null;
  }
}

function HouseCard({ onDelete, onRefresh, pageState, cardInfo }) {
  // detailed house info
  const {
    id,
    title,
    propertyType,
    address,
    thumbnail,
    price,
    bedrooms,
    beds,
    bathrooms,
    reviewsNum,
    rating,
    published,
  } = cardInfo;

  const navigate = useNavigate();
  const safeReviews = reviewsNum ?? 0;
  const safeRating = typeof rating === 'number' ? rating : 0;
  const [thumbHovered, setThumbHovered] = useState(false);

  // check if thumbnail is a youtube url
  const isYouTubeThumb =
    typeof thumbnail === 'string' &&
    (thumbnail.includes('youtube.com') || thumbnail.includes('youtu.be'));
 
  const embedUrl = isYouTubeThumb ? toYouTubeEmbedUrl(thumbnail) : null;

  // construct youtube embed url with autoplay if hovered
  const currentYoutubeSrc = (() => {
    if (!embedUrl) return null;
    const base = embedUrl;
    const autoPart = 'autoplay=1&mute=1&controls=0&rel=0';
    if (!thumbHovered) return base;
    if (base.includes('?')) return `${base}&${autoPart}`;
    return `${base}?${autoPart}`;
  })();

  // handle edit click
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigateEdit(id);
    // onEdit?.(id);
  };

  // handle delete click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  // navigate to house detail
  const navigateDetail = (id) => {
    if (pageState == 'guest') {
      navigate(`/listings/${id}`);
      return;
    }
    navigate(`/host/listings/${id}/requests`);
  };

  // navigate to house edit page
  const navigateEdit = (id) => {
    navigate(`/host/listings/edit/${id}`);
  };

  const handleTogglePublish = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');

    if (published) {
      try {
        const res = await fetch(
          `http://localhost:5005/listings/unpublish/${id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: null,
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to toggle publish state');
        }

        alert(
          published
            ? 'Listing unpublished successfully'
            : 'Listing published successfully',
        );
        onRefresh?.();
      } catch (error) {
        alert(error.message);
      }
    } else {
      navigate(`/host/listings/${id}/availability`);
    }
  };

  return (
    <Card
      onClick={() => navigateDetail(id)}
      shadow="sm"
      radius="lg"
      withBorder
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      sx={{
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Card.Section
        pos="relative"
        onMouseEnter={() => setThumbHovered(true)}
        onMouseLeave={() => setThumbHovered(false)}
      >
        {isYouTubeThumb && embedUrl ? (
          <iframe
            src={currentYoutubeSrc}
            title={title || 'Listing video'}
            width="100%"
            height={200}
            style={{
              border: 0,
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Image
            src={thumbnail}
            alt="House image"
            height={200}
            fit="cover"
            style={{
              objectFit: 'cover',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
          />
        )}

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

      <Group justify="space-between" mt="sm">
        <Text fw={600}>{title}</Text>
        <Badge variant="light">{propertyType}</Badge>
      </Group>

      <Text c="dimmed" size="sm">
        {address}
      </Text>

      <Group gap="xs" mt="xs">
        <Badge>
          {bedrooms} {bedrooms === 1 ? 'BEDROOM' : 'BEDROOMS'}
        </Badge>
        <Badge>
          {beds} {beds === 1 ? 'BED' : 'BEDS'}
        </Badge>
        <Badge>{bathrooms} BATHROOM</Badge>
        <Badge color="violet">${price}/night</Badge>
      </Group>

      <Group mt="sm" justify="center">
        <Group gap={4}>
          <Rating value={safeRating} fractions={2} readOnly size="sm" />
          <Text size="sm" c="dimmed">
            {safeRating.toFixed(2)} ({safeReviews} reviews)
          </Text>
        </Group>
      </Group>

      {pageState === 'host' && (
        <Group mt="md" justify="center" gap="md">
          <Button
            color={published ? 'red' : 'green'}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(e);
            }}
          >
            {published ? 'Unpublish' : 'Publish'}
          </Button>

          {published === true && (
            <Button
              variant="outline"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/host/listings/${id}/availability`);
              }}
            >
              Edit Dates
            </Button>
          )}
        </Group>
      )}
    </Card>
  );
}

export default HouseCard;
