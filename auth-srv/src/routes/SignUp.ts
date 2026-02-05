/**
 * Sign up routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express, { Request, Response } from "express";
import { APIValidation as valid } from '@bigtix/middleware';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { UserService } from '../UserService';

const router = express.Router();
const userSvc = new UserService();

/**
 * Signs up a new user
 *
 * @throws {BadRequestError}  If email is already in use
 */
router.post('/signup', [ valid.emailInBody('email'), valid.newPasswordInBody('password'), ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const newUser = await userSvc.createAndSignInUser(req, email, password);

    res.status(STATUS_CODES.CREATED).send(newUser);
  })
);

export { router as signUpRouter };