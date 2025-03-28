import redis from "../config/redis.config.js";
import Tour from "../models/tour.model.js";

const BOOKING_SLOT_PREFIX = "booking_slots_";

export const reserveSlots = async (tourId, slots, ttl = 180) => {
    const key = `${BOOKING_SLOT_PREFIX}${tourId}`;

    const currentReserved = parseInt(await redis.get(key)) || 0;
    console.log(currentReserved);


    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error("Tour not found");

    const availableSlots = tour.availableSlots - currentReserved;

    if (availableSlots < slots) {
        return false;
    }

    await redis.set(key, currentReserved + slots, "EX", ttl);

    return true;
};

export const releaseSlots = async (tourId, slots) => {
    const key = `${BOOKING_SLOT_PREFIX}${tourId}`;
    const currentReserved = parseInt(await redis.get(key)) || 0;

    if (currentReserved >= slots) {
        await redis.set(key, currentReserved - slots, "EX", 180);
    } else {
        await redis.del(key);
    }
};