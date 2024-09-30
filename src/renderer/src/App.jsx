// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login'; 
import Register from './components/Register';
import Timer from './components/timer';
import AdminDashboard from './components/dashboard';


function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Register Route */}
        <Route path="/register" element={<Register />} />

        {/* Timer Route */}
        <Route path="/timer" element={<Timer />} />

         {/* Admin Dashborad Route */}
         <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
