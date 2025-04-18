import { Notification, Tour } from "./types";

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
  {
    name: "can tho",
    numberOfPost: 3,
  },
];

const generateTourDataArray = () => {
  const baseTour = {
    _id: "93938547389457",
    title: "Tour Da Nang - Hoi An 5 days 4 nights",
    description: "Lorem ipsum odor amet, consectetuer adipiscing elit. Ullamcorper amet praesent lobortis ultrices consectetur dictumst parturient",
    rating: 4.5,
    departureLocation: "Da Nang",
    destination: "Hoi An",
    duration: "5 days 4 nights",
    priceForAdult: 98.89,
    priceForYoung: 88,
    priceForChildren: 59,
    maxParticipants: 12,
    imageUrls: [
      "https://s3-alpha-sig.figma.com/img/c535/3521/625e2f8574b05481d4be8558dfe05d95?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=gIbL9Jch3ykydXiYNHHXg55jnOQZ-Y~zEHo1Ml9TrbLBtDDKfksQspHiveb0Jbaf1c-XrVZierLNd7F8R6VjAu9gFZKIivknIc1EWzxXrF6iRkrqCoXd5272Zqm5OGGxkCCdpUOKJ40WNvZCgwUdGYp-9ExzY4JgdqUbGdGD2Q23i5yNFwTty7K5-14yuhexp2gneJUVFAF0QcGMpoFXOCuzfgHelYtBoByX-k932K6IxYNp7a~K0lTNK-peuz3jHAVKIOMNzpE67uDe5oW9xtkatkBwfwrjRkx~lwMxXbk9tPLnS8Ynpzg5IjwE0URDqW9sVGNSI3KgMbXUjmpPAQ__",
      "https://s3-alpha-sig.figma.com/img/a229/b0ef/8374513ba44334a79eed78e344d9993c?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=E-SOI~bW8N7tdPia3tByiBdEgVXts1lxeXtBsNXMKiMcGHi4ZRtMJeK~txFp8WDaH7EQ6j2PuvtARlXM3vwzi02hkV0dSCMoD2TJxx9P97cL2uqMZUK5kIWYqsULThruEfKVeDgWQrxbO70VWuOqfgFntC~WE3yNjy03ItLwh6G4xfaqIUjb4VLMR~7A-IHW23ijHOwOU~1UJvlsfcmoh7U20z4du62fufUlFyhrGQvhvfBv1toU2q6LhmIaxtawaFXWdo9Sj1hWlIQC4~e~ZWoq8QfTgnQkGwb3AHGrVsUd0g9ZIPEAn1Xr~ab7~8ipslLc1ApPwCG7cZ9xCioBjw__",
    ],
    introduction: "A memorable journey through Vietnam's scenic beauty.",
    schedule: [
      { title: "Day 1: Arrival and City Tour", description: "Arrive and explore..." },
      { title: "Day 2: Cultural Visit", description: "Visit historic sites..." },
    ],
    includes: ["Accommodation, meals, transportation, guide...", "Entrance fees, travel insurance..."],
    notIncludes: ["Personal expenses...", "Tips..."],
    reviews: [
      {
        _id: "577456345",
        user: "Ngoc Duc",
        createdAt: "19 October 2024",
        rating: 5,
        tourReview: "Great experience!",
        tourGuideReview: "Friendly and knowledgeable guide.",
        images: ["https://ui-avatars.com/api/?size=128&background=random"],
      },
    ],
    author: {
      _id: "985769834589245",
      name: "Hoai Thuong",
      avatar: "https://ui-avatars.com/api/?size=128&background=random",
      busyDates: [new Date("2025-03-27"), new Date("2025-03-28")],
    },
  };

  const tours: Tour[] = [];
  const destinations = [
    "Hoi An", "Hue", "Hanoi", "Saigon", "Nha Trang",
    "Phu Quoc", "Dalat", "Sapa", "Can Tho", "Quy Nhon",
  ];

  for (let i = 0; i < 10; i++) {
    const newTour = {
      ...baseTour,
      _id: `${parseInt(baseTour._id) + i}`, // Unique ID by incrementing
      title: `Tour ${baseTour.departureLocation} - ${destinations[i]} ${baseTour.duration}`,
      destination: destinations[i], // Different destination for each tour
      rating: Number((4 + Math.random() * 0.5).toFixed(1)), // Random rating between 4 and 4.5
      priceForAdult: baseTour.priceForAdult + i * 10, // Incremental price increase
      priceForYoung: baseTour.priceForYoung + i * 8,
      priceForChildren: baseTour.priceForChildren + i * 5,
      maxParticipants: baseTour.maxParticipants + i % 3, // Slight variation
    };
    tours.push(newTour);
  }

  return tours;
};

// Export the array of 10 tours
export const tours = generateTourDataArray();

export const tourData: Tour = {
  _id: "93938547389457",
  title: "Tour Da Nang - Hoi An 5 days 4 nights",
  rating: 4.5,
  departureLocation: "Da Nang",
  destination: "Hoi An",
  duration: "5 days 4 nights",
  priceForAdult: 98.89,
  priceForYoung: 88,
  priceForChildren: 59,
  maxParticipants: 12,
  imageUrls: [
    "https://s3-alpha-sig.figma.com/img/c535/3521/625e2f8574b05481d4be8558dfe05d95?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=gIbL9Jch3ykydXiYNHHXg55jnOQZ-Y~zEHo1Ml9TrbLBtDDKfksQspHiveb0Jbaf1c-XrVZierLNd7F8R6VjAu9gFZKIivknIc1EWzxXrF6iRkrqCoXd5272Zqm5OGGxkCCdpUOKJ40WNvZCgwUdGYp-9ExzY4JgdqUbGdGD2Q23i5yNFwTty7K5-14yuhexp2gneJUVFAF0QcGMpoFXOCuzfgHelYtBoByX-k932K6IxYNp7a~K0lTNK-peuz3jHAVKIOMNzpE67uDe5oW9xtkatkBwfwrjRkx~lwMxXbk9tPLnS8Ynpzg5IjwE0URDqW9sVGNSI3KgMbXUjmpPAQ__",
    "https://s3-alpha-sig.figma.com/img/a229/b0ef/8374513ba44334a79eed78e344d9993c?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=E-SOI~bW8N7tdPia3tByiBdEgVXts1lxeXtBsNXMKiMcGHi4ZRtMJeK~txFp8WDaH7EQ6j2PuvtARlXM3vwzi02hkV0dSCMoD2TJxx9P97cL2uqMZUK5kIWYqsULThruEfKVeDgWQrxbO70VWuOqfgFntC~WE3yNjy03ItLwh6G4xfaqIUjb4VLMR~7A-IHW23ijHOwOU~1UJvlsfcmoh7U20z4du62fufUlFyhrGQvhvfBv1toU2q6LhmIaxtawaFXWdo9Sj1hWlIQC4~e~ZWoq8QfTgnQkGwb3AHGrVsUd0g9ZIPEAn1Xr~ab7~8ipslLc1ApPwCG7cZ9xCioBjw__",
    "https://s3-alpha-sig.figma.com/img/d3d9/af32/6d66da767aa1eb82f8cdd26a98daffee?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=I2XLGmRRfIV10FtEmjWadj2D5Y9Bw9Efy0TvXBdV17hw7XwiVSHWWCWlbU1BkCrBNP3ZBxjapcuVLGk5uERUt2Rt1KjfajbQXPAYnQ11G4bab7Jo7K36k3iMpCSq21hxPhPkdLD5ouSKfEZn2tvxzwfFpuKfLkYhs0gHbO2Uq~5ZAyH9YrTw2ypPDZBZFx~so8GZvae3zLn8rmJCe31XcExilEhNazKn7uW0KKVuAqGVXmw27ttIb4zLizf~BDiIZrEhWUnlQ0UQBh7KjHhePJvZDuuzE~6uYFtfo3iAbd7auNBvTP4-7WsINO6zElTUf9~Z~lTi18yr9ulqQYdBmQ__",
    "https://s3-alpha-sig.figma.com/img/c535/3521/625e2f8574b05481d4be8558dfe05d95?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=gIbL9Jch3ykydXiYNHHXg55jnOQZ-Y~zEHo1Ml9TrbLBtDDKfksQspHiveb0Jbaf1c-XrVZierLNd7F8R6VjAu9gFZKIivknIc1EWzxXrF6iRkrqCoXd5272Zqm5OGGxkCCdpUOKJ40WNvZCgwUdGYp-9ExzY4JgdqUbGdGD2Q23i5yNFwTty7K5-14yuhexp2gneJUVFAF0QcGMpoFXOCuzfgHelYtBoByX-k932K6IxYNp7a~K0lTNK-peuz3jHAVKIOMNzpE67uDe5oW9xtkatkBwfwrjRkx~lwMxXbk9tPLnS8Ynpzg5IjwE0URDqW9sVGNSI3KgMbXUjmpPAQ__",
    "https://s3-alpha-sig.figma.com/img/bbe8/2a33/8f7dd031c18f83226b70905a6946b978?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=L1vspyKozxB6yOI4je92o84it9Ektlb7IbthX2shvRX-20Oe6SKjSwDs~nKSezMHfpgR8cv8hO6GxujdHicGeIkm6kfRRGmc9tREKRjcyT6wGF7dc8Rxl5SSxwMWdFDmolkZh0hIlZGVtAD6OE2uo2ohum7kb7vOstiyZGBJUJgXNug6wOIdQpCYs6T4nh8YArbvYrQlsVM9Xres2Q2acGXZa3ongl9Zhz4sT5NPMHrLAhR~PDy8v-Bv~1nqWD1N142yJG-IQzC9IVt29v7WPXBKFretmJHMwiwZcMZ4NpoKMApysSVqxJwe4k1DF-H41iDympcZXKr43ZvJSnBVMg__",
  ],
  introduction: `
    Xứ sở đèn chiều nghi ngút quà cảc bộ phim đình đám, những món ăn độc trưng đậm vị Đà Nẵng, cảm nhận đời sống nơi đây là một trải nghiệm bạn không thể bỏ qua. Du lịch Hội An, Đà Nẵng là một điểm đến nổi tiếng được nhiều người yêu thích bởi vẻ đẹp hoang sơ, nét cổ kính, và sự thân thiện của người dân nơi đây. Du lịch Hội An, Đà Nẵng sẽ là một chuyến hành trình lịch sử đầy thú vị dành cho bạn.\n
    **Hành trình nổi bật:**\n- 
    - **Tổ quốc: ** SECUL - NAM - Trực tuyến Elysians vào mùa Đông ngay cả BestPrice nhé không thể bỏ qua
    - **Nắm nhỉn tron ven:** Du lịch Nam Định NamSan
    - **Tri ân nghiệm cảm:** Trực tuyến Elysians thực hiện tại Elysians
    - **Chiêm ngưỡng kiến trúc cổ kính tại Cảnh Phúc Cung**
  `,
  schedule: [
    { title: "Day 1: Arrival and City Tour", description: "Arrive in Da Nang, explore the city..." },
    { title: "Day 2: Hoi An Ancient Town", description: "Visit Hoi An Ancient Town..." },
  ],
  includes: [
    "Accommodation, meals, transportation, guide...",
    "Entrance fees, travel insurance...",
    "Accommodation, meals, transportation, guide...",
    "Entrance fees, travel insurance...",
  ],
  notIncludes: [
    "Personal expenses...",
    "Tips...",
  ],
  reviews: [
    {
      _id: "577456345",
      user: "Ngoc Duc",
      createdAt: "19 October 2024",
      rating: 5,
      tourReview: "Sống làm sao vì sao hùng, vượt được mọi ngòi yêu mến để làm gì? Sự thật nó phù phẳng rằng là chính ta đang sống cho xã hội và cả mẹ hùng quan tâm ta.",
      tourGuideReview: "Hành trình là gì? Xinh đẹp là gì? Là khái niệm của mọi con người, mỗi cá nhân chỉ không phải khai niệm chung bắt ta phải tuân theo.",
      images: [
        "https://ui-avatars.com/api/?size=128&background=random",
        "https://ui-avatars.com/api/?size=128&background=random",
        "https://ui-avatars.com/api/?size=128&background=random",
      ],
    },
    {
      _id: "324213312",
      user: "Ngoc Duc",
      createdAt: "19 October 2024",
      rating: 5,
      tourReview: "Sống làm sao vì sao hùng, vượt được mọi ngòi yêu mến để làm gì? Sự thật nó phù phẳng rằng là chính ta đang sống cho xã hội và cả mẹ hùng quan tâm ta.",
      tourGuideReview: "Hành trình là gì? Xinh đẹp là gì? Là khái niệm của mọi con người, mỗi cá nhân chỉ không phải khai niệm chung bắt ta phải tuân theo.",
      images: [
        "https://via.placeholder.com/100x100",
        "https://via.placeholder.com/100x100",
      ],
    },
  ],
  author: {
    _id: "985769834589245",
    name: "Hoai Thuong",
    avatar: "https://ui-avatars.com/api/?size=128&background=random",
    busyDates: [
      new Date("2025-03-27"),
      new Date("2025-03-28"),
      new Date("2025-03-29"),
    ]
  }
};

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

export const notifications: Notification[] = [
  {
    id: "1",
    type: "follow",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "2",
    type: "like",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working can",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "follow",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    type: "share",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working c...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "5",
    type: "follow",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "6",
    type: "book",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    extraInfo: "Ha Giang Loop and Dong Van Kast Plateau A...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "7",
    type: "follow",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "8",
    type: "book",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    extraInfo: "Ha Giang Loop and Dong Van Kast Plateau A...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "9",
    type: "reply",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working can...",
    content: "Babe, I don't have money to decide our relation...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "10",
    type: "reply",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working can...",
    content: "Babe, I don't have money to decide our relation...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "11",
    type: "reply",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working can...",
    content: "Babe, I don't have money to decide our relation...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "12",
    type: "reply",
    user: {
      name: "Ngoc Anh",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postTitle: "Only by working can...",
    content: "Babe, I don't have money to decide our relation...",
    timestamp: "Monday 4:04 PM",
    timeAgo: "1 hour ago",
    read: false,
  },
]