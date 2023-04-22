import { Router } from "express";
import { body } from "express-validator";
import userController from "../controllers/user-controller";
//import authMiddleware from '../middlewares/auth-middleware';

const router = Router();

router.post(
  "/registration",
  body("mobilePhone").isMobilePhone("any"),
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 64 }),
  userController.registration
);

router.post(
  "/login",
  body("mobilePhone").isMobilePhone("any"),
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 64 }),
  userController.login
);

router.post("/logout", userController.logout);

router.get("/activate/:link", userController.activate);

router.get("/refresh", userController.refresh);

//router.get('/users', authMiddleware, userController.getUsers);

export default router;
