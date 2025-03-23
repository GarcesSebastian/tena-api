import { Router } from 'express';
import { GetData, SaveIpLocation, GetIpData, GetIpDataByIp } from '../controllers/user.controller.js';

const router = Router();

router.get('/get', GetData);
router.post('/save-precise-location', SaveIpLocation);
router.get('/get-ip-location', GetIpData);
router.get('/get-ip-location/:ip', GetIpDataByIp);
router.post("/set-ip-location", SaveIpLocation)

export default router;