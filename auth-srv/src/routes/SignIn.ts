/**
 * Sign in routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express from "express";
import { APIRequest as api } from '../middleware/APIRequest';

const router = express.Router();

router.post('/signin', api.call(async (req, res) => {
  console.log('Sign in route hit:', req.body);
  res.send('Sign in');
}));

export { router as signInRouter };