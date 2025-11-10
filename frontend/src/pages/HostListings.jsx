import { useState, useEffect } from 'react';
import { SimpleGrid, Container, Title, Text } from '@mantine/core';
import HouseCard from '../components/HouseCard';
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail';

function HostListings() {
  const [listingDetails, setListingDetails] = useState([]);
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    async function fetchMyListings() {
      try {
        const allListings = await GetAllListing();

        // Filter listings owned by the current user
        const myIds = allListings
          .filter((l) => l.owner === userEmail)
          .map((l) => l.id);

        // Fetch details for each listing concurrently
        const cardPromises = myIds.map((id) => GetCardInfo(id));
        const cardInfos = await Promise.all(cardPromises);

        setListingDetails(cardInfos);
      } catch (err) {
        console.error('Error fetching listings:', err);
      }
    }

    fetchMyListings();
  }, [userEmail]);

  return (
    <Container fluid px={20}>
      <Title order={2} mb="md">
        My Listings
      </Title>

      {listingDetails.length === 0 ? (
        <Text c="dimmed">You have no listings yet.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, xl: 5 }}>
          {listingDetails.map((item) => (
            <HouseCard
              key={item.id}
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
