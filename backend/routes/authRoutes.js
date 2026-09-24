import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  changePassword,
  registerValidation,
  loginValidation 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
