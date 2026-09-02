import React, { useState, useCallback } from 'react';
import LenisProvider from '../components/motion/LenisProvider';
import Loader from '../components/landing/Loader';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import NoticeChaos from '../components/landing/NoticeChaos';
import AIAnalysis from '../components/landing/AIAnalysis';
import ChaosToStructure from '../components/landing/ChaosToStructure';
import DeadlineScene from '../components/landing/DeadlineScene';
import UrgencyScene from '../components/landing/UrgencyScene';
import EligibilityScene from '../components/landing/EligibilityScene';
import DocumentsScene from '../components/landing/DocumentsScene';
import ActionScene from '../components/landing/ActionScene';
import AskNotice from '../components/landing/AskNotice';
import ProductDemo from '../components/landing/ProductDemo';
import NoticeHistory from '../components/landing/NoticeHistory';
import TransformationScene from '../components/landing/TransformationScene';
import ClimaxScene from '../components/landing/ClimaxScene';
import FinalCTA from '../components/landing/FinalCTA';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [loadingComplete, setLoadingComplete] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoadingComplete(true);
  }, []);

  return (
    <LenisProvider>
      <main id="main-content" className="relative w-full bg-ink text-paper overflow-hidden select-text">
        {!loadingComplete && <Loader onComplete={handleLoaderComplete} />}

        <Navigation onEnterApp={onEnterApp} />

        {/* 01 — HERO */}
        <Hero />

        {/* 02 — THE PROBLEM */}
        <NoticeChaos />

        {/* 03 — AI ANALYSIS */}
        <AIAnalysis />

        {/* 04 — CHAOS TO STRUCTURE */}
        <ChaosToStructure />

        {/* 05 — DEADLINES */}
        <DeadlineScene />

        {/* 06 — URGENCY */}
        <UrgencyScene />

        {/* 07 — ELIGIBILITY */}
        <EligibilityScene />

        {/* 08 — REQUIRED DOCUMENTS */}
        <DocumentsScene />

        {/* 09 — FROM INFORMATION TO ACTION */}
        <ActionScene />

        {/* 10 — ASK THE NOTICE */}
        <AskNotice />

        {/* 11 — PRODUCT DEMONSTRATION */}
        <ProductDemo />

        {/* 12 — MY NOTICES */}
        <NoticeHistory />

        {/* 13 — THE TRANSFORMATION */}
        <TransformationScene />

        {/* 14 — CLIMAX */}
        <ClimaxScene />

        {/* 15 — FINAL CTA */}
        <FinalCTA onEnterApp={onEnterApp} />
      </main>
    </LenisProvider>
  );
}
