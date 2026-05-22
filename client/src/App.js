import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ArtistsPage from './pages/ArtistsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ConsentPage from './pages/ConsentPage';
import ConsultationsPage from './pages/ConsultationsPage';
import InventoryPage from './pages/InventoryPage';
import SterilizationPage from './pages/SterilizationPage';
import WalkinsPage from './pages/WalkinsPage';
import GiftsPage from './pages/GiftsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import CommissionsPage from './pages/CommissionsPage';
import CleaningPage from './pages/CleaningPage';
import FlashPage from './pages/FlashPage';
import AftercarePage from './pages/AftercarePage';
import PricingPage from './pages/PricingPage';
import AIPage from './pages/AIPage';
import HealingTrackerPage from './pages/HealingTrackerPage';
import ArtistPerformancePage from './pages/ArtistPerformancePage';
import SmartBookingPage from './pages/SmartBookingPage';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === Batch 08 Gaps & Frontend Mounts ===
import CfHealingOutcomePredictionByArtistStyleLocation from './pages/CfHealingOutcomePredictionByArtistStyleLocation'
import CfPortfolioStyleClassificationAutoTaggingArtistWork from './pages/CfPortfolioStyleClassificationAutoTaggingArtistWork'
import CfDemandForecastingToOptimizeArtistSchedulingFor from './pages/CfDemandForecastingToOptimizeArtistSchedulingFor'
import CfInfectionRiskAssessmentFlaggingHighRiskProcedures from './pages/CfInfectionRiskAssessmentFlaggingHighRiskProcedures'
import CfSocialProofAutomationGeneratingBeforeAfterPost from './pages/CfSocialProofAutomationGeneratingBeforeAfterPost'
import CfOshaBloodbornePathogenComplianceDashboardWithAudit from './pages/CfOshaBloodbornePathogenComplianceDashboardWithAudit'
import GapNoAiDrivenPortfolioStyleClassification from './pages/GapNoAiDrivenPortfolioStyleClassification'
import GapNoDemandForecastingForPeakHours from './pages/GapNoDemandForecastingForPeakHours'
import GapNoAiInfectionRiskScoring from './pages/GapNoAiInfectionRiskScoring'
import GapNoIntegrationsWithPaymentProcessingSquareStripe from './pages/GapNoIntegrationsWithPaymentProcessingSquareStripe'
import GapNoFormalHealthSafetyComplianceTrackingModule from './pages/GapNoFormalHealthSafetyComplianceTrackingModule'
import GapNoPortfolioGalleryStorefrontForPublicViewing from './pages/GapNoPortfolioGalleryStorefrontForPublicViewing'
import GapNoMultiLocationMultiStudioSupport from './pages/GapNoMultiLocationMultiStudioSupport'
import GapNoWebhooksOrNotifications from './pages/GapNoWebhooksOrNotifications'
import GapNoAuditLogging from './pages/GapNoAuditLogging'
import GapNoSmsEmailReminderInfrastructure from './pages/GapNoSmsEmailReminderInfrastructure'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const pageTitles = {
  '/': 'Dashboard',
  '/artists': 'Artists & Portfolios',
  '/appointments': 'Appointments',
  '/clients': 'Client Profiles',
  '/consent': 'Consent & Waivers',
  '/consultations': 'Design Consultations',
  '/inventory': 'Supply Inventory',
  '/sterilization': 'Sterilization Logs',
  '/walkins': 'Walk-in Queue',
  '/gifts': 'Gift Certificates',
  '/loyalty': 'Loyalty Program',
  '/commissions': 'Commission Tracking',
  '/cleaning': 'Cleaning Checklists',
  '/flash': 'Flash Designs',
  '/aftercare': 'Aftercare Tracking',
  '/pricing': 'Pricing Calculator',
  '/healing': 'Healing Tracker',
  '/artist-performance': 'Artist Performance',
  '/smart-booking': 'Smart Booking',
  '/ai/generate-design': 'Flash Design Generator',
  '/ai/customize-consent': 'Consent Customizer',
  '/ai/personalize-aftercare': 'Aftercare Personalizer',
  '/ai/generate-caption': 'Caption Generator',
  '/ai/match-style': 'Style Matcher',
  '/ai/draft-message': 'Message Drafter',
};

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header title={title} sidebarCollapsed={sidebarCollapsed} />
      <div className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sterilization" element={<SterilizationPage />} />
          <Route path="/walkins" element={<WalkinsPage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/loyalty" element={<LoyaltyPage />} />
          <Route path="/commissions" element={<CommissionsPage />} />
          <Route path="/cleaning" element={<CleaningPage />} />
          <Route path="/flash" element={<FlashPage />} />
          <Route path="/aftercare" element={<AftercarePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/ai/:feature" element={<AIPage />} />
          <Route path="/healing" element={<HealingTrackerPage />} />
          <Route path="/artist-performance" element={<ArtistPerformancePage />} />
          <Route path="/smart-booking" element={<SmartBookingPage />} />
        {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-healing-outcome-prediction-by-artist-style-location-to" element={<ProtectedRoute><CfHealingOutcomePredictionByArtistStyleLocation /></ProtectedRoute>} />
      <Route path="/cf-portfolio-style-classification-auto-tagging-artist-work" element={<ProtectedRoute><CfPortfolioStyleClassificationAutoTaggingArtistWork /></ProtectedRoute>} />
      <Route path="/cf-demand-forecasting-to-optimize-artist-scheduling-for-peak" element={<ProtectedRoute><CfDemandForecastingToOptimizeArtistSchedulingFor /></ProtectedRoute>} />
      <Route path="/cf-infection-risk-assessment-flagging-high-risk-procedures-for-extra" element={<ProtectedRoute><CfInfectionRiskAssessmentFlaggingHighRiskProcedures /></ProtectedRoute>} />
      <Route path="/cf-social-proof-automation-generating-before-after-post-sequences" element={<ProtectedRoute><CfSocialProofAutomationGeneratingBeforeAfterPost /></ProtectedRoute>} />
      <Route path="/cf-osha-bloodborne-pathogen-compliance-dashboard-with-audit-ready-logs" element={<ProtectedRoute><CfOshaBloodbornePathogenComplianceDashboardWithAudit /></ProtectedRoute>} />
      <Route path="/gap-no-ai-driven-portfolio-style-classification" element={<ProtectedRoute><GapNoAiDrivenPortfolioStyleClassification /></ProtectedRoute>} />
      <Route path="/gap-no-demand-forecasting-for-peak-hours" element={<ProtectedRoute><GapNoDemandForecastingForPeakHours /></ProtectedRoute>} />
      <Route path="/gap-no-ai-infection-risk-scoring" element={<ProtectedRoute><GapNoAiInfectionRiskScoring /></ProtectedRoute>} />
      <Route path="/gap-no-integrations-with-payment-processing-square-stripe" element={<ProtectedRoute><GapNoIntegrationsWithPaymentProcessingSquareStripe /></ProtectedRoute>} />
      <Route path="/gap-no-formal-health-safety-compliance-tracking-module-blood-borne" element={<ProtectedRoute><GapNoFormalHealthSafetyComplianceTrackingModule /></ProtectedRoute>} />
      <Route path="/gap-no-portfolio-gallery-storefront-for-public-viewing" element={<ProtectedRoute><GapNoPortfolioGalleryStorefrontForPublicViewing /></ProtectedRoute>} />
      <Route path="/gap-no-multi-location-multi-studio-support" element={<ProtectedRoute><GapNoMultiLocationMultiStudioSupport /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-or-notifications" element={<ProtectedRoute><GapNoWebhooksOrNotifications /></ProtectedRoute>} />
      <Route path="/gap-no-audit-logging" element={<ProtectedRoute><GapNoAuditLogging /></ProtectedRoute>} />
      <Route path="/gap-no-sms-email-reminder-infrastructure" element={<ProtectedRoute><GapNoSmsEmailReminderInfrastructure /></ProtectedRoute>} />
      </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
