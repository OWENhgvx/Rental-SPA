// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
// import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreateListing from './pages/CreatingListing.jsx';
import ListingRequests from './pages/ListingRequests.jsx';
import HostListings from './pages/HostListings.jsx';


function App() {
  
  return (
    <Routes>
      {/* dashboard page */}
      {/* <Route path='/' element={<Dashboard />} /> */}

      {/* login page */}
      <Route path='/login' element={<Login />} />

      {/* register page */}
      <Route path='/register' element={<Register />} />

      {/* create listing page */}
      <Route path='/host/create-listing' element={<CreateListing />} />

      {/* creat listing request page */}
      <Route path='/host/listings/:listingId/requests' element={<ListingRequests />} />

      {/* host listings page */}
      <Route path='/host/listings' element={<HostListings />} />

    </Routes>
  )
}

export default App;
