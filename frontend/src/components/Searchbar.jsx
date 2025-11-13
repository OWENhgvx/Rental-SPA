import { useState } from 'react';
import { Stack, Group, TextInput, Button, Fieldset } from '@mantine/core';

import BedFilter   from './BedFilter';
import DateFilter  from './DateFilter';
import PriceFilter from './PriceFilter';
import RateFilter  from './RateFilter';

export default function Searchbar({ onSearch }) {

  const [query, setQuery] = useState('');
  const [beds, setBeds]       = useState(null);           // [min, max] | null
  const [dates, setDates]     = useState(null);           // [startDate, endDate] | null
  const [price, setPrice]     = useState(null);           // [min, max] | null
  const [rating, setRating]   = useState('none');
  // 用一个令牌通知子组件清空（+1 就会触发它们的 useEffect）
  const [resetToken, setResetToken] = useState(0);

  const doSearch = () => {
    onSearch?.({
      q: query.trim(),
      beds,
      dates,
      price,
      ratingSort: rating,
    });
  };

  const resetAll = () => {
    setBeds(null);
    setDates(null);
    setPrice(null);
    setRating('none');
    setResetToken(t => t + 1);   // 通知所有子筛选器复位
  };

  return (
    <Stack gap="xs">
      {/* 顶部：输入框 + Search + Reset */}
      <Group wrap="nowrap" gap="sm" align="flex-start">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          radius="xl"
          size="md"
          placeholder="Search title or city..."
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          style={{ flex: 1 }}
        />
        <Button variant="filled" onClick={doSearch}>Search</Button>
        <Button variant="light" color='red' onClick={resetAll}>Reset</Button>
      </Group>

      {/* 下方：四个筛选器 */}
      <Fieldset legend="Filters" radius="md">
        <Group gap="sm" wrap="wrap">
          <BedFilter
            onCommit={setBeds}
            resetBed={resetToken}
            min={0}
            max={8}
            step={1}
          />
          <DateFilter
            onCommit={setDates}
            resetDate={resetToken}
          />
          <PriceFilter
            onCommit={setPrice}
            resetPrice={resetToken}
            min={0}
            max={2000}
            step={10}
          />
          <RateFilter
            onCommit={setRating}
            resetRate={resetToken}
          />
        </Group>
      </Fieldset>
    </Stack>
  );
}
