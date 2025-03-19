import * as yup from "yup";

const calendarSchema = yup.object({
    dates: yup
        .array()
        .of(
            yup.object({
                date: yup.date().required("Date is required."),
                status: yup
                    .string()
                    .oneOf(["AVAILABLE", "UNAVAILABLE", "BOOKED"], "Invalid status.")
                    .required("Status is required."),
            })
        )
        .min(1, "At least one date is required.")
        .required("Dates array is required."),
});

export { calendarSchema };
