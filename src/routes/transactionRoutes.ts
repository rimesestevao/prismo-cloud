import { Router } from 'express';
import { createTransaction } from '../controllers/transactionController';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.post('/', catchAsync(createTransaction));

export default router;
