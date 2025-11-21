const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
    max: config.rateLimit.max || 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

module.exports = apiLimiter;
