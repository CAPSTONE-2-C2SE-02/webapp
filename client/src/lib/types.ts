export type Post = {
  _id: string;
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  },
  hashtag: string[];
  content: string[];
  imageUrls: string[];
  likes: UserInfo[];
  tourAttachment?: TourAttachment;
  createdAt: string;
  updatedAt: string;
}

export type TourAttachment = {
  _id: string;
  title: string;
  introduction: string;
  destination: string;
  imageUrls: string[];
}

export type Tour = {
  _id: string;
  title: string;
  description: string;
  photo: string[];
  rating: number;
  location: string;
  price: number;
  duration: string;
  create_by: string;
}

export type TourDetail = {
  _id: string;
  title: string;
  description: string;
  photos: string[];
  rating: number;
  depatureLocation: string;
  destination: string;
  price: number;
  duration: string;
  schedule:
  {
    title: string;
    description: string;
  }[];
  includes: string[];
  notIncludes: string[];
  reviews: Review[];
  introduction: string;
  tourGuides: {
    _id: string,
    name: string,
    avatar: string,
    busyDates: Date[]
  };
}

export type Review = {
  _id: string;
  user: string;
  rating: number;
  tourReview: string;
  tourGuideReview: string;
  images?: string[];
  createdAt: string;
}

export type UserInfo = {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: 'TOUR_GUIDE' | 'TRAVELER';
  address: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  followers: string[];
  followings: string[];
  createdAt: string;
  updatedAt: string;
}

export type LoginInfo = {
  token: string;
  data: UserInfo;
}

export interface ApiResponse<T = LoginInfo> {
  success: boolean;
  message?: string;
  error?: string;
  result?: T
}

export type ErrorResponse = {
  status: number;
  data: {
    error: string;
    success: boolean;
  }
}