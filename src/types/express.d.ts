import { UserRole } from '../constants/roles.constants';

// 1. Define and Export your payload interface
// This lets you import it in other files if you ever need to.
export interface JwtPayload {
  id: string;
  roles: UserRole[];
}

// 2. Augment the 'express-serve-static-core' module
// This is the correct, module-safe way to add properties to 
// the Express Request object.
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}