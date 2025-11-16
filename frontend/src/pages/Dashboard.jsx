import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, SimpleGrid, Text } from '@mantine/core';
import Searchbar from '../components/Searchbar';
import HouseCard from '../components/HouseCard';
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail.js';

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

  const [filters, setFilters] = useState({
    q: '',
    beds: null,
    dates: null,
    price: null,
    ratingSort: 'none',
  });

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

  const handleSearch = (payload) => {
    setFilters((prev) => ({ ...prev, ...payload }));
  };

  const visible = useMemo(() => {
    let list = allCards.filter((c) => {
      if (!matchesQuery(c, filters.q)) return false;

      if (filters.beds && Array.isArray(filters.beds)) {
        const [mn, mx] = filters.beds;
        if (!between(c.bedrooms, mn, mx)) return false;
      }

      if (filters.price && Array.isArray(filters.price)) {
        const [mn, mx] = filters.price;
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

    if (filters.ratingSort === 'desc') {
      list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    } else if (filters.ratingSort === 'asc') {
      list.sort((a, b) => Number(a.rating ?? 0) - Number(b.rating ?? 0));
    } else {
      list.sort((a, b) =>
        String(a.title || '').localeCompare(String(b.title || ''))
      );
    }

    return list;
  }, [allCards, filters]);

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
