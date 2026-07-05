const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Get token from the Authorization header
    // The standard format is: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Add the decoded user data to the request object
        // This allows routes to know exactly who is making the request
        req.user = decoded;
        
        // 4. Move to the next function (your route handler)
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authMiddleware;