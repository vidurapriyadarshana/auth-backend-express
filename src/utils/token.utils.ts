import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model'; 
import { 
  JWT_SECRET, 
  JWT_EXPIRES_IN, 
  JWT_REFRESH_SECRET, 
  JWT_REFRESH_EXPIRES_IN 
} from '../config/env.config';
import { JwtPayload } from '../types/express';

/**
 * Generates a short-lived Access Token.
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: JwtPayload = {
    id: user._id.toString(), 
    roles: user.roles,
  };
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET as Secret, options);
};

/**
 * Generates a long-lived Refresh Token.
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload = { id: user._id.toString() };
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, options);
};

/**
 * Verifies a refresh token and returns its payload.
 */
export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET as Secret) as { id: string };
  } catch (error) {
    return null; 
  }
};