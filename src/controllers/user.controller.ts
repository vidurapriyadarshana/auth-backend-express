import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

/**
 * Get the profile of the currently logged-in user
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; 
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Example Admin-only endpoint logic
 */
export const getAdminDashboard = (req: Request, res: Response) => {
  res.json({ message: `Welcome to the admin dashboard, user ${req.user?.id}` }); 
};

/**
 * Example Doctor/Therapist endpoint logic
 */
export const getPatientList = (req: Request, res: Response) => {
  res.json({ 
    message: 'Patient list retrieved.',
    accessorRoles: req.user?.roles 
  });
};