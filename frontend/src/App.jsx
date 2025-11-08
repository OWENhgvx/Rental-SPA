// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';


function App() {
  
  return (
    <Routes>
      {/* dashboard page */}
      <Route path='/' element={<Dashboard />} />

      {/* login page */}
      <Route path='/login' element={<Login />} />

      {/* register page */}
      <Route path='/register' element={<Register />} />

    </Routes>
  )
}

export default App;
