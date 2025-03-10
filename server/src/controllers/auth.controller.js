import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";


import { key } from "../config/jwt.config.js";
import InvalidatedToken from "../models/invalidated.model.js";
import User from "../models/user.model.js";
import RoleModel from "../models/role.model.js";
import Role from "../enums/role.enum.js";

dotenv.config();

const JWTSecure = {
    ACCESS: {
        SECRET: process.env.ACCESS_TOKEN_SECRET,
        EXPIRE: "10m"
    }
};

class AuthController {
    //registration method
    async register(req, res) {
        try {
            const { fullname, email, password, phoneNumber, role } = req.body;
            const existingUser = await User.findOne({ $or: [{ fullname: fullname }, { email: email }] });
            if (existingUser) {
                return res.status(StatusCodes.CONFLICT).json({ message: "User already exists" });
            }

            let roleID;
            if (role) {
                const existingRole = await RoleModel.findById(role);
                if (!existingRole) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid role ID" });
                }
                roleID = existingRole._id;
            } else {
                const travelerRole = await RoleModel.findOne({ name: Role.TRAVELER });

                if (!travelerRole)
                    return res.status(StatusCodes.NOT_FOUND).json({ message: "Role not found." });
                roleID = travelerRole._id;
            }


            const username = email.split('@')[0];
            const user = new User({ fullname, email, username, password, phoneNumber, role: roleID });
            await user.save();
            return res.status(StatusCodes.CREATED).json({ message: "User created successfully", user });
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
        }
    }

    //Login method
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            };
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid Password" });
            }
            const userData = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber
            };

            const token = key.generateToken(userData, JWTSecure.ACCESS.SECRET, JWTSecure.ACCESS.EXPIRE);

            return res.status(StatusCodes.OK).json({
                data: userData,
                token: token,
                message: "User logged in successfully"
            });

        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
        }
    }

    //Anh_Tuan
    async logout(req, res) {
        try {
            const invalidToken = { token: req.body.token };

            const existingToken = await InvalidatedToken.findOne({ token: invalidToken.token });
            if (existingToken) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Token has already been invalidated."
                });
            }

            await InvalidatedToken.create(invalidToken);

            return res.status(StatusCodes.OK).json({
                message: "Logout successfully."
            });

        } catch (error) {
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error.",
            });
        }
    }
};

export const authController = new AuthController();