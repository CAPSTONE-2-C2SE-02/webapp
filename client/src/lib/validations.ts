import { differenceInYears, isFuture, isValid } from "date-fns";
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
    dateOfBirth: z.date()
      .refine((date) => isValid(date), { message: "Invalid birth date" })
      .refine(
        (date) => !isFuture(date),
        { message: "Birth date cannot be in the future" }
      )
      .refine(
        (date) => differenceInYears(new Date(), date) >= 13,
        { message: "You must be at least 13 years old" }
      ),
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
  introduction: requiredString.min(10, "Introduction must be at least 10 characters"),
  schedule: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
    })
  ).optional(),
  include: z.string().min(1, "Include section is required"),
  notInclude: z.string().min(1, "Not Include section is required"),
  images: z.array(fileSchema).optional(),
}).refine((data) => data.schedule?.length === data.duration, {
  message: "Schedule must be equal to duration",
  path: ["schedule"],
});

export type CreateTourValues = z.infer<typeof createTourSchema>;

export const profileSchema = z.object({
  firstName: requiredString,
  lastName: requiredString,
  email: requiredString.email("Please enter a valid email address."),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits.").optional().or(z.literal("")),
  city: z.string().optional(),
  dateOfBirth: z.date()
    .refine((date) => isValid(date), { message: "Invalid birth date" })
    .refine(
      (date) => !isFuture(date),
      { message: "Birth date cannot be in the future" }
    )
    .refine(
      (date) => differenceInYears(new Date(), date) >= 13,
      { message: "You must be at least 13 years old" }
    ),
  introduction: z.string().optional(),
  avatar: z.union([z.string(), z.instanceof(File)]).optional(),
  coverPhoto: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const bookingFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  note: z.string().optional(),
  type: z.enum(["payment", "reserve"]),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const createReviewSchema = z.object({
  ratingForTour: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  ratingForTourGuide: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewTour: z.string().max(500, "Tour review cannot exceed 500 characters"),
  reviewTourGuide: z.string().max(500, "Guide review cannot exceed 500 characters"),
  imageUrls: z.array(z.union([z.instanceof(File), z.string()]))
  .max(5, "You can upload up to 5 images"),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;

export const cancelTourValues = z.object({
  secretKey: z.string().min(1, "Booking code must be at least 1").max(20, "booking cannot exceed 10"),
  fullName: z.string().min(1, "Full Name must be at least 1").max(125, "Full name cannot exceed 125"),
  email: z.string().min(1, "email not true"),
  phoneNumber: z.string().min(1, "phonenumber not true"),
  reason: z.string().max(500, "reason cannot exceed 500 characters"),
});

export type CancelTourValues = z.infer<typeof cancelTourValues>;