import { useEffect, useState } from 'react';
import { Button} from '@mantine/core';
import {
  IconArrowsSort,
  IconSortDescending,
  IconSortAscending,
} from '@tabler/icons-react';


function RateFilter({onCommit,resetRate}){

  // when set state to none it's normal state
  const [state,setState]=useState('none');

  useEffect(()=>{
    setState('none');
	  onCommit?.('none');
  },[resetRate]);

  const handleClick=()=>{
    if (state==='none'){
      setState('desc');
      onCommit?.('desc')
    }
    else if(state==='desc'){
      setState('asc');
      onCommit?.('asc')
    }
    else{
      setState('desc');
      onCommit?.('desc')
    }
  };

  // This is the click state 
  const isClick=!(state==='none');

  // set button icon
  const IconRight= state === 'desc'? IconSortDescending: state === 'asc'? IconSortAscending: IconArrowsSort;

  const label = state === 'desc'? 'Rate high to low': state === 'asc'? 'Rate low to high': 'Comment Rate';


	  return (
    <Button 
      radius='xl'
      color='blue'
      variant={isClick?'filled':'subtle'}
      onClick={handleClick}
      rightSection={<IconRight size={12}/>}
    >
		  {label}
    </Button>

  );
}

export default RateFilter;