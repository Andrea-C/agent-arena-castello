/**
 * Avventura nel Castello - API Server
 * 
 * Main entry point for the castello_api_app
 */

const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Import modules
const db = require('./db');
const swaggerSpecs = require('./swagger');

// Import routes
const registerRoute = require('./routes/register');
const statusRoute = require('./routes/status');
const playRoute = require('./routes/play');
const dashboardRoute = require('./routes/dashboard');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware (for development)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/register', registerRoute);
app.use('/status', statusRoute);
app.use('/play', playRoute);
app.use('/dashboard', dashboardRoute);

// Swagger API documentation at cryptic URL
app.use('/arcane-scrolls', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Castello API - Documentazione'
}));

// Root endpoint - redirect to dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'internal_error',
        message: 'Si è verificato un errore interno'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Endpoint non trovato'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await db.initDatabase();
        console.log('Database initialized');
        
        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║   AVVENTURA NEL CASTELLO - API Server                      ║');
            console.log('║                                                            ║');
            console.log(`║   Server running on http://localhost:${PORT}                  ║`);
            console.log('║                                                            ║');
            console.log('║   Endpoints:                                               ║');
            console.log('║   - POST /register    - Register new player                ║');
            console.log('║   - GET  /status      - Get player status                  ║');
            console.log('║   - POST /play        - Send game action                   ║');
            console.log('║   - GET  /dashboard   - Monitoring dashboard               ║');
            console.log('║   - GET  /arcane-scrolls - API documentation               ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
