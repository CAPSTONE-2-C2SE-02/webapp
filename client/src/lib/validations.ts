import { isAfter, subYears } from "date-fns";
import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required.");

export const loginSchema = z.object({
  email: requiredString.email("Please enter a valid email address."),
  password: requiredString.min(6, "Password must be at least 6 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signUpschema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(3, "Full Name must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    dateOfBirth: z
      .date({
        required_error: "Please select a date of birth",
      })
      .refine((date) => !isAfter(date, new Date()), {
        message: "Date of birth cannot be in the future",
      })
      .refine((date) => isAfter(new Date(), subYears(date, 13)), {
        message: "You must be at least 13 years old",
      }),
    role: z.enum(["traveller", "tourguide"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type SignUpValue = z.infer<typeof signUpschema>;

export const bookingSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  adults: z.number().min(0),
  youths: z.number().min(0),
  children: z.number().min(0),
});

export type BookingValues = z.infer<typeof bookingSchema>;