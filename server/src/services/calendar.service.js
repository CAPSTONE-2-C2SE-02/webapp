import Calendar from "../models/calendar.model.js";

export const isDateBusy = async (tourGuideId, startDate, endDate) => {
    const calendar = await Calendar.findOne({ tourGuideId });
    if (!calendar) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return calendar.dates.some(({ date, status }) => {
        return (
            status !== "AVAILABLE" &&
            new Date(date) >= start &&
            new Date(date) <= end
        );
    });
};

export const setBookedDates = async (tourGuideId, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysToBook = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        daysToBook.push(new Date(d));
    }

    let calendar = await Calendar.findOne({ tourGuideId });
    if (!calendar) {
        calendar = await Calendar.create({ tourGuideId, dates: [] });
    }

    for (const day of daysToBook) {
        const existing = calendar.dates.find(d => d.date.toISOString().slice(0, 10) === day.toISOString().slice(0, 10));
        if (existing) {
            existing.status = "BOOKED";
        } else {
            calendar.dates.push({ date: day, status: "BOOKED" });
        }
    }

    await calendar.save();
};

export const releaseBookedDates = async (tourGuideId, startDate, endDate) => {
    const calendar = await Calendar.findOne({ tourGuideId });
    if (!calendar) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const isoDate = d.toISOString().slice(0, 10);
        const entry = calendar.dates.find(d => d.date.toISOString().slice(0, 10) === isoDate);
        if (entry && entry.status === "BOOKED") {
            entry.status = "AVAILABLE";
        }
    }

    await calendar.save();
};
