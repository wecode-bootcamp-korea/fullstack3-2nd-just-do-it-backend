import express from 'express';
import { userController } from '../controllers';
import auth from '../middleware/authorization';
const router = express.Router();

router.post('/signin', userController.signIn);
router.post('/member', auth.authentication, userController.memberAuthorization);

export default router;
