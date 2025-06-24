import { Router } from 'express';
import transactionRoutes from './transactionRoutes';

const router = Router();

router.use('/transactions', transactionRoutes);

export default router;
