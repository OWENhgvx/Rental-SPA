// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Stack,
  SimpleGrid,
  Text,
} from '@mantine/core';

import Searchbar from '../components/Searchbar';
import HouseCard from '../components/HouseCard';
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail.js';

// 关键词匹配：在 title / address / propertyType 上做不区分大小写的包含
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

// 数值区间判断
function between(x, min, max) {
  const n = Number(x);
  return Number.isFinite(n) && n >= min && n <= max;
}

export default function Dashboard() {
  // 所有卡片（来自服务端）
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // 从 Searchbar 收集的筛选条件
  const [filters, setFilters] = useState({
    q: '',
    beds: null,         // [min, max] | null —— 用 bedrooms 来过滤
    dates: null,        // [startDate, endDate] | null —— 当前不用于过滤，可透传到详情页
    price: null,        // [min, max] | null
    ratingSort: 'none', // 'none' | 'desc' | 'asc'
  });

  // 首次挂载：拉取列表 -> 并发取每个卡片信息
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) 取所有 listing 的 id
        const list = await GetAllListing(); // 返回所有 listing（含 id）
        const ids = (list || []).map((it) => it.id ?? it.listingId ?? it);
        // console.log('all ids:', ids);

        // 2) 并发获取卡片详情；使用 allSettled 防止单个失败拖垮整体
        const settled = await Promise.allSettled(
          ids.map((id) => GetCardInfo(id))
        );

        const cards = settled
          .map((res, i) => {
            if (res.status === 'fulfilled') return res.value;
            console.error('GetCardInfo error for id', ids[i], res.reason);
            return null;
          })
          .filter(Boolean);

        // console.log('cards:', cards);

        if (!cancelled) setAllCards(cards);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load listings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Searchbar 回调：拿到条件 -> 存起来
  const handleSearch = (payload) => {
    setFilters((prev) => ({ ...prev, ...payload }));
  };

  // 过滤 + 排序（基于 cardInfo 字段）
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

      // dates: 当前后端未提供可用区间，这里不做过滤
      return true;
    });

    // 排序：评分 or 默认标题
    if (filters.ratingSort === 'desc') {
      list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    } else if (filters.ratingSort === 'asc') {
      list.sort((a, b) => Number(a.rating ?? 0) - Number(b.rating ?? 0));
    } else {
      list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    }

    return list;
  }, [allCards, filters]);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        {/* 顶部搜索 + 筛选条 */}
        <Searchbar onSearch={handleSearch} />

        {/* 加载/错误状态（简版） */}
        {loading && <Text c="dimmed">Loading listings…</Text>}
        {error && <Text c="red">{error}</Text>}

        {/* 结果列表：用你的 HouseCard 渲染 */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {visible.map((card) => (
            <HouseCard
              key={card.id}
              pageState="guest"   // dashboard 是游客视图，不显示 Host 的编辑按钮
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
