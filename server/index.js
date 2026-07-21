const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');
const { authenticateToken } = require('./middleware/auth');

validateRuntime();

const app = express();
const PORT = process.env.SERVER_PORT || 4000;
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map((value) => value.trim()).filter(Boolean);
const providerPrefixes = [
  '/api/ai', '/api/appointments', '/api/performance',
  '/api/healing-outcome-prediction', '/api/portfolio-style-classification',
  '/api/demand-forecasting', '/api/infection-risk-assessment',
  '/api/social-proof-automation', '/api/osha-compliance-dashboard', '/api/gap-',
];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/governance', require('./governance/router'));
app.use('/api', authenticateToken);
app.use(createProviderGate(providerPrefixes));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const protectedRoutes = [
  ['/api/artists', './routes/artists'],
  ['/api/clients', './routes/clients'],
  ['/api/consent', './routes/consent'],
  ['/api/consultations', './routes/consultations'],
  ['/api/inventory', './routes/inventory'],
  ['/api/sterilization', './routes/sterilization'],
  ['/api/walkins', './routes/walkins'],
  ['/api/gifts', './routes/gifts'],
  ['/api/loyalty', './routes/loyalty'],
  ['/api/commissions', './routes/commissions'],
  ['/api/cleaning', './routes/cleaning'],
  ['/api/flash', './routes/flash'],
  ['/api/aftercare', './routes/aftercare'],
  ['/api/pricing', './routes/pricing'],
  ['/api/healing', './routes/healing'],
];
for (const [routePath, modulePath] of protectedRoutes) app.use(routePath, require(modulePath));

if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true') {
  const legacyRoutes = [
    ['/api/appointments', './routes/appointments'],
    ['/api/performance', './routes/performance'],
    ['/api/ai', './routes/ai'],
    ['/api/healing-outcome-prediction', './routes/healingOutcomePrediction'],
    ['/api/portfolio-style-classification', './routes/portfolioStyleClassification'],
    ['/api/demand-forecasting', './routes/demandForecasting'],
    ['/api/infection-risk-assessment', './routes/infectionRiskAssessment'],
    ['/api/social-proof-automation', './routes/socialProofAutomation'],
    ['/api/osha-compliance-dashboard', './routes/oshaComplianceDashboard'],
    ['/api/gap-no-ai-driven-portfolio-style-classification', './routes/gapNoAiDrivenPortfolioStyleClassification'],
    ['/api/gap-no-demand-forecasting-for-peak-hours', './routes/gapNoDemandForecastingForPeakHours'],
    ['/api/gap-no-ai-infection-risk-scoring', './routes/gapNoAiInfectionRiskScoring'],
    ['/api/gap-no-integrations-with-payment-processing-square-stripe', './routes/gapNoIntegrationsWithPaymentProcessingSquareStripe'],
    ['/api/gap-no-formal-health-safety-compliance-tracking-module-blood-borne', './routes/gapNoFormalHealthSafetyComplianceTrackingModuleBloodBorne'],
    ['/api/gap-no-portfolio-gallery-storefront-for-public-viewing', './routes/gapNoPortfolioGalleryStorefrontForPublicViewing'],
    ['/api/gap-no-multi-location-multi-studio-support', './routes/gapNoMultiLocationMultiStudioSupport'],
    ['/api/gap-no-webhooks-or-notifications', './routes/gapNoWebhooksOrNotifications'],
    ['/api/gap-no-audit-logging', './routes/gapNoAuditLogging'],
    ['/api/gap-no-sms-email-reminder-infrastructure', './routes/gapNoSmsEmailReminderInfrastructure'],
  ];
  for (const [routePath, modulePath] of legacyRoutes) app.use(routePath, require(modulePath));
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Tattoo Studio Server running on port ${PORT}`));
}

module.exports = app;
