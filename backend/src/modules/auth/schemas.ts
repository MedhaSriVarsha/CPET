import { z } from 'zod';

export const citizenSignupSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email address required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    consent: z.object({
      termsAccepted: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms of service and privacy policy' }),
      }),
      termsVersion: z.string().default('1.0'),
    }),
  }),
};

export const orgSignupSchema = {
  body: z.object({
    organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
    organizationType: z.enum([
      'MUNICIPAL',
      'UTILITY',
      'HEALTHCARE',
      'CONSUMER_GOODS',
      'TRANSPORT',
      'GOVERNMENT',
      'OTHER',
    ]),
    category: z.string().default('General'),
    adminName: z.string().min(2, 'Administrator name is required'),
    email: z.string().email('Valid corporate/work email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    consent: z.object({
      termsAccepted: z.literal(true, {
        errorMap: () => ({ message: 'Organization consent required' }),
      }),
      termsVersion: z.string().default('1.0'),
    }),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().min(1, 'Email or mobile number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const otpPurposeEnum = z.enum([
  'SIGNUP',
  'LOGIN',
  'PASSWORD_RESET',
  'PHONE_VERIFICATION',
  'EMAIL_VERIFICATION',
]);

const isValidEmailOrPhone = (val?: string) => {
  if (!val) return false;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isPhone = /^(\+?[0-9\s\-()]{7,20})$/.test(val.trim());
  return isEmail || isPhone;
};

export const otpRequestSchema = {
  body: z
    .object({
      target: z.string().min(1, 'Mobile number or email is required').optional(),
      email: z.string().min(1, 'Mobile number or email is required').optional(),
      purpose: otpPurposeEnum,
    })
    .refine((data) => Boolean(data.target || data.email), {
      message: 'Email or mobile number is required',
      path: ['target'],
    })
    .refine((data) => isValidEmailOrPhone(data.target || data.email), {
      message: 'Valid email address or mobile number required',
      path: ['email'],
    }),
};

export const otpVerifySchema = {
  body: z
    .object({
      target: z.string().min(1, 'Mobile number or email is required').optional(),
      email: z.string().min(1, 'Mobile number or email is required').optional(),
      otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
      purpose: otpPurposeEnum,
    })
    .refine((data) => Boolean(data.target || data.email), {
      message: 'Email or mobile number is required',
      path: ['target'],
    })
    .refine((data) => isValidEmailOrPhone(data.target || data.email), {
      message: 'Valid email address or mobile number required',
      path: ['email'],
    }),
};

export const otpResendSchema = {
  body: z
    .object({
      target: z.string().min(1, 'Mobile number or email is required').optional(),
      email: z.string().min(1, 'Mobile number or email is required').optional(),
      purpose: otpPurposeEnum,
    })
    .refine((data) => Boolean(data.target || data.email), {
      message: 'Email or mobile number is required',
      path: ['target'],
    })
    .refine((data) => isValidEmailOrPhone(data.target || data.email), {
      message: 'Valid email address or mobile number required',
      path: ['email'],
    }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().optional(),
  }),
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    target: z.string().min(1, 'Email or mobile number is required').optional(),
    email: z.string().min(1, 'Email or mobile number is required').optional(),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }).refine((data) => Boolean(data.target || data.email), {
    message: 'Email or mobile number is required',
    path: ['target'],
  }),
};

export const socialAuthSchema = {
  body: z.object({
    provider: z.enum(['GOOGLE', 'APPLE']),
    email: z.string().email('Valid email address required'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['CITIZEN', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN']).optional().default('CITIZEN'),
    providerId: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
};
