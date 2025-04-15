import axiosInstance from "@/config/api";
import { API } from "@/config/constants";
import { ApiResponse, Review } from "@/lib/types";
import { CreateReviewValues } from "@/lib/validations";
import { AxiosError } from "axios";

export const createReview = async (data: CreateReviewValues & { bookingId: string }) => {
  const formData = new FormData();
  formData.append("bookingId", data.bookingId);
  formData.append("ratingForTour", data.ratingForTour.toString());
  formData.append("ratingForTourGuide", data.ratingForTourGuide.toString());
  formData.append("reviewTour", data.tourReview);
  formData.append("reviewTourGuide", data.guideReview);
  data.images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axiosInstance.post<ApiResponse<Review>>("/reviews", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
 export const fetchReviewByBookingId = async (bookingId: string) : Promise<Review | null> => {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  try {
    const response = await axiosInstance.get(API.REVIEW.REVIEW_INFO(bookingId));

    if (!response?.data?.result) {
      throw new Error("Invalid response structure");
    }
    const apiReview = response.data.result;
    
    const review : Review = {
      _id: apiReview._id,
      bookingId: apiReview.bookingId,
      ratingForTour: apiReview.rating || 5, 
      ratingForTourguide: apiReview.ratingForTourguide || 5, 
      tourReview: apiReview.reviewTour || "", 
      tourGuideReview: apiReview.reviewTourGuide || "", 
      images: apiReview.imageUrl || [], 
      user: apiReview.user, 
      createdAt: apiReview.createdAt, 
    };

    return review;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch review: ${error.response?.data?.error || error.message}`);
    }
    throw new Error(`Failed to fetch review: ${(error as Error).message}`);
  }
 }

 export const fetchReviewByTourGuideId = async (tourGuideId: string) : Promise <Review[]>  => {
  const response = await axiosInstance.get(API.REVIEW.REVIEW_TOURGUIDE(tourGuideId));
  return response.data.result;
 }