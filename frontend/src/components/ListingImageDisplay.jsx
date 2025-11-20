// src/components/ListingImageDisplay.jsx
import { useState } from 'react';
import { Box, Image, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// Convert a string URL to a slide object
function toSlideFromString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!url) return null;

  if (url.includes('youtube.com/embed/')) {
    return { type: 'video', src: url };
  }

  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&]+)/);
    const id = match && match[1];
    if (id) {
      return { type: 'video', src: `https://www.youtube.com/embed/${id}` };
    }
  }

  if (url.includes('youtu.be/')) {
    const after = url.split('youtu.be/')[1] || '';
    const id = after.split(/[?&]/)[0];
    if (id) {
      return { type: 'video', src: `https://www.youtube.com/embed/${id}` };
    }
  }

  return { type: 'image', src: url };
}

export default function ListingImageDisplay({ images, height = 420 }) {
  const slides = (Array.isArray(images) ? images : images ? [images] : [])
    .map((item) => {
      if (typeof item === 'string') {
        return toSlideFromString(item);
      }
      if (item && typeof item === 'object') {
        if (item.type === 'video' || item.type === 'image') return item;
        if (item.src) return { type: 'image', src: item.src };
      }
      return null;
    })
    .filter((s) => s && s.src);

  const [index, setIndex] = useState(0);

  if (slides.length === 0) return null;

  const goLeft = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goRight = () => {
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const current = slides[index];

  return (
    <Box
      pos="relative"
      radius="md"
      style={{
        height,
        width: '100%',
      }}
    >
      {current.type === 'video' ? (
        <Box
          component="iframe"
          src={current.src}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            borderRadius: '8px',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <Image
          src={current.src}
          radius="md"
          fit="cover"
          w="100%"
          h="100%"
        />
      )}

      {slides.length > 1 && (
        <>
          <ActionIcon
            pos="absolute"
            radius="md"
            onClick={goLeft}
            style={{
              top: '50%',
              left: 12,
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>

          <ActionIcon
            pos="absolute"
            onClick={goRight}
            radius="md"
            style={{
              top: '50%',
              right: 12,
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </>
      )}
    </Box>
  );
}
