import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

// TODO: Add this to local asset library when this is added to project
const api = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }

router.get('/currentuser', api(async (req, res) => {
  console.log('Current user route hit:', req.body);
  res.send('Hello');
}));

export { router as usersRouter };