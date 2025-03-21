import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TourInfo } from "@/components/tour/tour-info";
import { BookingSection } from "@/components/tour/tour-booking-section";
import { ReviewsSection } from "@/components/tour/tour-review-section";
import { Tour } from "@/types/tour";

// Dữ liệu giả lập cho tour
const tourData: Tour = {
  name: "Tour Da Nang - Hoi An 5 days 4 nights",
  departureLocation: "Da Nang",
  destination: "Hoi An",
  duration: "5 days 4 nights",
  price: 98.89,
  images: [
    "https://media.istockphoto.com/id/1044850870/vi/anh/gi%C6%B0%E1%BB%9Dng-b%C3%A3i-bi%E1%BB%83n-th%C6%B0-gi%C3%A3n-trong-k%E1%BB%B3-ngh%E1%BB%89-d%C6%B0%E1%BB%9Bi-%C3%B4-v%C3%A0o-m%C3%B9a-h%C3%A8-%C4%91%E1%BA%A3o-samui.jpg?s=2048x2048&w=is&k=20&c=aOA1fYQjffMGa8hE9iZNedtGYTO6oUY9m23feMNYmS4=",
    "https://s3-alpha-sig.figma.com/img/a229/b0ef/8374513ba44334a79eed78e344d9993c?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=E-SOI~bW8N7tdPia3tByiBdEgVXts1lxeXtBsNXMKiMcGHi4ZRtMJeK~txFp8WDaH7EQ6j2PuvtARlXM3vwzi02hkV0dSCMoD2TJxx9P97cL2uqMZUK5kIWYqsULThruEfKVeDgWQrxbO70VWuOqfgFntC~WE3yNjy03ItLwh6G4xfaqIUjb4VLMR~7A-IHW23ijHOwOU~1UJvlsfcmoh7U20z4du62fufUlFyhrGQvhvfBv1toU2q6LhmIaxtawaFXWdo9Sj1hWlIQC4~e~ZWoq8QfTgnQkGwb3AHGrVsUd0g9ZIPEAn1Xr~ab7~8ipslLc1ApPwCG7cZ9xCioBjw__",
    "https://s3-alpha-sig.figma.com/img/d3d9/af32/6d66da767aa1eb82f8cdd26a98daffee?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=I2XLGmRRfIV10FtEmjWadj2D5Y9Bw9Efy0TvXBdV17hw7XwiVSHWWCWlbU1BkCrBNP3ZBxjapcuVLGk5uERUt2Rt1KjfajbQXPAYnQ11G4bab7Jo7K36k3iMpCSq21hxPhPkdLD5ouSKfEZn2tvxzwfFpuKfLkYhs0gHbO2Uq~5ZAyH9YrTw2ypPDZBZFx~so8GZvae3zLn8rmJCe31XcExilEhNazKn7uW0KKVuAqGVXmw27ttIb4zLizf~BDiIZrEhWUnlQ0UQBh7KjHhePJvZDuuzE~6uYFtfo3iAbd7auNBvTP4-7WsINO6zElTUf9~Z~lTi18yr9ulqQYdBmQ__",
    "https://s3-alpha-sig.figma.com/img/c535/3521/625e2f8574b05481d4be8558dfe05d95?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=gIbL9Jch3ykydXiYNHHXg55jnOQZ-Y~zEHo1Ml9TrbLBtDDKfksQspHiveb0Jbaf1c-XrVZierLNd7F8R6VjAu9gFZKIivknIc1EWzxXrF6iRkrqCoXd5272Zqm5OGGxkCCdpUOKJ40WNvZCgwUdGYp-9ExzY4JgdqUbGdGD2Q23i5yNFwTty7K5-14yuhexp2gneJUVFAF0QcGMpoFXOCuzfgHelYtBoByX-k932K6IxYNp7a~K0lTNK-peuz3jHAVKIOMNzpE67uDe5oW9xtkatkBwfwrjRkx~lwMxXbk9tPLnS8Ynpzg5IjwE0URDqW9sVGNSI3KgMbXUjmpPAQ__",
    "https://s3-alpha-sig.figma.com/img/bbe8/2a33/8f7dd031c18f83226b70905a6946b978?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=L1vspyKozxB6yOI4je92o84it9Ektlb7IbthX2shvRX-20Oe6SKjSwDs~nKSezMHfpgR8cv8hO6GxujdHicGeIkm6kfRRGmc9tREKRjcyT6wGF7dc8Rxl5SSxwMWdFDmolkZh0hIlZGVtAD6OE2uo2ohum7kb7vOstiyZGBJUJgXNug6wOIdQpCYs6T4nh8YArbvYrQlsVM9Xres2Q2acGXZa3ongl9Zhz4sT5NPMHrLAhR~PDy8v-Bv~1nqWD1N142yJG-IQzC9IVt29v7WPXBKFretmJHMwiwZcMZ4NpoKMApysSVqxJwe4k1DF-H41iDympcZXKr43ZvJSnBVMg__",
  ],
  introduction: `
    Xứ sở đèn chiều nghi ngút quà cảc bộ phim đình đám, những món ăn độc trưng đậm vị Đà Nẵng, cảm nhận đời sống nơi đây là một trải nghiệm bạn không thể bỏ qua. Du lịch Hội An, Đà Nẵng là một điểm đến nổi tiếng được nhiều người yêu thích bởi vẻ đẹp hoang sơ, nét cổ kính, và sự thân thiện của người dân nơi đây. Du lịch Hội An, Đà Nẵng sẽ là một chuyến hành trình lịch sử đầy thú vị dành cho bạn.

    **Hành trình nổi bật:**
    - **Tổ quốc:** SECUL - NAM - Trực tuyến Elysians vào mùa Đông ngay cả BestPrice nhé không thể bỏ qua
    - **Nắm nhỉn tron ven:** Du lịch Nam Định NamSan
    - **Tri ân nghiệm cảm:** Trực tuyến Elysians thực hiện tại Elysians
    - **Chiêm ngưỡng kiến trúc cổ kính tại Cảnh Phúc Cung**
  `,
  schedule: [
    { title: "Day 1: Arrival and City Tour", description: "Arrive in Da Nang, explore the city..." },
    { title: "Day 2: Hoi An Ancient Town", description: "Visit Hoi An Ancient Town..." },
  ],
  include: "Accommodation, meals, transportation, guide...",
  notInclude: "Personal expenses, tips, additional activities...",
  reviews: [
    {
      user: "Ngoc Duc",
      date: "19 October 2024",
      rating: 5,
      content: "Sống làm sao vì sao hùng, vượt được mọi ngòi yêu mến để làm gì? Sự thật nó phù phẳng rằng là chính ta đang sống cho xã hội và cả mẹ hùng quan tâm ta.",
      role: "Tour guide",
      question: "Hành trình là gì? Xinh đẹp là gì? Là khái niệm của mọi con người, mỗi cá nhân chỉ không phải khai niệm chung bắt ta phải tuân theo.",
      images: [
        "https://via.placeholder.com/100x100",
        "https://via.placeholder.com/100x100",
      ],
    },
    {
      user: "Ngoc Duc",
      date: "19 October 2024",
      rating: 5,
      content: "Sống làm sao vì sao hùng, vượt được mọi ngòi yêu mến để làm gì? Sự thật nó phù phẳng rằng là chính ta đang sống cho xã hội và cả mẹ hùng quan tâm ta.",
      role: "Tour guide",
      question: "Hành trình là gì? Xinh đẹp là gì? Là khái niệm của mọi con người, mỗi cá nhân chỉ không phải khai niệm chung bắt ta phải tuân theo.",
      images: [
        "https://via.placeholder.com/100x100",
        "https://via.placeholder.com/100x100",
      ],
    },
  ],
};

const TourDetailPage = () => {
  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Tours", path: "/tours" },
    { label: "Tour Da Nang - Hoi An" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TourInfo tour={tourData} />
        <BookingSection tour={tourData} />
      </div>
      <ReviewsSection reviews={tourData.reviews} />
    </div>
  );
};

export default TourDetailPage;