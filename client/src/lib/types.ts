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
  bookmarks: BookmarkUser[];
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
  totalBookings: number;
  duration: number;
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
  bookmarks: BookmarkUser[];
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
  bookingId: Booking;
  ratingForTour: number;
  ratingForTourGuide: number;
  reviewTour: string;
  reviewTourGuide: string;
  imageUrls?: string[];
  createdAt: string;
  tourId?: Tour;
  travelerId?: UserInfo;
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
  postImages: string[];
  bio?: string;
  followers: Follow[];
  followings: Follow[];
  createdAt: string;
  updatedAt: string;
  rating: number;
}

export type Follow = {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  followers: string[];
  role: {
    _id: string;
    name: string;
  }
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

type BaseNotification = {
  _id: string;
  message: string;
  isRead: boolean;
  senderId?: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  };
  receiverId: string;
  createdAt: string;
  updatedAt: string;
};

export type Notification =
  | (BaseNotification & {
    type: "LIKE" | "COMMENT";
    relatedModel: "Post";
    relatedId: Post;
  })
  | (BaseNotification & {
    type: "BOOKING";
    relatedModel: "Tour";
    relatedId: Tour;
  })
  | (BaseNotification & {
    type: "FOLLOW";
    relatedModel: "User";
    relatedId: UserInfo;
  });

export type AuthUserInfo = {
  _id: string;
  username: string;
  email: string;
};

export interface UserResponse {
  result: UserInfo;
}

export interface EditProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  dateOfBirth: Date;
  introduction: string;
  avatar?: string | File;
  coverPhoto?: string | File;
}

export interface DateEntry {
  _id: string;
  date: Date; // "YYYY-MM-DD"
  status: 'UNAVAILABLE' | 'AVAILABLE'; // As expected by the backend
}

export interface Calendar {
  _id: string;
  tourGuideId: string;
  dates: DateEntry[];
}

export interface SetAvailabilityResponse {
  success: boolean;
  message: string;
  result: Calendar;
}

export interface Booking {
  _id: string;
  tourId: {
    _id: string;
    title: string;
    departureLocation: string;
    destination: string;
    imageUrls: string[];
    duration: string;
    image?: string;
  };
  travelerId: string;
  startDate: string;
  endDate: string;
  adults: number;
  youths: number;
  children: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "TIMEOUT" | "FAILED" | "PAID" | "REFUNDED";
  status: "PENDING" | "PAID" | "FAILED" | "CANCELED" | "TIMEOUT" | "COMPLETED" | "WAITING_CONFIRM";
  isReview: boolean;
  fullName: string;
  phoneNumber: string;
  email: string;
  secretKey: string;
  cancellationReason: string;
}

export interface TourBookingInfoCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onPayment: (bookingId: string) => void;
  onComplete: (bookingId: string) => void;
  onReview: (bookingId: string) => void;
}

export interface PaymentResponse {
  _id: string;
  bookingId: Pick<Booking, "_id" | "status" | "paymentStatus" | "tourId" | "travelerId" | "adults" | "children" | "youths">;
  userId: Pick<UserInfo, "_id" | "email" | "fullName" | "phoneNumber">,
  transactionId: string;
  transactionNo: string;
  bankCode: string;
  typePayment: 'VNPAY' | 'MOMO';
  paymentTime: Date;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUND';
  amountPaid: number;
  paymentUrl: string;
}

// Message types
export type MessageUser = Pick<UserInfo, "_id" | "username" | "fullName" | "profilePicture">;

export interface Message {
  _id: string;
  sender: MessageUser;
  recipient: MessageUser;
  messageType: "text" | "image" | "tour";
  content: string;
  tour?: Tour;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export type LastMessage = Pick<Message, "_id" | "content" | "tour" | "imageUrls" | "updatedAt">;

export interface Conversation {
  _id: string;
  participants: MessageUser[];
  messages?: Message[];
  lastMessage: LastMessage;
  createdAt: string;
  updatedAt: string;
}

export type UserSelectedState = Pick<UserInfo, "_id" | "fullName" | "username" | "profilePicture" | "role">

export interface ConversationMedia {
  images: string[];
  tours: {
    _id: string;
    title: string;
  }[]
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface BookmarkUser {
  _id: string;
  user: string;
}