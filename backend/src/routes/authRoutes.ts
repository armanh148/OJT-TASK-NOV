import { Router } from 'express';
import { AuthController, registerSchema, loginSchema } from '../controllers/authController';
import { validate } from '../middleware/validateMiddleware';
import { authRateLimiter } from '../middleware/rateLimitMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.get('/me', authMiddleware, AuthController.me);

export default router;
