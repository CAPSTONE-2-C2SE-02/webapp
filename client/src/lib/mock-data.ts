import { Tour } from "./types";

export const hashtagsMockData = [
  {
    name: "banahill",
    numberOfPost: 43,
  },
  {
    name: "danang",
    numberOfPost: 34,
  },
  {
    name: "hoian",
    numberOfPost: 25,
  },
  {
    name: "hanoi",
    numberOfPost: 22,
  },
  {
    name: "hagiang",
    numberOfPost: 20,
  },
  {
    name: "caobang",
    numberOfPost: 15,
  },
  {
    name: "hochiminh",
    numberOfPost: 12,
  },
  {
    name: "vungtau",
    numberOfPost: 6,
  },
  {
    name: "khanhhoa",
    numberOfPost: 3,
  },
];

export const mockTours: Tour[] = [
  {
    _id: "1",
    title: "Tham quan Lung Cu - Ha Giang voi canh dep tuyet tran",
    destination: "Lung Cu - Ha Giang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "2",
    title: "Khám phá vẻ đẹp thiên nhiên tại Mù Cang Chải",
    destination: "Mù Cang Chải",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "3",
    title: "Trải nghiệm văn hóa bản địa ở Sapa",
    destination: "Sapa",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "4",
    title: "Chinh phục đỉnh Fansipan - nóc nhà Đông Dương",
    destination: "Fansipan",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "5",
    title: "Dạo chơi giữa hàng cây phong đỏ ở Hà Nội vào mùa thu",
    destination: "Hà Nội",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "6",
    title: "Thưởng thức ẩm thực miền Trung tại Đà Nẵng",
    destination: "Đà Nẵng",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "7",
    title: "Khám phá di tích lịch sử tại Hội An",
    destination: "Hội An",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "8",
    title: "Ngắm hoàng hôn trên biển Nha Trang",
    destination: "Nha Trang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "9",
    title: "Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car Tour",
    destination: "Ha Giang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "10",
    title: "Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car Tour",
    destination: "Ha Giang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "11",
    title: "Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car Tour",
    destination: "Ha Giang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
  {
    _id: "12",
    title: "Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car Tour",
    destination: "Ha Giang",
    description: "Explore the rural wonders of Cao Bang and Ha Giang. Explore the most famous places in the North...",
    photo: ["https://placehold.co/600x400"],
    overalReview: 4.5,
  },
]

export const userData = {
  name: "Ngoc Anh",
  username: "anh312",
  email: "ptanh125@gmail.com",
  phone: "09568896",
  follower: [
    {
      name: "Minh Khang",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Minh+Khang&size=128&background=random",
      followers: 3500,
    },
    {
      name: "Hoang Nam",
      role: "tour guide",
      isFollow: false,
      avatar: "https://ui-avatars.com/api/?name=Hoang+Nam&size=128&background=random",
      followers: 1200,
    },
    {
      name: "Lan Phuong",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Lan+Phuong&size=128&background=random",
      followers: 5000,
    },
    {
      name: "Binh An",
      role: "traveler",
      isFollow: false,
      avatar: "https://ui-avatars.com/api/?name=Binh+An&size=128&background=random",
      followers: 2700,
    },
    {
      name: "Thuy Duong",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Thuy+Duong&size=128&background=random",
      followers: 1800,
    }
  ],
  following: [
    {
      name: "Gia Huy",
      role: "tour guide",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Gia+Huy&size=128&background=random",
      followers: 2200,
    },
    {
      name: "Mai Linh",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Mai+Linh&size=128&background=random",
      followers: 4100,
    },
    {
      name: "Quoc Dat",
      role: "traveler",
      isFollow: true,  
      avatar: "https://ui-avatars.com/api/?name=Quoc+Dat&size=128&background=random",
      followers: 900,
    },
    {
      name: "Thanh Tu",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Thanh+Tu&size=128&background=random",
      followers: 3300,
    },
    {
      name: "Dieu Linh",
      role: "traveler",
      isFollow: true,
      avatar: "https://ui-avatars.com/api/?name=Dieu+Linh&size=128&background=random",
      followers: 2900,
    }
  ]
};