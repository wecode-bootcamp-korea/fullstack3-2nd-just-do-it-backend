import express from 'express';
import { snkrsController } from '../controllers';
import auth from '../middleware/authorization';
const router = express.Router();

router.get('/detail/:style_code', snkrsController.snkrsDetail);
router.post(
  '/',
  auth.userAuthentication,
  snkrsController.createUsersToLottoBox
);
router.put('/', auth.userAuthentication, snkrsController.getWinnerList);
router.get('/list', snkrsController.snkrsList);

export default router;
