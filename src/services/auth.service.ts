import { User, IUser } from '../models/user.model';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../utils/token.utils';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/ApiError';

/**
 * Handles user registration
 */
// --- UPDATED ---
export const registerUser = async (
  email: string, 
  password: string, 
  name: string, 
  // Fields are now optional
  phoneNumber?: string, 
  address?: string
): Promise<IUser> => {
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email already in use.');
  }

  // --- UPDATED ---
  // Create the new user with all fields
  const newUser = new User({ 
    email, 
    password,
    name,
    phoneNumber,
    address
  });
  
  await newUser.save(); // Mongoose validation will run here
  return newUser;
};

/**
 * Handles user login (email/password)
 */
export const loginUser = async (email: string, password: string) => {
// ... (existing code)
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) throw new UnauthorizedError('Invalid credentials.');
  if (!user.password) throw new UnauthorizedError('Please log in with Google.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError('Invalid credentials.');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();
  return { accessToken, refreshToken };
};

/**
 * Generates and stores tokens for OAuth users
 */
export const generateAndStoreTokens = async (user: IUser) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const userDoc = await User.findById(user._id).select('+refreshTokens');
  if (userDoc) {
    userDoc.refreshTokens = [...(userDoc.refreshTokens || []), refreshToken];
    await userDoc.save();
  }
  return { accessToken, refreshToken };
};

/**
 * Handles refreshing an access token
 */
export const refreshUserToken = async (token: string): Promise<string> => {
  const payload = verifyRefreshToken(token);
  if (!payload) {
    throw new UnauthorizedError('Invalid or expired refresh token.');
  }

  const user = await User.findById(payload.id).select('+refreshTokens');
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  if (!user.refreshTokens || !user.refreshTokens.includes(token)) {
    throw new UnauthorizedError('Refresh token is not active.');
  }

  const newAccessToken = generateAccessToken(user);
  return newAccessToken;
};

/**
 * Handles user logout
 */
export const logoutUser = async (token: string): Promise<void> => {
  const payload = verifyRefreshToken(token);
  if (!payload) return; 

  const user = await User.findById(payload.id).select('+refreshTokens');
  if (!user || !user.refreshTokens) return;

  user.refreshTokens = user.refreshTokens.filter(rt => rt !== token);
  await user.save();
};