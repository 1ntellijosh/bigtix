/**
 * Current user routes for auth-srv
 *
 * @since auth-micro-start--JP
 */
import express from "express";
import { APIRequest as api } from '../middleware/APIRequest';

const router = express.Router();

router.get('/currentuser', api.call(async (req, res) => {
  // App errors, throw new RequestValidationError('Request failed', STATUS_CODES.BAD_REQUEST)
  console.log('Current user route hit:', req.body);
  res.send('Hello');
}));

export { router as currentUserRouter };