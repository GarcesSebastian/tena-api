import { Router } from 'express';
import { GetData, SavePreciseLocation, GetIpData, SaveIpLocation, GetIpDataByIp } from '../controllers/user.controller.js';

const router = Router();

router.get('/get', GetData);
router.post('/save-precise-location', SavePreciseLocation);
router.get('/get-ip-location', GetIpData);
router.get('/get-ip-location/:ip', GetIpDataByIp);
router.post("/set-ip-location", SaveIpLocation)

export default router;