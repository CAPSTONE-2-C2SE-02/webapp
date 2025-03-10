import mongoose from "mongoose";

import connectMongoDB from "./db.config.js";
import Role from "../enums/role.enum.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";

const initialRoles = async () => {
    try {
        const existRoles = await RoleModel.find();
        const existRoleNames = existRoles.map(role => role.name);
        const rolesToCreate = Object.values(Role).filter(role => !existRoleNames.includes(role));

        if (rolesToCreate.length > 0) {
            await RoleModel.insertMany(rolesToCreate.map(name => ({ name })));
            console.log('✅ Roles have been added to the database:', rolesToCreate);
        } else {
            console.log('✅ All roles already exist.');
        }
    } catch (error) {
        console.error('❌ Error initializing roles:', error);
    }
};

const initialAdminAccount = async () => {
    try {
        const existAdminAccount = await User.findOne({
            $or: [
                { username: "admin" },
                { email: "admin@example.com" }
            ]

        });

        const adminRole = await RoleModel.findOne({ name: Role.ADMIN });

        if (!adminRole) {
            console.error('❌ Role admin not found.');
        } else {
            if (!existAdminAccount) {
                const adminAccount = {
                    fullname: "Duc",
                    username: "admin",
                    password: "123456",
                    email: "admin@gmail.com",
                    phoneNumber: "657-895-6753",
                    role: adminRole._id
                };
                //address: "Admin Address",

                await User.create(adminAccount);

                console.log('✅ Admin account has been created with default username and password: admin. Please change it immediately!');
            } else {
                console.log('✅ Admin account already exists.');
            }
        }
    } catch (error) {
        console.error('❌ Error initializing admin account:', error);
    }
}

const initialApplication = async () => {
    try {
        await connectMongoDB();
        await initialRoles();
        await initialAdminAccount();
    } catch (error) {
        console.error("❌ Error initializing application:", error);
    } finally {
        mongoose.connection.close();
    }
};

initialApplication();