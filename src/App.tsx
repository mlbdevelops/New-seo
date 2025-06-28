import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Dashboard from './components/dashboard/Dashboard';
import ArticleEditor from './components/editor/ArticleEditor';
import ContentBriefGenerator from './components/content/ContentBriefGenerator';
import TeamCollaboration from './components/team/TeamCollaboration';
import AccountSettings from './components/account/AccountSettings';
import PricingPage from './components/pricing/PricingPage';
import SupportFAQ from './components/support/SupportFAQ';
import AuthModal from './components/auth/AuthModal';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Notification from './components/Notification';

function App() {
  const { user, initialized, initialize } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'editor' | 'brief-generator' | 'team' | 'settings' | 'pricing' | 'support'>('landing');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Enhanced hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/dashboard')) {
        setCurrentView('dashboard');
      } else if (hash.startsWith('#/project/')) {
        setCurrentView('editor');
      } else if (hash.startsWith('#/brief-generator')) {
        setCurrentView('brief-generator');
      } else if (hash.startsWith('#/team')) {
        setCurrentView('team');
      } else if (hash.startsWith('#/settings')) {
        setCurrentView('settings');
      } else if (hash.startsWith('#/pricing')) {
        setCurrentView('pricing');
      } else if (hash.startsWith('#/support')) {
        setCurrentView('support');
      } else {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is authenticated, show the appropriate view
  if (user) {
    switch (currentView) {
      case 'editor':
        return (
          <ErrorBoundary>
            <ArticleEditor />
            <Notification />
          </ErrorBoundary>
        );
      case 'brief-generator':
        return (
          <ErrorBoundary>
            <ContentBriefGenerator />
            <Notification />
          </ErrorBoundary>
        );
      case 'team':
        return (
          <ErrorBoundary>
            <TeamCollaboration />
            <Notification />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <AccountSettings />
            <Notification />
          </ErrorBoundary>
        );
      case 'pricing':
        return (
          <ErrorBoundary>
            <PricingPage />
            <Notification />
          </ErrorBoundary>
        );
      case 'support':
        return (
          <ErrorBoundary>
            <SupportFAQ />
            <Notification />
          </ErrorBoundary>
        );
      case 'dashboard':
      default:
        return (
          <ErrorBoundary>
            <Dashboard />
            <Notification />
          </ErrorBoundary>
        );
    }
  }

  // Show landing page for non-authenticated users
  if (currentView === 'pricing') {
    return (
      <ErrorBoundary>
        <PricingPage />
        <Notification />
      </ErrorBoundary>
    );
  }

  if (currentView === 'support') {
    return (
      <ErrorBoundary>
        <SupportFAQ />
        <Notification />
      </ErrorBoundary>
    );
  }

  // Show landing page
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Header onAuthClick={handleAuthClick} />
        <Hero onAuthClick={handleAuthClick} />
        <Features />
        <Testimonials />
        <Pricing onAuthClick={handleAuthClick} />
        <Newsletter />
        <Footer />
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
        <Notification />
      </div>
    </ErrorBoundary>
  );
}

export default App;