/**
 * Sign out routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express from "express";
import { APIRequest as api } from '../middleware/APIRequest';

const router = express.Router();

router.post('/signout', api.call(async (req, res) => {
  console.log('Sign out route hit:', req.body);
  res.send('Sign out');
}));

export { router as signOutRouter };