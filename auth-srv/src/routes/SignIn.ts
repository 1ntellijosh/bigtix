/**
 * Sign in routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express, { Request, Response } from "express";
import { APIRequest as api } from '../middleware/APIRequest';
import { APIValidation as valid } from '../middleware/APIValidation';
import { UserService } from '../UserService';
import { STATUS_CODES } from '../middleware/enums/StatusCodes';

const router = express.Router();
const userSvc = new UserService();

router.post('/signin', [ valid.emailInBody('email'), valid.currentPassword('password'), ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await userSvc.signIn(req, email, password);

    res.status(STATUS_CODES.SUCCESS).send(user);
  })
);

export { router as signInRouter };