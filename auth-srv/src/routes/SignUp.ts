/**
 * Sign up routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express, { Request, Response } from "express";
import { APIValidation as valid } from '../middleware/APIValidation';
import { APIRequest as api } from '../middleware/APIRequest';
import { STATUS_CODES } from '../middleware/enums/StatusCodes';
import { UserService } from '../UserService';

const router = express.Router();
const userSvc = new UserService();

/**
 * Signs up a new user
 *
 * @throws {BadRequestError}  If email is already in use
 */
router.post('/signup', [ valid.emailInBody('email'), valid.newPassword('password'), ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const newUser = await userSvc.createAndSignInUser(req, email, password);

    res.status(STATUS_CODES.CREATED).send(newUser);
  })
);

export { router as signUpRouter };