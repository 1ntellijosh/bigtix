/**
 * Current user routes for auth-srv
 *
 * @since auth-micro-start--JP
 */
import express, { Request, Response } from "express";
import { APIRequest as api } from '@bigtix/middleware';

const router = express.Router();

/**
 * Gets the current user data from the jwt in session (if present)
 */
router.get('/currentuser', api.getCurrentUser, (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };