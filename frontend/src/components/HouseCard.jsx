import {
  Group,
  Card,
  Image,
  Text,
  Badge,
  Rating,
  Button,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function HouseCard({onEdit,onDelete,pageState,cardInfo}){

  // detailed house info
  const {
    id,
    title,
    propertyType,
    address,
    thumbnail,
    price,
    bedrooms,
    bathrooms,
    reviewsNum,
    rating
  }=cardInfo;

  const navigate=useNavigate();

  const safeReviews = reviewsNum ?? 0;
  const safeRating = typeof rating === 'number' ? rating : 0;

  // we got two  page state
  // if page state is dashboard, then we are in dashboard page
  // if page state is other value,we are in other page

  const handleEditClick=(e)=>{
    e.stopPropagation();
    onEdit?.(id);
  };

  const handleDeleteClick=(e)=>{
    e.stopPropagation();
    onDelete?.(id);
  };

  // navigate to house detail
  const navigateDetail=(id)=>{
    navigate(`/house/id=${id}`)
  };

  return(
    <Card
      onClick={()=>navigateDetail(id)}
      shadow='sm'
      radius='md'
      withBorder
    >

      {/* only show when the state is host */}
      {pageState ==='host' && (
        <Group
          justify='flex-end'
        >
          {/* edit button */}
          <Button
            variant='light'
            color='blue'
            onClick={handleEditClick}
          >Edit</Button> 

          {/* delete button  */}
          <Button
            variant='light'
            color='red'
            onClick={handleDeleteClick}

          >Delete</Button> 
        </Group>
      )}

      <Card.Section>

        {/* image part */}
        <Image 
          src={thumbnail}
          alt='House image'
          h={180}
          fit='cover'
        />
      </Card.Section>

      <Group justify="space-between" mt="sm">
        <Text fw={600}>{title}</Text>
        <Badge variant="light">{propertyType}</Badge>
      </Group>

      <Text c="dimmed" size="sm">
        {address}
      </Text>

      <Group gap="xs" mt="xs">
        <Badge>{bedrooms} BEDROOM</Badge>
        <Badge>{bathrooms} BATHROOM</Badge>
        <Badge color="grape">${price}/night</Badge>
      </Group>

      <Group mt="xs" gap="xs" align="center">
        <Rating value={safeRating} fractions={2} readOnly size="sm" />
        <Text size="sm" c="dimmed">
          {safeRating?.toFixed(2)} · {safeReviews} reviews
        </Text>
      </Group>
      
    </Card>

  );

}

export default HouseCard;