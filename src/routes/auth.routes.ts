import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';

const router = Router();

// --- Email/Password ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- Google OAuth ---
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

// --- Refresh & Logout ---
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

export default router;