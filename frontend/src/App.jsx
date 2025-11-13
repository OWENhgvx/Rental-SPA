// import { useState } from 'react';
import { Routes, Route} from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreateListing from './pages/CreatingListing.jsx';
import ListingRequests from './pages/ListingRequests.jsx';
import HostListings from './pages/HostListings.jsx';
import AvailabilityPage from './pages/AvailabilityPage.jsx';  
import ListingBook from './pages/ListingBook.jsx';

export default function App() {
  
  return (
    <Routes>

      <Route element={<Layout />}>

        {/* dashboard page */}
        <Route path='/' element={<Dashboard />} />

        {/* create listing page */}
        <Route path='/host/create-listing' element={<CreateListing />} />

        {/* edit listing page */}
        <Route path="/host/listings/edit/:id" element={<CreateListing />} />

        {/* other routes can be added here */}
        <Route path='host/listings/:listingId/requests' element={<ListingRequests />} />

        {/* listing page  */}
        <Route path="/listings/:listingId" element={<ListingBook />} />

        {/* host listings page */}
        <Route path='/host/listings' element={<HostListings />} />

        {/* availability page */}
        <Route path='/host/listings/:id/availability' element={<AvailabilityPage />} />

      </Route>
      
      {/* login page */}
      <Route path='/login' element={<Login />} />

      {/* register page */}
      <Route path='/register' element={<Register />} />

    </Routes>
  )
}


