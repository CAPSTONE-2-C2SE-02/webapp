import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required.");

export const loginSchema = z.object({
  email: requiredString.email("Please enter a valid email address."),
  password: requiredString.min(6, "Password must be at least 6 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;