import { Router } from 'express';
import { GetData, SavePreciseLocation } from '../controllers/user.controller.js';

const router = Router();

router.get('/get', GetData);
router.post('/save-precise-location', SavePreciseLocation);

export default router;