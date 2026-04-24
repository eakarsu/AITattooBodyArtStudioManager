const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sterilization', sterilizationRoutes);
app.use('/api/walkins', walkinsRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/aftercare', aftercareRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Tattoo Studio Server running on port ${PORT}`);
});

module.exports = app;
