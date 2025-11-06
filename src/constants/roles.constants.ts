// Define the allowed roles as a type
export type UserRole = 'user' | 'admin' | 'therapist' | 'doctor';

// Export an object for easy access (e.g., ROLES.Admin)
export const ROLES = {
  User: 'user' as UserRole,
  Admin: 'admin' as UserRole,
  Therapist: 'therapist' as UserRole,
  Doctor: 'doctor' as UserRole,
};

export const ROLE_LIST = [ROLES.User, ROLES.Admin, ROLES.Therapist, ROLES.Doctor];