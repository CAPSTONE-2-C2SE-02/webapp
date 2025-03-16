import { StatusCodes } from "http-status-codes";
import InvalidatedToken from "../models/invalidated.token.model.js";
import User from "../models/user.model.js";
import { comparePassword } from "../utils/password.util.js";
import { generateToken, verifyToken } from "../utils/token.util.js";


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
};

export default new AuthenticationController;