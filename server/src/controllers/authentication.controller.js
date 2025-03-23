import { OAuth2Client } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import InvalidatedToken from "../models/invalidated.token.model.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import { generateToken, verifyToken } from "../utils/token.util.js";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthenticationController {

    //[POST] auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email })
                .populate("roleId", "name");

            if (!user)
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "Account does not exist." });

            const isPasswordValid = await comparePassword(password, user.password);

            if (!isPasswordValid)
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "Wrong password." });

            const token = await generateToken(user);

            const userResponse = {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                email: user.email
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Login successfully.",
                result: {
                    token: token,
                    data: userResponse
                },
            });

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
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
                error: error.message,
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
                error: error.message,
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

            let user = await User.findOne({ email: email });
            const travelerRole = await RoleModel.findOne({ name: Role.TRAVELER });

            let userCreated;

            if (!user) {
                const user = {
                    username: email.split("@")[0],
                    password: await hashPassword("123456"),
                    roleId: travelerRole._id,
                    fullName: "Google Account",
                    email: email,
                    phoneNumber: "1867891596",
                    googleId: sub,
                }
                userCreated = await User.create(user);
            }

            const token = await generateToken(userCreated);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    data: userCreated,
                    token: token
                }
            });

        } catch (error) {
            console.error("Google login error:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }
};

export default new AuthenticationController;