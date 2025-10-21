import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export const generalRateLimit = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createPostRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 posts per minute
  message: {
    success: false,
    error: 'Too many posts created, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const commentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 comments per minute
  message: {
    success: false,
    error: 'Too many comments created, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});