import { useState, useEffect } from 'react';
import { Popover, Fieldset, Button, RangeSlider } from '@mantine/core';

export default function BedFilter({
  onCommit,
  resetBed,
  min=0,
  max=8,
  step=1,
}) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(false); 
  const [range, setRange]   = useState([null, null]);
  const [sort, setSort] = useState('none');

  useEffect(() => {
    setOpened(false);
    setActive(false);
    setRange([null, null]);
    setSort('none');
    onCommit?.({ range: null, sort: 'none' });
  }, [resetBed, onCommit]);

  const toText = (v) => (v >= max ? `${max}+` : String(v));

  const sortSuffix =
    sort === 'asc' ? ' (low → high)' :
      sort === 'desc' ? ' (high → low)' :
        '';

  const label = !active
    ? 'Choose bedroom number'
    : range[0] != null && range[1] != null
      ? (range[0] === range[1]
        ? `Bedroom Number: ${toText(range[0])}${sortSuffix}`
        : `Bedroom Number: ${toText(range[0])}–${toText(range[1])}${sortSuffix}`)
      : `Bedroom Number: ${min}–${max}+${sortSuffix}`;

  const onButtonClick = () => {
    if (!opened) {
      setOpened(true);
      setActive(true);
      if (range[0] == null && range[1] == null) setRange([min, max]);
    } else {
      setOpened(false);
    }
  };

  const sliderValue = [range[0] ?? min, range[1] ?? max];

  const marks = Array.from({ length: max - min + 1 }, (_, i) => {
    const v = min + i;
    return { value: v, label: v === max ? `${max}+` : String(v) };
  });

  const toggleSort = () => {
    const next = sort === 'none' ? 'asc' : sort === 'asc' ? 'desc' : 'none';
    setSort(next);

    const payload = {
      range: (range[0] == null && range[1] == null) ? null : range,
      sort: next,
    };
    onCommit?.(payload);
  };

  const sortLabel =
    sort === 'none'
      ? 'Sort: none'
      : sort === 'asc'
        ? 'Sort: Bedroom low → high'
        : 'Sort: Bedroom high → low';

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Button radius="xl" variant={active ? 'filled' : 'light'} onClick={onButtonClick}>
          {label}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Fieldset legend="Choose your bedroom number" radius="md" style={{ minWidth: 280 }}>
          <RangeSlider
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={setRange}
            onChangeEnd={(final) => {
              setRange(final);
              setActive(true);
              onCommit?.({ range: final, sort });
            }}
            minRange={0}
            marks={marks}
            label={(v) => (v >= max ? `${max}+` : String(v))}
            styles={{
              markLabel: { position: 'absolute', transform: 'translateX(-50%)' },
              marks: { position: 'relative' },
            }}
            w="100%"
          />

          <Button
            mt="xl"
            variant="light"
            fullWidth
            onClick={toggleSort}
          >
            {sortLabel}
          </Button>
        </Fieldset>
      </Popover.Dropdown>
    </Popover>
  );
}
