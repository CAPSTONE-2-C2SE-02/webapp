import * as yup from "yup";

const bookingSchema = yup.object({
    tourId: yup.string().required("Tour ID is required"),
    startDate: yup.date()
        .min(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), "Start date must be at least 2 days from today")
        .required("Start date is required"),
    endDate: yup.date()
        .min(yup.ref("startDate"), "End date must be after start date")
        .required("End date is required"),
    totalAmount: yup.number()
        .required("Total amount is required"),
});

export { bookingSchema };