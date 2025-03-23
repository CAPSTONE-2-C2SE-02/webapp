import * as yup from "yup";

const userSchema = yup.object({
    password: yup
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(30, "Password must not exceed 30 characters.")
        .required("Password is required."),

    fullName: yup
        .string()
        .min(3, "Full name must be at least 3 characters.")
        .max(50, "Full name must not exceed 50 characters.")
        .required("Full name is required."),

    email: yup
        .string()
        .email("Invalid email format.")
        .required("Email is required."),

    phoneNumber: yup
        .string()
        .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits.")
        .required("Phone number is required."),

    address: yup.string().nullable(),

    profilePicture: yup.string().nullable(),

    coverPhoto: yup.string().nullable(),

    bio: yup
        .string()
        .max(500, "Bio must not exceed 500 characters.")
        .nullable(),

    active: yup.boolean().default(true),

    dateOfBirth: yup
        .date()
        .max(new Date(), "Date of birth cannot be in the future.")
        .test("age", "You must be at least 13 years old.", function (value) {
            const today = new Date();
            const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
            return value <= minAgeDate;
        })
        .required("Date of birth is required."),
});

export { userSchema };
