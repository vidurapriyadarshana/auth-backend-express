import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { IUser, User } from "../models/user.model";
import { CLIENT_URL, NODE_ENV } from "../config/env.config";
import { ApiResponse } from "../utils/ApiResponse";
import { UnauthorizedError } from "../utils/ApiError";
import crypto from 'crypto';
import { sendEmail } from "../services/email.service";

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie("jwt_refresh", refreshToken, cookieOptions);
};

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      password,
      f_name, 
      l_name, 
      phoneNumber,
      address,
      is_active,
      id_card_number, 
      birthday,
      description, 
    } = req.body;

    await authService.registerUser(
      email,
      password,
      f_name,
      l_name,
      phoneNumber,
      address,
      is_active,
      id_card_number,
      birthday,
      description
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          "User registered successfully. Please log in."
        )
      );
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(
      email,
      password
    );

    setRefreshCookie(res, refreshToken);

    res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Login successful"));
  }
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Google authentication failed.");
    }
    const user = req.user as IUser;
    const { accessToken, refreshToken } =
      await authService.generateAndStoreTokens(user);

    setRefreshCookie(res, refreshToken);
    res.redirect(`${CLIENT_URL}/auth/google/callback?token=${accessToken}`);
  }
);

export const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.jwt_refresh;
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided.");
    }
    const newAccessToken = await authService.refreshUserToken(refreshToken);

    res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
      );
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.jwt_refresh;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }
    res.clearCookie("jwt_refresh", cookieOptions);

    res.status(204).send();
  }
);

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });

    // Don't tell the user if the email exists or not (security)
    if (!user) {
      return res.status(200).json({ message: 'If user exists, email has been sent.' });
    }

    // 1. Generate a raw token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token and save to user in DB
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    // 3. Create reset URL (this link goes to your frontend)
    const resetURL = `${CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <p>Please click the link below to reset your password:</p>
      <a href="${resetURL}" target="_blank">Reset Password</a>
      <p>This link is valid for 10 minutes.</p>
    `;

    // 4. Send the email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Reset your password here: ${resetURL}`,
      html: message,
    });

    res.status(200).json({ message: 'If user exists, email has been sent.' });
  } catch (error) {
    // Clear tokens on error
    const user = await User.findOne({ email });
     if (user) {
         user.passwordResetToken = undefined;
         user.passwordResetExpires = undefined;
         await user.save();
     }
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    // 1. Hash the token from the URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Find user by hashed token and check expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 3. Set new password
    user.password = password; // The 'pre-save' hook will hash this
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};