import jwt, { Secret } from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';
import { JWTPayload, TokenPair } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024-mobile-legends';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';

/**
 * Генерирует пару токенов: access и refresh
 */
export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair => {
  // Access token - короткий срок жизни
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES
  });

  // Refresh token - длинный срок жизни
  const refreshToken = jwt.sign({ ...payload, tokenType: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpires: jwt.decode(accessToken)?.exp || 0,
    refreshTokenExpires: jwt.decode(refreshToken)?.exp || 0
  };
};

/**
 * Проверяет access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Access token expired', 401);
    }
    throw createError('Invalid access token', 401);
  }
};

/**
 * Проверяет refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload & { tokenType?: string };
    
    if (decoded.tokenType !== 'refresh') {
      throw createError('Invalid refresh token', 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Refresh token expired', 401);
    }
    throw createError('Invalid refresh token', 401);
  }
};

/**
 * Декодирует токен без проверки подписи
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Проверяет срок действия токена
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

/**
 * Создает временный токен для сброса пароля
 */
export const generatePasswordResetToken = (): { token: string; expires: Date } => {
  const token = jwt.sign({}, JWT_SECRET, { expiresIn: '1h' });
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 час
  return { token, expires };
};

/**
 * Проверяет токен сброса пароля
 */
export const verifyPasswordResetToken = (token: string): boolean => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};