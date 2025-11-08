import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { ROLES } from '../constants/roles.constants';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// This 'authenticate' middleware applies to ALL routes defined in this file
router.use(authenticate);

router.get(
  '/profile', 
  authorize([ROLES.User, ROLES.Admin, ROLES.Therapist, ROLES.Doctor]), 
  userController.getProfile
);

export default router;