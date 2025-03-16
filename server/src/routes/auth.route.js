import express from "express";

import authenticationController from "../controllers/authentication.controller.js";

const router = express.Router();

router.post("/token", authenticationController.token);
router.post("/introspect", authenticationController.introspect);
router.post("/logout", authenticationController.logout);

export default router;