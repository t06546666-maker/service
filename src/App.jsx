import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import HowItWorks from './components/HowItWorks/HowItWorks';
import FeaturedServices from './components/FeaturedServices/FeaturedServices';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkersList from './pages/Workers/WorkersList';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Categories />
              <HowItWorks />
              <FeaturedServices />
            </>
          } />
          <Route path="/workers" element={<WorkersList />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
