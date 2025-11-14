// components/PriceFilter.jsx
import { useState, useEffect } from 'react';
import { Popover, Fieldset, Button, RangeSlider } from '@mantine/core';

export default function PriceFilter({
  onCommit,
  resetPrice,
  min=0,
  max=2000,
  step=50,
}) {
  const [opened, setOpened]=useState(false);
  const [active, setActive]=useState(false);
  const [range, setRange]=useState([null, null]);
  useEffect(()=>{
    setOpened(false);
    setActive(false);
    setRange([null, null]);
    onCommit?.(null);
  }, [resetPrice,onCommit]);

  const nf=new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 });
  const toText=(v)=> (v >= max ? `${nf.format(max)}+` : nf.format(v));

  const label = !active
    ? 'Choose price'
    : range[0] != null && range[1] != null
      ? (range[0] === range[1]
        ? `Price: $${toText(range[0])}`
        : `Price: $${toText(range[0])}–$${toText(range[1])}`)
      : `Price: $${toText(min)}–$${toText(max)}`;

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

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Button radius="xl" variant={active ? 'filled' : 'light'} onClick={onButtonClick}>
          {label}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Fieldset legend="Price ($/night)" radius="md" style={{ minWidth: 280 }}>
          <RangeSlider
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={setRange}
            minRange={0}
            label={(v) => `$${toText(v)}`}
            onChangeEnd={(final) => {
              setRange(final);
              setActive(true);
              onCommit?.(final);
            }}
          />
        </Fieldset>
      </Popover.Dropdown>
    </Popover>
  );
}
