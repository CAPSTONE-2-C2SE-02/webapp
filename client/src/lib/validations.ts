import { z } from "zod";

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