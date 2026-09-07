import React from 'react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    { step: 'STEP 1', title: 'Search for Services', icon: '🔍', desc: 'Simply enter your location and select the type of service you\'re looking for, from plumbing to home repairs and more.' },
    { step: 'STEP 2', title: 'Browse Local Experts', icon: '👤', desc: 'Explore detailed profiles, read customer reviews, and compare ratings of trusted professionals near you.' },
    { step: 'STEP 3', title: 'Book Your Service', icon: '📅', desc: 'Choose the time that works best for you and easily book your preferred professional with a few clicks.' },
    { step: 'STEP 4', title: 'Enjoy your day', icon: '👍', desc: 'Sit back and relax while a qualified expert arrives to complete the job efficiently and to your satisfaction.' }
  ];

  return (
    <section className="homa-hiw">
        <div className="homa-hiw-container">
          <h2 className="homa-section-title">How It works</h2>
          <div className="homa-steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="homa-step-card">
                <div className="homa-step-icon">{s.icon}</div>
                <div className="homa-step-label">{s.step}</div>
                <h3 className="homa-step-title">{s.title}</h3>
                <p className="homa-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
}
