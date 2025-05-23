import { differenceInHours, differenceInMinutes, format, isThisYear, isToday, isYesterday } from "date-fns";

export const convertRoleName = (role: string) => {
  return role.split("_").join(" ").toLowerCase();
};

export const getAbsoluteAddress = (
  destination: string | undefined,
  departureLocation: string | undefined
) => ` ${departureLocation?.split(",")[0]} - ${destination?.split(",")[0]}`;

export const generateRatingText = (rating: number | null | undefined): string => {
  if (!rating) return "No Rating";
  if (rating >= 4.5) return "Excellent";
  else if (rating >= 4.0) return "Very Good";
  else if (rating >= 3.0) return "Good";
  else if (rating >= 2.0) return "Average";
  else return "Poor";
};

export const formatPostDate = (date: Date): string => {
  const now = new Date();

  const minutesDiff = differenceInMinutes(now, date);
  const hoursDiff = differenceInHours(now, date);

  if (minutesDiff < 1) {
    return "Just now";
  }

  if (minutesDiff < 60) {
    return `${minutesDiff} minute${minutesDiff > 1 ? 's' : ''} ago`;
  }

  if (hoursDiff < 24 && isToday(date)) {
    return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d \'at\' HH:mm');
  }

  return format(date, 'MMM d, yyyy \'at\' HH:mm');
};