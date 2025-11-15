// src/pages/ListingBook.jsx
import { useEffect, useState } from 'react';
import { Stack, Flex, Box, Group, Text, Badge, Rating, Title, Container } from '@mantine/core';
import { GetListingDetail } from '../api/GetListingDetail.js';
import { useParams, useLocation } from 'react-router-dom';
import ListingImageDisplay from '../components/ListingImageDisplay.jsx';
import RatingBox from '../components/RatingBox.jsx';
import BookListingBox from '../components/BookListingBox.jsx';
import CommentBar from '../components/CommentBar.jsx';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function ListingBook() {
  
  const { listingId } = useParams();
  const { state } = useLocation();
  const dateRange = state?.dates ?? [null, null];

  const [listingDetail, setListingDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const raw = await GetListingDetail(listingId);
        const l = raw ?? null;
        if (!cancelled) setListingDetail(l);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to load listing');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [listingId]);

  if (loading) return <Text c="dimmed">Loading…</Text>;
  if (err) return <Text c="red">{err}</Text>;
  if (!listingDetail) return <Text c="red">Not found</Text>;

  const thumbnail = listingDetail.thumbnail;
  const rawImages = listingDetail.metadata?.images || [];
  const listingImages=[];
  if (thumbnail) listingImages.push(thumbnail);
  rawImages.forEach(image => {
    if(image){
      listingImages.push(image);
    }
  });

  const hasRange = Array.isArray(dateRange) && dateRange[0] && dateRange[1];
  const nights = hasRange
    ? Math.max(0, Math.round((dateRange[1] - dateRange[0]) / MS_PER_DAY))
    : 0;

  const pricePerNight = Number(listingDetail.price ?? 0);
  const totalPrice = hasRange ? nights * pricePerNight : pricePerNight;
  const avaList = listingDetail.availability;

  return (
    <Container size='1500'>
      <Stack>
        <Title size={40} fw={700}>{listingDetail.title}</Title>
        <Flex direction={{ base: 'column', sm: 'row' }} align="flex-start" gap="md">
          <Box miw={500} style={{ flex: 1 }}>
            <ListingImageDisplay images={listingImages} />
          </Box>

          <Box size='lg' style={{ flex: 1 }}>
            <Stack gap="sm">
              {listingDetail.address && (
                <Text size="xl" c="black">
                  {listingDetail.metadata?.propertyType} in {listingDetail.address}
                </Text>
              )}

              <Text size="md" c='dimmed'>
                {listingDetail.metadata?.bedrooms} bedroom🛏️ |{' '}
                {listingDetail.metadata?.beds} {Number(listingDetail.metadata?.beds)===1?'bed😴':'beds😴'} |{' '}
                {listingDetail.metadata?.bathrooms} bathroom🛁
              </Text>

              <Title size="md">
                Amenities:{' '}
                <Group mt="xs">
                  {(listingDetail.metadata?.amenities || []).map((amenity, index) => (
                    <Badge size='lg' key={index} variant="light">
                      {amenity}
                    </Badge>
                  ))}
                </Group>

              </Title>
              {!hasRange ? (
                <>
                  <Title size='md'>Price Per Night:</Title>
                  <Text> ${pricePerNight}</Text>
                </>
              ) : (
                <>
                  <Text>
                    Total Price: ${totalPrice} ({nights} night{nights > 1 ? 's' : ''} · ${pricePerNight}/night)
                  </Text>
                </>
              )}

              <RatingBox reviews={listingDetail.reviews} />

              {typeof listingDetail.avgRating === 'number' && (
                <Group gap="xs" align="center">
                  <Rating value={listingDetail.avgRating} readOnly fractions={2} size="sm" />
                  <Badge variant="light">
                    {listingDetail.avgRating?.toFixed(2)}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {Array.isArray(listingDetail.reviews) ? listingDetail.reviews.length : 0} reviews
                  </Text>
                </Group>
              )}

              <BookListingBox
                daterange={hasRange ? dateRange : [null, null]}
                price={pricePerNight}
                listingid={listingId}
                excludedate={avaList}
              />
            </Stack>
          </Box>
        </Flex>
        <CommentBar listingId={listingId} />
      </Stack>
    </Container>
  );
}
