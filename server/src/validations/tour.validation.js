import * as yup from "yup";
import Visibility from "../enums/visibility.enum.js";
import StatusTour from "../enums/statusTour.enum.js";

const tourSchema = yup.object({
    title: yup.string().min(5).max(100).required("Title is required"),
    description: yup.string().min(10).required("Description is required"),
    location: yup.string().required("Location is required"),
    itinerary: yup.array().of(
        yup.object({
            day: yup.number().min(1).required("Day is required"),
            title: yup.string().min(3).max(100).required("Itinerary title is required"),
            description: yup.string().min(5).required("Itinerary description is required"),
        })
    ),
    price: yup.number().min(0).required("Price is required"),
    maxParticipants: yup.number().min(1).required("Max participants is required"),
    bookedParticipants: yup.number().min(0).default(0),
    startDate: yup.date().required("Start date is required"),
    endDate: yup.date()
        .required("End date is required")
        .min(yup.ref("startDate"), "End date must be after start date"),
    duration: yup.number().min(1).required("Duration is required"),
    images: yup.array().of(yup.string().url("Each image must be a valid URL")),
    visibility: yup.string().oneOf(Object.values(Visibility)).default("PUBLIC"),
    status: yup.string().oneOf(Object.values(StatusTour)).default("ACTIVE"),
});

export default tourSchema;
