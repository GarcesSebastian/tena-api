import { Router } from 'express';
import { GetData, GetIpData, GetIpDataAll } from '../controllers/user.controller.js';

const router = Router();

router.get('/get', GetData);
router.get("/get-ip-location", GetIpDataAll)
router.get('/get-ip-location/:ip', GetIpData);

export default router;