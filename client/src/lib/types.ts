export type Post = {
  _id: string;
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  },
  hashtag: string[];
  content: string[];
  imageUrls: string[];
  likes: Pick<UserInfo, | "_id" | "username" | "fullName">[];
  tourAttachment?: TourAttachment;
  createdAt: string;
  updatedAt: string;
}

export type PostsNewFeed = {
  // totalPosts: number;
  // totalPage: number;
  // currentPage: number;
  // limit: number;
  nextPage: number;
  data: Post[];
}

export type Comment = {
  _id: string;
  postId: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  },
  content: string;
  childComments?: Comment[];
  parentComment?: string;
  likes: Pick<UserInfo, | "_id" | "username" | "fullName">[];
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
  introduction: string;
  imageUrls: string[];
  rating: number;
  departureLocation: string;
  destination: string;
  priceForAdult: number;
  priceForYoung: number;
  priceForChildren: number;
  maxParticipants: number;
  duration: string;
  schedule:
  {
    title: string;
    description: string;
  }[];
  include: string[];
  notInclude: string[];
  reviews: Review[];
  author: {
    _id: string,
    fullName: string,
    username: string;
    profilePicture: string,
    busyDates: Date[]
  };
}

export type TourList = {
  totalTours: number;
  totalPage: number;
  currentPage: number;
  data: Tour[];
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

export type Notification = {
  id: string;
  type: string;
  user: {
    name: string;
    profilePicture: string;
  };
  extraInfo?: string;
  postTitle?: string;
  content?: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
}