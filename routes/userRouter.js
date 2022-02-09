import express from 'express';
import { userController } from '../controllers';
import auth from '../middleware/authorization';
const router = express.Router();

router.get('/signin', userController.signIn);
router.post('/review', auth.userAuthentication, userController.postReview);
router.get('/review', userController.getReview);
router.get('/reviewAverage', userController.getReviewAverage);
router.post('/reviewAverage', userController.getReviewAverage);
router.post(
  '/member',
  auth.userAuthentication,
  userController.memberAuthorization
);

export default router;
