// components/DateFilter.jsx
import { useState, useEffect } from 'react';
import { Popover, Fieldset, Button} from '@mantine/core';
import { DatePicker } from '@mantine/dates';

export default function DateFilter({ onCommit, resetDate }) {

  const [opened, setOpened] = useState(false);
  const [date, setDate] = useState([null,null]);
  
  //set if got value
  const picked = date[0] !== null || date[1] !== null;

  const dateText=date[0]===null?'Choose date':date[1]===null?`At ${date[0]}`:`From ${date[0]} To ${date[1]}`;
  const labelText=picked?dateText:"Choose date";

  useEffect(() => {
    setDate([null,null]);
    onCommit?.(null);
  }, [resetDate]);

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Button 
          variant={picked?'filled':'light'} 
          radius="xl" 
          onClick={
            () =>{
              setOpened(o => !o);
            }}
        >
          {labelText}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Fieldset legend="Choose date range" radius="md">
          <DatePicker allowDeselect
            value={date}
            type="range"
            onChange={setDate}
          />
        </Fieldset>
      </Popover.Dropdown>
    </Popover>
  );
}
