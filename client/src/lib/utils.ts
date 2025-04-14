import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const checkAvailabilitySchedule = (dateRange: { from: Date; to: Date }, busyDates: Date[]): { available: boolean; conflictingDates: Date[] } => {
  const conflict = busyDates.filter((busy) => {
    const date = new Date(busy);
    return date >= dateRange.from && date <= dateRange.to;
  })

  return {
    available: conflict.length === 0,
    conflictingDates: conflict,
  }
}