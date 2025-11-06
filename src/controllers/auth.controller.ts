import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { IUser } from '../models/user.model';
import { CLIENT_URL, NODE_ENV } from '../config/env.config';
import { ApiResponse } from '../utils/ApiResponse';
import { UnauthorizedError } from '../utils/ApiError';

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt_refresh', refreshToken, cookieOptions);
};

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // --- UPDATED ---
  // Destructure all required fields from the body
  const { email, password, name, phoneNumber, address } = req.body;
  
  // Pass all fields to the service
  await authService.registerUser(email, password, name, phoneNumber, address);
  
  res.status(201).json(
    new ApiResponse(201, null, 'User registered successfully. Please log in.')
  );
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await authService.loginUser(email, password);
  
  setRefreshCookie(res, refreshToken);
  
  res.status(200).json(
    new ApiResponse(200, { accessToken }, 'Login successful')
  );
});

export const googleCallback = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Google authentication failed.');
  }
  const user = req.user as IUser; 
  const { accessToken, refreshToken } = await authService.generateAndStoreTokens(user);
    
  setRefreshCookie(res, refreshToken);
  res.redirect(`${CLIENT_URL}/auth/google/callback?token=${accessToken}`);

});

export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token provided.');
  }
  const newAccessToken = await authService.refreshUserToken(refreshToken);
  
  res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed')
  );
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }
  res.clearCookie('jwt_refresh', cookieOptions);

  res.status(204).send();
});