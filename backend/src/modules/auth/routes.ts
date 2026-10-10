import { Router } from 'express';
import { authController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { otpRateLimiter } from '../../middleware/rateLimiter.js';
import {
  citizenSignupSchema,
  orgSignupSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  otpResendSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  socialAuthSchema,
} from './schemas.js';

export const authRouter = Router();

authRouter.post('/citizen/signup', validate(citizenSignupSchema), authController.registerCitizen);
authRouter.post('/organization/signup', validate(orgSignupSchema), authController.registerOrganization);
authRouter.post('/login', validate(loginSchema), authController.login);

// Password Reset Flow
authRouter.post('/reset-password', otpRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Social OAuth (Google & Apple)
authRouter.post('/social-login', validate(socialAuthSchema), authController.socialLogin);
authRouter.post('/google', validate(socialAuthSchema), authController.socialLogin);
authRouter.post('/apple', validate(socialAuthSchema), authController.socialLogin);

// OTP Endpoints with strict Rate Limiting
authRouter.post('/otp/request', otpRateLimiter, validate(otpRequestSchema), authController.requestOtp);
authRouter.post('/otp/verify', otpRateLimiter, validate(otpVerifySchema), authController.verifyOtp);
authRouter.post('/otp/resend', otpRateLimiter, validate(otpResendSchema), authController.resendOtp);

// Standard Email OTP Aliases
authRouter.post('/email-otp/send', otpRateLimiter, validate(otpRequestSchema), authController.requestOtp);
authRouter.post('/email-otp/verify', otpRateLimiter, validate(otpVerifySchema), authController.verifyOtp);
authRouter.post('/email-otp/resend', otpRateLimiter, validate(otpResendSchema), authController.resendOtp);

authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);
