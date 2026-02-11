/**
 * Sign in routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express, { Request, Response } from "express";
import { APIRequest as api } from '@bigtix/middleware';
import { body } from 'express-validator';
import { AuthService } from '../AuthService';
import { STATUS_CODES } from '@bigtix/common';

const router = express.Router();
const userSvc = new AuthService();

router.post('/signin',
  [ 
    body('email').isEmail().withMessage('Invalid email'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await userSvc.signIn(req, email, password);

    res.status(STATUS_CODES.SUCCESS).send(user);
  })
);

export { router as signInRouter };