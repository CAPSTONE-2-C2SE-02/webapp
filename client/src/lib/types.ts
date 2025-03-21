export type Tour = {
  _id: string;
  title: string;
  description: string;
  photo: string[];
  rating: number;
  location: string;
  price: number;
  duration: string;
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