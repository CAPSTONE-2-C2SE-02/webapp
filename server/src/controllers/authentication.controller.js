import { StatusCodes } from "http-status-codes";
import InvalidatedToken from "../models/invalidated.token.model.js";
import User from "../models/user.model.js";
import { comparePassword, hashPassword} from "../utils/password.util.js";
import { generateToken, verifyToken } from "../utils/token.util.js";
import Profile from "../models/profile.model.js";
import { OAuth2Client } from "google-auth-library";
import RoleModel from "../models/role.model.js";
import Role from "../enums/role.enum.js";
import { key } from "../config/jwt.config.js";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthenticationController {

    //[POST] auth/token
    async token(req, res) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username: username });

            if (!user)
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Username does not exist." });

            const isPasswordValid = await comparePassword(password, user.password);

            if (!isPasswordValid)
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Wrong password." });

            const token = await generateToken(user);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Authentication successful.",
                token: token,
            });

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    //[POST] auth/introspect
    async introspect(req, res) {
        try {
            const { token } = req.body;

            const isValid = await verifyToken(token);

            if (isValid) {
                return res.status(StatusCodes.OK).json({
                    success: true,
                    message: "Valid Token.",
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid Token.",
                });
            }

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    //[POST] auth/logout
    async logout(req, res) {
        try {
            const invalidToken = {
                token: req.body.token
            };

            await InvalidatedToken.create(invalidToken);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Logout successfully.",
            });

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    // [POST] /auth/google
    async loginGoogle(req, res) {
        try {
            const { tokenGoogle } = req.body;

            const ticket = await client.verifyIdToken({
                idToken: tokenGoogle,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { email, sub } = payload;

            let profile = await Profile.findOne({ email: email });
            const travelerRole = await RoleModel.findOne({ name: Role.TRAVELER });

            let userCreated;
        
            if (!profile) {
                const user = {
                    username: email.split("@")[0],
                    password: await hashPassword("123456"),
                    role: travelerRole._id,
                }
                userCreated =  await User.create(user);
                profile = new Profile({
                    fullName: "Google account",
                    email: email,
                    phoneNumber: "657-895-6753",
                    userId: userCreated._id,
                    googleId: sub,
                });

                await profile.save();
            }

            const token = await generateToken(userCreated);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: token
            });

        } catch (error) {
            console.error("Google login error:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                success: false,
                error: "Internal Server Error" 
            });
        }
    }
};

export default new AuthenticationController;