import { Router } from 'express';
import { CreateForm, GetAllForms, GetFormById, UpdateForm, DeleteForm } from '../controllers/forms.controller.js';

const router = Router();

router.post('/create', CreateForm);
router.get('/get', GetAllForms);
router.get('/get/:id', GetFormById);
router.put('/update/:id', UpdateForm);
router.delete('/delete/:id', DeleteForm);

export default router;