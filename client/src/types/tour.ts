// src/types/tour.ts
export interface Tour {
    name: string;
    departureLocation: string;
    destination: string;
    duration: string;
    price: number;
    images: string[];
    introduction: string;
    schedule: { title: string; description: string }[];
    include: string;
    notInclude: string;
    reviews: Review[];
}

export interface Review {
    user: string;
    date: string;
    rating: number;
    content: string;
    role: string;
    question: string;
    images: string[];
}

export interface BookingState {
    adults: number;
    youths: number;
    children: number;
    fromDate: string;
    toDate: string;
    isCalendarOpen: boolean;
    selectedRange: { from: Date | undefined; to: Date | undefined };
}