import { Router } from 'express';
import { CreateService, GetAllServices, DeleteService } from '../controllers/services.controller.js';

const router = Router();

router.post('/create', CreateService);
router.get('/get', GetAllServices);
router.delete('/delete/:id', DeleteService);

export default router;