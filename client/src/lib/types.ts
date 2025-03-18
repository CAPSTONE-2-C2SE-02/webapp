export type Tour = {
  _id: string;
  title: string;
  description: string;
  photo: string[];
  overalReview: number;
  destination: string;
}

export type UserInfo = {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}