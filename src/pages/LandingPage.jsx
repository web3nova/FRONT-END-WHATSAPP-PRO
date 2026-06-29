import React from 'react';
import Navbar from '../components/ui/Navbar';
import BotpressHero from '../components/ui/BotpressHero';
import FeatureShaderCards from '../components/ui/FeatureShaderCards';
import ManagementSection from '../components/ui/ManagementSection';
import PricingSection from '../components/ui/PricingSection';
import FAQAndFooter from '../components/ui/FAQAndFooter';

import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="bp-landing-page">

      <Navbar />

      <main>

        <BotpressHero />

        <div id="features">
          <FeatureShaderCards />
        </div>

        <ManagementSection />

        <PricingSection />

        <FAQAndFooter />

      </main>

    </div>
  );
}