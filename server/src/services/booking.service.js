import redis from "../config/redis.config.js";
import Tour from "../models/tour.model.js";
import { differenceInCalendarDays, format } from "date-fns";

const BOOKING_SLOT_PREFIX = "booking_slots_";

const formatDate = (date) => format(new Date(date), "yyyy-MM-dd");

const getRedisKeysForDateRange = (tourId, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInCalendarDays(end, start) + 1;

    const keys = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        keys.push(`${BOOKING_SLOT_PREFIX}${tourId}_${formatDate(date)}`);
    }
    console.log("keys: ", keys);

    return keys;
};

export const reserveSlots = async (tourId, slots, startDate, endDate) => {
    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error("Tour not found");

    const keys = getRedisKeysForDateRange(tourId, startDate, endDate);

    for (const key of keys) {
        const current = parseInt(await redis.get(key)) || 0;
        if (current + slots > tour.maxParticipants) {
            return false;
        }
    }

    for (const key of keys) {
        const current = parseInt(await redis.get(key)) || 0;
        await redis.set(key, current + slots, "EX", 180);
    }

    return true;
};

export const releaseSlots = async (tourId, slots, startDate, endDate) => {
    const keys = getRedisKeysForDateRange(tourId, startDate, endDate);

    for (const key of keys) {
        const current = parseInt(await redis.get(key)) || 0;

        if (current >= slots) {
            await redis.set(key, current - slots, "EX", 180);
        } else {
            await redis.del(key);
        }
    }
};