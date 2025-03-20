import * as yup from "yup";
import Visibility from "../enums/visibility.enum.js";
import StatusTour from "../enums/statusTour.enum.js";

const tourSchema = yup.object({
    nameOfTour: yup
        .string()
        .min(5, "Tour name must be at least 5 characters")
        .max(100, "Tour name must not exceed 100 characters")
        .required("Tour name is required"),
    introduction: yup
        .string()
        .min(10, "Introduction must be at least 10 characters")
        .required("Introduction is required"),
    destination: yup
        .string()
        .required("Destination is required"),
    departureLocation: yup
        .string()
        .required("Departure location is required"),
    schedule: yup
        .array()
        .of(
            yup.object({
                day: yup
                    .number()
                    .min(1, "Day must be at least 1")
                    .required("Day is required"),
                title: yup
                    .string()
                    .min(3, "Schedule title must be at least 3 characters")
                    .max(100, "Schedule title must not exceed 100 characters")
                    .required("Schedule title is required"),
                description: yup
                    .string()
                    .min(5, "Schedule description must be at least 5 characters")
                    .required("Schedule description is required"),
            })
        )
        .min(1, "Schedule must have at least one day")
        .required("Schedule is required"),
    priceForAdult: yup
        .number()
        .min(0, "Price for adult must be at least 0")
        .required("Price for adult is required"),
    priceForYoung: yup
        .number()
        .min(0, "Price for young must be at least 0")
        .required("Price for young is required"),
    priceForChildren: yup
        .number()
        .min(0, "Price for children must be at least 0")
        .required("Price for children is required"),
    maxParticipants: yup
        .number()
        .min(1, "Max participants must be at least 1")
        .required("Max participants is required"),
    bookedParticipants: yup
        .number()
        .min(0, "Booked participants cannot be negative")
        .default(0),
    duration: yup
        .number()
        .min(1, "Duration must be at least 1 day")
        .required("Duration is required"),
    images: yup
        .array()
        .of(yup.string().url("Each image must be a valid URL"))
        .default([]),
    include: yup
        .string()
        .nullable(),
    notInclude: yup
        .string()
        .nullable(),
    visibility: yup
        .string()
        .oneOf(Object.values(Visibility), "Invalid visibility value")
        .default("PUBLIC"),
    status: yup
        .string()
        .oneOf(Object.values(StatusTour), "Invalid status value")
        .default("ACTIVE"),
});

export default tourSchema;
