/**
 * Sign up routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES } from '@bigtix/common';
import { UserService } from '../UserService';
// import { EventPublisher } from '@bigtix/middleware';
// import { AuthEventFactory } from '../events/AuthEventFactory';
// import { EventTypesEnum } from '@bigtix/middleware';

const router = express.Router();
const userSvc = new UserService();

/**** Event usage example

import { EventPublisher } from '@bigtix/middleware';
import { AuthEventFactory, EventTypesEnum } from './events/AuthEventFactory';
...
const factory = new AuthEventFactory(EventTypesEnum.USER_CREATED);
const publisher = new EventPublisher(factory);
await publisher.publishEvent('auth-srv.user-events', EventTypesEnum.USER_CREATED, { userId: newUser.id, email });

****/

/**
 * Signs up a new user
 *
 * @throws {BadRequestError}  If email is already in use
 */
router.post('/signup',
  [ body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 }).matches(/\d/).withMessage('Password must be at least 8 characters and no more than 20 characters')
      .matches('[A-Z]').withMessage('Password must contain at least one capital letter')
      .matches('[a-z]').withMessage('Password must contain at least one lowercase letter')
      .matches('[0-9]').withMessage('Password must contain at least one number')
  ],
  api.validateRequest,
  api.callAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const newUser = await userSvc.createAndSignInUser(req, email, password);

    res.status(STATUS_CODES.CREATED).send(newUser);
  })
);

export { router as signUpRouter };