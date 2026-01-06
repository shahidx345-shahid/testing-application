// Authentication Types and Interfaces

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  biometricEnabled: boolean;
  accountStatus: "active" | "suspended" | "locked";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  agreeToTerms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface EmailVerificationPayload {
  email: string;
  code: string;
}

export interface OTPVerificationPayload {
  phoneNumber: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface BiometricSetupPayload {
  userId: string;
  credentialId: string;
  publicKey: ArrayBuffer;
  counter: number;
}

export interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: User;
  session: Session;
}

export interface SignUpResponse {
  user: User;
  requiresEmailVerification: boolean;
  verificationCodeSent: boolean;
}

export enum AccountStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  LOCKED = "locked",
}

export enum SessionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}
