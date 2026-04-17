/**
 * Backend Security Middleware
 * Recommendations for Express.js / Node.js backend
 * 
 * Implementation example (if using Express):
 * 
 * const express = require('express');
 * const cors = require('cors');
 * const helmet = require('helmet');
 * const rateLimit = require('express-rate-limit');
 * 
 * const app = express();
 * 
 * // 1. Security Headers
 * app.use(helmet());
 * 
 * // 2. CORS Configuration
 * const corsOptions = {
 *   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
 *   credentials: true,
 *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
 *   allowedHeaders: ['Content-Type', 'Authorization'],
 *   optionsSuccessStatus: 200
 * };
 * app.use(cors(corsOptions));
 * 
 * // 3. Rate Limiting
 * const limiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100,
 *   message: 'Too many requests, please try again later'
 * });
 * app.use(limiter);
 * 
 * // 4. Request body size limit
 * app.use(express.json({ limit: '10mb' }));
 * 
 * // 5. Input Validation
 * // Use express-validator or similar
 * 
 * // 6. HTTPS Redirect (in production)
 * if (process.env.NODE_ENV === 'production') {
 *   app.use((req, res, next) => {
 *     if (req.header('x-forwarded-proto') !== 'https') {
 *       res.redirect(`https://${req.header('host')}${req.url}`);
 *     } else {
 *       next();
 *     }
 *   });
 * }
 */

/**
 * Environment Variables for Backend Security
 */
export const BACKEND_SECURITY_CONFIG = {
  // CORS
  CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_CREDENTIALS: true,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: '24h',
  REFRESH_TOKEN_EXPIRE: '7d',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // Database
  DB_SSL: process.env.DB_SSL === 'true',
  DB_TIMEOUT: 10000,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Security
  HELMET_ENABLED: true,
  HELMET_CSP_ENABLED: false, // Set to true if CSP is not in HTML headers
  ENABLE_HTTPS_REDIRECT: process.env.NODE_ENV === 'production',
};

/**
 * Flash Deals API Endpoints
 */
export const FLASH_DEALS_ENDPOINTS = {
  // List all flash deals
  GET_ALL: '/api/admin/flash-deals',
  
  // Get single flash deal
  GET_ONE: '/api/admin/flash-deals/:id',
  
  // Create flash deal
  CREATE: '/api/admin/flash-deals',
  
  // Update flash deal
  UPDATE: '/api/admin/flash-deals/:id',
  
  // Delete flash deal
  DELETE: '/api/admin/flash-deals/:id',
  
  // Get active flash deals (public)
  GET_ACTIVE: '/api/flash-deals/active',
};

/**
 * Database Schema for Flash Deals
 * Example using MongoDB/Mongoose
 */
export const FLASH_DEAL_SCHEMA = `
{
  _id: ObjectId,
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  maxQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'Admin'
  }
}
`;

/**
 * Validation Middleware
 * Example for flash deal creation
 */
export const FLASH_DEAL_VALIDATION_RULES = [
  {
    field: 'productId',
    type: 'string',
    required: true,
    message: 'Product ID is required'
  },
  {
    field: 'discountPercentage',
    type: 'number',
    required: true,
    min: 1,
    max: 100,
    message: 'Discount must be between 1 and 100'
  },
  {
    field: 'startTime',
    type: 'date',
    required: true,
    message: 'Start time is required'
  },
  {
    field: 'endTime',
    type: 'date',
    required: true,
    message: 'End time is required',
    validate: (value, formData) => {
      return new Date(value) > new Date(formData.startTime);
    },
    validationMessage: 'End time must be after start time'
  },
  {
    field: 'maxQuantity',
    type: 'number',
    required: true,
    min: 1,
    message: 'Max quantity must be at least 1'
  }
];

/**
 * Authentication Middleware Checklist
 */
export const AUTH_CHECKLIST = [
  '✓ JWT token verification for admin endpoints',
  '✓ Role-based access control (RBAC)',
  '✓ Refresh token mechanism',
  '✓ Token expiration handling',
  '✓ Secure password hashing (bcrypt)',
  '✓ Account lockout after failed attempts',
  '✓ Email verification for new accounts',
  '✓ Two-factor authentication (optional)',
  '✓ Audit logging for admin actions',
];

/**
 * Recommended NPM Packages for Backend
 */
export const RECOMMENDED_PACKAGES = {
  security: [
    'helmet - Set security HTTP headers',
    'express-rate-limit - Rate limiting',
    'cors - CORS middleware',
    'joi - Schema validation',
    'bcryptjs - Password hashing',
    'jsonwebtoken - JWT implementation',
    'dotenv - Environment variables',
  ],
  database: [
    'mongoose - MongoDB ODM',
    'sequelize - SQL ORM',
    'typeorm - ORM with TypeScript support',
  ],
  utilities: [
    'express - Web framework',
    'morgan - HTTP request logger',
    'winston - Logging library',
    'axios - HTTP client',
    'node-cron - Task scheduling',
  ],
  testing: [
    'jest - Testing framework',
    'supertest - HTTP assertion library',
    'dotenv-cli - Test environment setup',
  ]
};

/**
 * Production Deployment Checklist
 */
export const PRODUCTION_CHECKLIST = [
  '[ ] Enable HTTPS/TLS',
  '[ ] Set strong JWT secret',
  '[ ] Configure CORS properly',
  '[ ] Enable rate limiting',
  '[ ] Set up logging and monitoring',
  '[ ] Configure database backups',
  '[ ] Set up CDN for static assets',
  '[ ] Enable gzip compression',
  '[ ] Configure SSL certificates',
  '[ ] Set up health checks',
  '[ ] Configure auto-scaling',
  '[ ] Set up email notifications',
  '[ ] Enable request body size limits',
  '[ ] Configure security headers',
  '[ ] Set up intrusion detection',
  '[ ] Implement API versioning',
  '[ ] Document all endpoints',
  '[ ] Set up CI/CD pipeline',
];
