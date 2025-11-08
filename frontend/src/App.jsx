// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
// import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreateListing from './pages/CreatingListing.jsx';
import ListingRequests from './pages/ListingRequests.jsx';


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

      {/* other routes can be added here */}
      <Route path='host/listings/:listingId/requests' element={<ListingRequests />} />

    </Routes>
  )
}

export default App;
