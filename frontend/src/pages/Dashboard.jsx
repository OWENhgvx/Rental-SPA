import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, SimpleGrid, Text } from '@mantine/core';
import Searchbar from '../components/Searchbar';
import HouseCard from '../components/HouseCard';
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail.js';
import { GetUserBookingDetail } from '../api/BookingApi.js';

function matchesQuery(card, q) {
  if (!q || !q.trim()) return true;
  const words = q.trim().toLowerCase().split(/\s+/);
  const hay = (
    (card.title || '') + ' ' +
    (card.address || '') + ' ' +
    (card.propertyType || '')
  ).toLowerCase();
  return words.every((w) => hay.includes(w));
}

function between(x, min, max) {
  const n = Number(x);
  return Number.isFinite(n) && n >= min && n <= max;
}

function toDayTime(d) {
  if (!d) return null;

  if (d instanceof Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  if (typeof d === 'string') {
    const tmp = new Date(d);
    if (!Number.isFinite(tmp.getTime())) return null;
    return new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate()).getTime();
  }

  return null;
}

function isAvailableForRange(card, userStart, userEnd) {
  if (!card.availability || !Array.isArray(card.availability)) return false;

  const uStart = toDayTime(userStart);
  const uEnd = toDayTime(userEnd);
  if (uStart == null || uEnd == null) return false;

  return card.availability.some((slot) => {
    const s = toDayTime(slot.start);
    const e = toDayTime(slot.end);
    if (s == null || e == null) return false;

    return s <= uStart && e >= uEnd;
  });
}

export default function Dashboard() {
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [priorityListingIds, setPriorityListingIds] = useState([]);

  const [filters, setFilters] = useState({
    q: '',
    beds: null,
    dates: null,
    price: null,
    ratingSort: 'none',
  });

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const list = await GetAllListing();
        const ids = (list || []).map((it) => it.id);

        const settled = await Promise.allSettled(
          ids.map((id) => GetCardInfo(id))
        );

        const availableCards = settled
          .filter((result) => result.status === 'fulfilled' && result.value.published)
          .map((result) => result);

        const cards = availableCards
          .map((res, i) => {
            if (res.status === 'fulfilled') return res.value;
            console.error('GetCardInfo error for id', ids[i], res.reason);
            return null;
          })
          .filter(Boolean);

        if (!cancelled) setAllCards(cards);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load listings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token || !email) {
        setPriorityListingIds([]);
        return;
      }

      try {
        const bookings = await GetUserBookingDetail(token, email);
        if (cancelled) return;

        const ids = [];
        bookings.forEach((b) => {
          if (b.status === 'accepted' || b.status === 'pending') {
            if (!ids.includes(b.listingId)) {
              ids.push(b.listingId);
            }
          }
        });

        setPriorityListingIds(ids);
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load user bookings for dashboard', e);
          setPriorityListingIds([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token, email]);

  const handleSearch = (payload) => {
    setFilters((prev) => ({ ...prev, ...payload }));
  };

  const visible = useMemo(() => {
    const prioritySet = new Set(priorityListingIds.map((id) => String(id)));

    let list = allCards.filter((c) => {
      if (!matchesQuery(c, filters.q)) return false;

      let bedRange = null;
      if (filters.beds) {
        if (Array.isArray(filters.beds)) {
          bedRange = filters.beds;
        } else if (Array.isArray(filters.beds.range)) {
          bedRange = filters.beds.range;
        }
      }
      if (bedRange && Array.isArray(bedRange)) {
        const [mn, mx] = bedRange;
        if (!between(c.bedrooms, mn, mx)) return false;
      }

      let priceRange = null;
      if (filters.price) {
        if (Array.isArray(filters.price)) {
          priceRange = filters.price;
        } else if (Array.isArray(filters.price.range)) {
          priceRange = filters.price.range;
        }
      }
      if (priceRange && Array.isArray(priceRange)) {
        const [mn, mx] = priceRange;
        if (!between(c.price, mn, mx)) return false;
      }

      if (filters.dates && Array.isArray(filters.dates)) {
        const [start, end] = filters.dates;
        if (start && end) {
          if (!isAvailableForRange(c, start, end)) return false;
        }
      }

      return true;
    });

    const bedSort =
      filters.beds && typeof filters.beds.sort === 'string'
        ? filters.beds.sort
        : 'none';

    const priceSort =
      filters.price && typeof filters.price.sort === 'string'
        ? filters.price.sort
        : 'none';

    const priorityList = [];
    const normalList = [];

    list.forEach((card) => {
      if (prioritySet.has(String(card.id))) {
        priorityList.push(card);
      } else {
        normalList.push(card);
      }
    });

    const sortFn = (a, b) => {
      if (filters.ratingSort === 'desc') {
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      } else if (filters.ratingSort === 'asc') {
        return Number(a.rating ?? 0) - Number(b.rating ?? 0);
      }

      if (priceSort === 'asc') {
        return Number(a.price ?? 0) - Number(b.price ?? 0);
      } else if (priceSort === 'desc') {
        return Number(b.price ?? 0) - Number(a.price ?? 0);
      }

      if (bedSort === 'asc') {
        return Number(a.bedrooms ?? 0) - Number(b.bedrooms ?? 0);
      } else if (bedSort === 'desc') {
        return Number(b.bedrooms ?? 0) - Number(a.bedrooms ?? 0);
      }

      return String(a.title || '').localeCompare(String(b.title || ''));
    };

    priorityList.sort(sortFn);

    normalList.sort((a, b) =>
      String(a.title || '').localeCompare(String(b.title || ''))
    );

    return [...priorityList, ...normalList];
  }, [allCards, filters, priorityListingIds]);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Searchbar onSearch={handleSearch} />

        {loading && <Text c="dimmed">Loading listings…</Text>}
        {error && <Text c="red">{error}</Text>}

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {visible.map((card) => (
            <HouseCard
              key={card.id}
              pageState="guest"
              cardInfo={card}
              searchDates={filters.dates}
            />
          ))}
        </SimpleGrid>

        {!loading && !error && visible.length === 0 && (
          <Text ta="center" c="dimmed">
            No results. Try adjusting your filters.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
