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

const fileSchema = z.custom<File>((val) => val instanceof File, {
  message: "Expected a file",
})

export const createTourSchema = z.object({
  title: z.string().min(1, "Name of Tour is required"),
  departureLocation: z.string().min(1, "Departure Location is required"),
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration is required"),
  priceForAdult: z.number().min(0, "Price for Adult must be a positive number"),
  priceForYoung: z.number().min(0, "Price for Young must be a positive number"),
  priceForChildren: z.number().min(0, "Price for Children must be a positive number"),
  maxParticipants: z.number().min(1, "Max number per group is required"),
  introduction: z.string().min(1, "Introduction is required"),
  schedule: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
    })
  ).optional()
  ,
  include: z.string().min(1, "Include section is required"),
  notInclude: z.string().min(1, "Not Include section is required"),
  images: z.array(fileSchema).optional(),
});

export type CreateTourValues = z.infer<typeof createTourSchema>;