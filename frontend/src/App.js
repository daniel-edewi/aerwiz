import React from 'react';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import FlightsPage from './pages/FlightsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import AlertsPage from './pages/AlertsPage';
import BaggagePage from './pages/BaggagePage';



function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seats" element={<SeatSelectionPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/baggage" element={<BaggagePage />} />
        
      </Routes>
    </Router>
  );
}

export default App;