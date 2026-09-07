import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import HowItWorks from './components/HowItWorks/HowItWorks';
import FeaturedServices from './components/FeaturedServices/FeaturedServices';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <Categories />
      <HowItWorks />
      <FeaturedServices />
    </div>
  );
}

export default App;
