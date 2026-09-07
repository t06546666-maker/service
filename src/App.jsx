import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import HowItWorks from './components/HowItWorks/HowItWorks';
import FeaturedServices from './components/FeaturedServices/FeaturedServices';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkersList from './pages/Workers/WorkersList';
import ProfessionalDashboard from './pages/Admin/ProfessionalDashboard';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import AIAssistant from './components/AIAssistant/AIAssistant';

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
          <Route path="/admin" element={<ProfessionalDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
