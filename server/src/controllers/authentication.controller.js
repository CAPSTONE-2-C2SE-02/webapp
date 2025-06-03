import { OAuth2Client } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import validator from "validator";
import Role from "../enums/role.enum.js";
import InvalidatedToken from "../models/invalidated.token.model.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";
import { comparePassword } from "../utils/password.util.js";
import { generateToken, verifyToken } from "../utils/token.util.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthenticationController {

    //[POST] auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Kiểm tra thiếu email hoặc password
            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Email and password are required.",
                });
            }

            // Kiểm tra định dạng email
            if (!validator.isEmail(email)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Invalid email format.",
                });
            }

            const user = await User.findOne({ email })
                .populate("role", "name");

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
            if (!payload) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid Google token" });
            }
            const { sub: googleId, email, name, picture } = payload;

            let user = await User.findOne({ googleId });
            const travelerRole = await RoleModel.findOne({ name: Role.TRAVELER });

            if (!user) {
                user = await User.findOne({ email });
                if (!user) {
                    user = new User({
                        googleId,
                        email,
                        username: email.split("@")[0],
                        fullName: name,
                        role: travelerRole._id,
                        profilePicture: picture,
                    });
                    await user.save();
                } else {
                    if (!user.profilePicture) {
                        user.profilePicture = picture;
                    }
                    user.googleId = googleId;
                    await user.save();
                }
            }

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
                message: "Login successfully",
                result: {
                    data: userResponse,
                    token: token,
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