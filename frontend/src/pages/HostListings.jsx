import { useState, useEffect } from 'react';
import { SimpleGrid, Container, Title, Button, Badge, Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import HouseCard from '../components/HouseCard';
import ProfitChart from "../components/ProfitChart";
import { GetAllListing, GetCardInfo } from '../api/GetListingDetail';

function HostListings() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  const [myIds, setMyIds] = useState([]);
  const [listingDetails, setListingDetails] = useState([]);
  const [houseNumber, setHouseNumber] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);  // 仅图表使用

  // 1) 拉取我的 listing（owner === 当前用户）
  async function fetchMyListings() {
    try {
      const allListings = await GetAllListing();

      const ids = allListings
        .filter((l) => l.owner === userEmail)
        .map((l) => String(l.id));

      setMyIds(ids);

      const cardInfos = await Promise.all(ids.map((id) => GetCardInfo(id)));

      setHouseNumber(cardInfos.length);
      setListingDetails(cardInfos);
    } catch (err) {
      console.error(err);
    }
  }

  // 2) 拉取所有 bookings（暂不筛选）
  async function fetchBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5005/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const allBookings = data.bookings ? Object.values(data.bookings) : [];

      setBookings(allBookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  }

  // 3) 根据 myIds 从 bookings 中筛选属于我的
  useEffect(() => {
    if (myIds.length === 0) {
      setMyBookings([]);
      return;
    }

    const mine = bookings.filter((b) =>
      myIds.includes(String(b.listingId))
    );

    setMyBookings(mine);
  }, [myIds, bookings]);

  // 4) 初始加载
  useEffect(() => {
    fetchMyListings();
    fetchBookings();
  }, [userEmail]);

  // 删除房源
  const handleDelete = async (id) => {
    const ok = confirm('Are you sure?');
    if (!ok) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5005/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Delete failed');
        return;
      }

      alert('Delete complete');
      fetchMyListings();
    } catch (err) {
      console.error(err);
      alert('Delete error');
    }
  };

  // ====== UI ======
  return (
    <Container fluid px={20}>
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

      {/* Profit Chart */}
      <div
        style={{
          height: "300px",
          border: "1px dashed #aaa",
          borderRadius: "8px",
          marginBottom: "30px",
          paddingTop: "20px",
        }}
      >
        <ProfitChart bookings={myBookings} />
      </div>

      {/* Listing Cards */}
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
