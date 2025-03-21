import express from "express";

import authenticationController from "../controllers/authentication.controller.js";

const router = express.Router();

router.post("/login", authenticationController.login);
router.post("/introspect", authenticationController.introspect);
router.post("/logout", authenticationController.logout);
router.post('/login-google', authenticationController.loginGoogle);

export default router;