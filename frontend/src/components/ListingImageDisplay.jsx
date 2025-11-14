import { useState } from 'react';
import { Box, Image, ActionIcon} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export default function ListingImageDisplay({ images }) {


  const [index,setIndex]=useState(0);

  const goLeft=()=>{
    if (index!==0){
      setIndex(index-1)
    }
  };

  const goRight=()=>{
    if (index!==(images.length-1)){
      setIndex(index+1)
    }
  };

  return (
    <Box
      pos='relative'
      radius='md'
      style={{
        height:360,
        width:'100%'
      }}
    >
      <Image
        src={images[index]}
        radius='md'
        fit="cover"            // ← 铺满容器
        w="100%"
        h="100%"
      />

      <ActionIcon
        pos='absolute'
        radius='md'
        onClick={goLeft}
        style={{
          top:'50%',
          left:12,
          transform:'translateY(-50%)',
        }}
      >
        <IconChevronLeft size={18} />
      </ActionIcon>

      <ActionIcon
        pos='absolute'
        onClick={goRight}
        radius='md'
        style={{
          top:'50%',
          right:12,
          transform:'translateY(-50%)',
        }}
      >
        <IconChevronRight size={18} />
      </ActionIcon>
    </Box>
  )

}
