/**
 * Sign out routes for auth-srv
 *
 * @since users-service-continued--JP
 */
import express from "express";

const router = express.Router();

/**
 * Signs out the current user
 */
router.post('/signout', (req, res) => {
  if (req.session) {
    delete req.session.jwt;
  }

  res.send({});
});

export { router as signOutRouter };