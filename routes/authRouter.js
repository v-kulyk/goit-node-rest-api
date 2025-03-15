import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
} from "../controllers/authControllers.js";
import authenticate from "../middleware/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import {
  registerSchema,
  loginSchema,
  subscriptionSchema,
} from "../schemas/authSchemas.js";

const authRouter = express.Router();

// Registration route
authRouter.post("/register", validateBody(registerSchema), register);

// Login route
authRouter.post("/login", validateBody(loginSchema), login);

// Protected routes (require authentication)
authRouter.post("/logout", authenticate, logout);
authRouter.get("/current", authenticate, getCurrent);
authRouter.patch(
  "/subscription",
  authenticate,
  validateBody(subscriptionSchema),
  updateSubscription
);

export default authRouter;
