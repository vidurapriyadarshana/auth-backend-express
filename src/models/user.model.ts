import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole, ROLE_LIST, ROLES } from "../constants/roles.constants";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  f_name: string;
  l_name: string;
  phoneNumber?: string;
  address?: string;
  id_card_number: string;
  birthday?: Date;
  description?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  is_active?: boolean;
  password?: string;
  googleId?: string;
  roles: UserRole[];
  refreshTokens: string[];
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    f_name: {
      type: String,
      required: true,
      trim: true,
    },
    l_name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    id_card_number: {
      type: String,
      required: false,
      trim: true,
    },
    birthday: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    passwordResetToken: {
      type: String,
      select: false, // Don't send this to the client
    },
    passwordResetExpires: {
      type: Date,
      select: false, // Don't send this to the client
    },
    is_active: { type: Boolean, default: true },
    password: { type: String, required: false, select: false },
    googleId: { type: String, required: false, unique: true, sparse: true },
    roles: { type: [String], enum: ROLE_LIST, default: [ROLES.User] },
    refreshTokens: [{ type: String, select: false }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
