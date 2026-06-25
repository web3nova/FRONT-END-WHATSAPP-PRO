import React from 'react';
import './FeaturesGrid.css';

const features = [
  {
    icon: '💬',
    title: 'WhatsApp Automation',
    description: 'Native capabilities to automate WhatsApp conversations and handle complex customer inquiries.'
  },
  {
    icon: '🛒',
    title: 'Order Management',
    description: 'Track, manage, and fulfill orders directly within your personalized business dashboard.'
  },
  {
    icon: '👥',
    title: 'Customer Insights',
    description: 'Understand your audience better with in-depth analytics and seamless CRM integration.'
  },
  {
    icon: '📚',
    title: 'Knowledge Bases',
    description: 'Train your bot with custom knowledge sources to ensure accurate and contextual replies.'
  },
  {
    icon: '📊',
    title: 'Data Analytics',
    description: 'Store and manage conversational and transactional data safely with scalable tables.'
  },
  {
    icon: '⚡',
    title: 'Instant Deployment',
    description: 'Launch your intelligent systems immediately and boost your business productivity.'
  }
];

export default function FeaturesGrid() {
  return (
    <section className="bp-features">
      <div className="bp-features-container">
        
        <div className="bp-features-header">
          <h2 className="bp-features-title">The most capable agent platform</h2>
          <p className="bp-features-subtitle">Everything you need to automate support workflows safely at enterprise scale.</p>
        </div>

        <div className="bp-features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="bp-feature-card">
              <div className="bp-feature-icon">{feature.icon}</div>
              <h3 className="bp-feature-title">{feature.title}</h3>
              <p className="bp-feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
