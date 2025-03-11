import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


import CreateError from "../config/error.config.js";
import InvalidatedToken from "../models/invalidated.model.js";

dotenv.config();
//Anh Tuan
export const isAuthorized = async (req, res, next) => {
  let accessToken;
  const authHeader = req.headers.Authorization || req.headers.authorization;
  if (!authHeader) {
    return next(CreateError("Unauthorized", StatusCodes.UNAUTHORIZED));
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return next(CreateError("Unauthorized", StatusCodes.UNAUTHORIZED));
    }
  }
  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET || "");
    if (!payload) {
      return next(CreateError("Invalid access token", StatusCodes.UNAUTHORIZED));
    }

    if (payload.exp < Date.now().valueOf() / 1000) {
      return next(CreateError("Access token expired", StatusCodes.UNAUTHORIZED));
    }

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(CreateError("Access denied", StatusCodes.FORBIDDEN));
    }
    next();
  };
};


export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access Denied. No Token Provided." });
    }

    // Check tra token o list đã logout 
    const blacklistedToken = await InvalidatedToken.findOne({ token: token });
    if (blacklistedToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token has been revoked. Please login again." });
    }

    // Check token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid Token" });
  }
};