import React from 'react';
import Navbar from '../components/ui/Navbar';
import BotpressHero from '../components/ui/BotpressHero';
import FeaturesSection from '../components/ui/FeaturesSection';
import ManagementSection from '../components/ui/ManagementSection';
import PricingSection from '../components/ui/PricingSection';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="bp-landing-page">
      <Navbar />
      <main>
        <BotpressHero />
        <FeaturesSection />
        <ManagementSection />
        <PricingSection />
      </main>
    </div>
  );
}
