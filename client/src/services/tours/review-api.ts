import axiosInstance from "@/config/api";
import { ApiResponse, Review } from "@/lib/types";
import { CreateReviewValues } from "@/lib/validations";

export const createReview = async (data: CreateReviewValues & { bookingId: string }) => {
  const formData = new FormData();
  formData.append("bookingId", data.bookingId);
  formData.append("rating", data.rating.toString());
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