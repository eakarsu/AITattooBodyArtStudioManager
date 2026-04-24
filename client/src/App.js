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
