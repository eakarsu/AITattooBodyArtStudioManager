const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
const authRoutes = require('./routes/auth');
const artistsRoutes = require('./routes/artists');
const appointmentsRoutes = require('./routes/appointments');
const clientsRoutes = require('./routes/clients');
const consentRoutes = require('./routes/consent');
const consultationsRoutes = require('./routes/consultations');
const inventoryRoutes = require('./routes/inventory');
const sterilizationRoutes = require('./routes/sterilization');
const walkinsRoutes = require('./routes/walkins');
const giftsRoutes = require('./routes/gifts');
const loyaltyRoutes = require('./routes/loyalty');
const commissionsRoutes = require('./routes/commissions');
const cleaningRoutes = require('./routes/cleaning');
const flashRoutes = require('./routes/flash');
const aftercareRoutes = require('./routes/aftercare');
const pricingRoutes = require('./routes/pricing');
const aiRoutes = require('./routes/ai');
const healingRoutes = require('./routes/healing');
const performanceRoutes = require('./routes/performance');

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes — auth required for all data endpoints
app.use('/api/artists', authenticateToken, artistsRoutes);
app.use('/api/appointments', authenticateToken, appointmentsRoutes);
app.use('/api/clients', authenticateToken, clientsRoutes);
app.use('/api/consent', authenticateToken, consentRoutes);
app.use('/api/consultations', authenticateToken, consultationsRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/sterilization', authenticateToken, sterilizationRoutes);
app.use('/api/walkins', authenticateToken, walkinsRoutes);
app.use('/api/gifts', authenticateToken, giftsRoutes);
app.use('/api/loyalty', authenticateToken, loyaltyRoutes);
app.use('/api/commissions', authenticateToken, commissionsRoutes);
app.use('/api/cleaning', authenticateToken, cleaningRoutes);
app.use('/api/flash', authenticateToken, flashRoutes);
app.use('/api/aftercare', authenticateToken, aftercareRoutes);
app.use('/api/pricing', authenticateToken, pricingRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/healing', authenticateToken, healingRoutes);
app.use('/api/performance', authenticateToken, performanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('/api/healing-outcome-prediction', require('./routes/healingOutcomePrediction')); app.use('/api/portfolio-style-classification', require('./routes/portfolioStyleClassification')); app.use('/api/demand-forecasting', require('./routes/demandForecasting')); app.use('/api/infection-risk-assessment', require('./routes/infectionRiskAssessment')); app.use('/api/social-proof-automation', require('./routes/socialProofAutomation')); app.use('/api/osha-compliance-dashboard', require('./routes/oshaComplianceDashboard'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-no-ai-driven-portfolio-style-classification', require('./routes/gapNoAiDrivenPortfolioStyleClassification'));
app.use('/api/gap-no-demand-forecasting-for-peak-hours', require('./routes/gapNoDemandForecastingForPeakHours'));
app.use('/api/gap-no-ai-infection-risk-scoring', require('./routes/gapNoAiInfectionRiskScoring'));
app.use('/api/gap-no-integrations-with-payment-processing-square-stripe', require('./routes/gapNoIntegrationsWithPaymentProcessingSquareStripe'));
app.use('/api/gap-no-formal-health-safety-compliance-tracking-module-blood-borne', require('./routes/gapNoFormalHealthSafetyComplianceTrackingModuleBloodBorne'));
app.use('/api/gap-no-portfolio-gallery-storefront-for-public-viewing', require('./routes/gapNoPortfolioGalleryStorefrontForPublicViewing'));
app.use('/api/gap-no-multi-location-multi-studio-support', require('./routes/gapNoMultiLocationMultiStudioSupport'));
app.use('/api/gap-no-webhooks-or-notifications', require('./routes/gapNoWebhooksOrNotifications'));
app.use('/api/gap-no-audit-logging', require('./routes/gapNoAuditLogging'));
app.use('/api/gap-no-sms-email-reminder-infrastructure', require('./routes/gapNoSmsEmailReminderInfrastructure'));

app.listen(PORT, () => {
  console.log(`Tattoo Studio Server running on port ${PORT}`);
});

module.exports = app;
