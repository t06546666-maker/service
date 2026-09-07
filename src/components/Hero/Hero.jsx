import React, { useState } from 'react';
import './Hero.css';

export default function Hero() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      alert(`Searching for: ${searchValue}`);
    } else {
      alert('Please enter a service to search.');
    }
  };

  const handleTagClick = (tag) => {
    setSearchValue(tag);
    alert(`Searching for: ${tag}`);
  };

  return (
    <section className="homa-hero">
        <div className="homa-hero-inner">
          <div className="homa-hero-content">
            <h1 className="homa-hero-title">Connect with Reliable<br/>Professionals Home Service</h1>
            <div className="homa-search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search service" 
                className="homa-search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="homa-search-btn" onClick={handleSearch}>🔍</button>
            </div>
            <div className="homa-quick-tags">
              {['Home care', 'Electrician', 'Mechanic', 'Plumber', 'Handcraft'].map(tag => (
                <span key={tag} className="tag" style={{cursor: 'pointer'}} onClick={() => handleTagClick(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Decorative floating cards would go here */}
        </div>
    </section>
  );
}
