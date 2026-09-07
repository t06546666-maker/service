import React from 'react';
import './Categories.css';

export default function Categories() {
  const categories = [
    { icon: '🏠', name: 'Home service' },
    { icon: '⚡', name: 'Electricity' },
    { icon: '🛠️', name: 'Handcraft' },
    { icon: '🔧', name: 'Plumber' },
    { icon: '⚙️', name: 'Mechanic' },
    { icon: '➕', name: 'More' }
  ];

  const handleCategoryClick = (name) => {
    alert(`Navigating to category: ${name}`);
  };

  return (
    <section className="homa-categories">
        <div className="homa-cat-container">
          {categories.map((cat, i) => (
            <div key={i} className="homa-cat-item" onClick={() => handleCategoryClick(cat.name)}>
              <div className="homa-cat-icon">{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
    </section>
  );
}
