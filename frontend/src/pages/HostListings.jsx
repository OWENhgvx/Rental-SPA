import { useState, useEffect } from 'react';
import { SimpleGrid, Container, Title, Button, Badge,Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import HouseCard from '../components/HouseCard';
import ProfitChart from "../components/ProfitChart";
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail';

function HostListings() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  const [listingDetails, setListingDetails] = useState([]);
  const [houseNumber, setHouseNumber] = useState(0);

  // fetch data for chart
  const [bookings, setBookings] = useState({});

  async function fetchMyListings() {
    try {
      const allListings = await GetAllListing();

      const myIds = allListings
        .filter((l) => l.owner === userEmail)
        .map((l) => l.id);

      const cardInfos = await Promise.all(myIds.map((id) => GetCardInfo(id)));

      setHouseNumber(cardInfos.length);
      setListingDetails(cardInfos);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5005/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBookings(data.bookings || {});
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  }

  useEffect(() => {
    fetchMyListings();
    fetchBookings();  // add 
  }, [userEmail]);


  const handleDelete = async (id) =>{
    const ok =confirm('Are you sure?');
    if (!ok){
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5005/listings/${id}`,{
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (! res.ok){
        const err = await res.json();
        alert(err.error || 'Delete failed');
        return;
      }
      alert('Delete complete');
      fetchMyListings();
    } catch(err){
      console.error(err);
      alert('Delete error');
    }
  }


  return (
    <Container fluid px={20}>
      
      {/* title */}
      <Group position="apart" mb="md">
        <Group>
          <Title order={2}>My Host Listings</Title>
          <Badge size="lg" radius="sm" color="blue">
            {houseNumber} total
          </Badge>
        </Group>
  
        <Button
          variant="filled"
          color="green"
          radius="md"
          onClick={() => navigate('/host/create-listing')}
        >
          Create a new listing
        </Button>
      </Group>
  
      {/* profit chart */}
      <div
  style={{
    height: "300px",
    border: "1px dashed #aaa",
    borderRadius: "8px",
    marginBottom: "30px",

    paddingTop:"20px"
  
  }}
>
  <ProfitChart bookings={bookings} />
</div>

  
      {/* house listings */}
      {listingDetails.length === 0 ? (
        <Text c="dimmed">You have no listings yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, xl: 4 }}>
          {listingDetails.map((item) => (
            <HouseCard
              key={item.id}
              onDelete={handleDelete}
              pageState="host"
              cardInfo={item}
            />
          ))}
        </SimpleGrid>
      )}
  
    </Container>
  );
  
}

export default HostListings;
