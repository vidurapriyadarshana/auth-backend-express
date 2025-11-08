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