import axiosInstance from "@/config/api";
import { API } from "@/config/constants";
import publicApi from "@/config/public.api";
import { ApiResponse, Review } from "@/lib/types";
import { CreateReviewValues } from "@/lib/validations";
import { AxiosError } from "axios";

export const createReview = async (
  data: CreateReviewValues & { bookingId: string }
) => {
  const formData = new FormData();
  formData.append("bookingId", data.bookingId);
  formData.append("ratingForTour", data.ratingForTour.toString());
  formData.append("ratingForTourGuide", data.ratingForTourGuide.toString());
  formData.append("reviewTour", data.reviewTour);
  formData.append("reviewTourGuide", data.reviewTourGuide);
  data.imageUrls.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axiosInstance.post<ApiResponse<Review>>(
    "/reviews",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const fetchReviewByBookingId = async (
  bookingId: string
): Promise<Review | null> => {
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  try {
    const response = await axiosInstance.get(API.REVIEW.REVIEW_INFO(bookingId));

    if (!response?.data?.result) {
      throw new Error("Invalid response structure");
    }
    return response.data.result as Review;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(
        `Failed to fetch review: ${
          error.response?.data?.error || error.message
        }`
      );
    }
    throw new Error(`Failed to fetch review: ${(error as Error).message}`);
  }
};

export const fetchReviewByTourGuideId = async (
  tourGuideId: string
): Promise<Review[]> => {
  const response = await axiosInstance.get(
    API.REVIEW.REVIEW_TOURGUIDE(tourGuideId)
  );
  return response.data.result;
};

// get reivews by tour id
export const fetchReviewsByTourId = async (
  tourId: string
): Promise<ApiResponse<Review[]>> => {
  const response = await publicApi.get(API.REVIEW.TOUR(tourId));
  return response.data;
};

interface UpdateReviewResponse {
  success: boolean;
  result: any;
  message: string;
}

export const updateReview = async (reviewId: string, data: Partial<CreateReviewValues>) => {
  const formData = new FormData();

  if (data.ratingForTour !== undefined) {
    formData.append("ratingForTour", data.ratingForTour.toString());
  }
  if (data.ratingForTourGuide !== undefined) {
    formData.append("ratingForTourGuide", data.ratingForTourGuide.toString());
  }
  if (data.reviewTour !== undefined) {
    formData.append("reviewTour", data.reviewTour);
  }
  if (data.reviewTourGuide !== undefined) {
    formData.append("reviewTourGuide", data.reviewTourGuide);
  }

  if (data.imageUrls && data.imageUrls.length > 0) {
    const images = data.imageUrls.filter(file => !(typeof file === 'string'));
    images.forEach((file) => {
      formData.append("images", file);
    })
  }

  const response = await axiosInstance.put<UpdateReviewResponse>(`/reviews/${reviewId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}