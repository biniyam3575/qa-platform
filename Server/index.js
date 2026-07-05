require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Import database connection
const promisePool = require('./config/db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Connected to database successfully!');
        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};
testConnection();

// Home route
app.get('/', (req, res) => {
    res.json({
        name: 'Q&A App API',
        version: '1.0.0',
        status: 'running'
    });
});

// Import routes
const userRoutes = require('./Routes/userRoutes');
const questionRoutes = require('./Routes/questionRoutes');
const answerRoutes = require('./Routes/answerRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

// ✅ SAFE 404 HANDLER - No wildcard pattern
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📝 API ready for building your Q&A app!`);
});