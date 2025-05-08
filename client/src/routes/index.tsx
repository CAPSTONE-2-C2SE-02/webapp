import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./protected-route";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth-layout";
import ProfileLayout from "@/layouts/profile-layout";
import CreateTourPage from "@/pages/createtour-page";
import SetBusySchedulePage from "@/pages/set-busy-schedule-page";
import LoadingPage from "@/components/layout/loading-page";
import RankingPage from "@/pages/ranking-page";
import NotFoundPage from "@/pages/not-found-page";
import TourBookingPage from "@/pages/tour-booking-page";
import HistoryBookingPage from "@/pages/history-booking-page";
import HashtagPage from "@/pages/hashtag-page";
import PaymentStatusPage from "@/pages/payment-status-page";
import ChatPage from "@/pages/chat-page";
import ChatLayout from "@/layouts/chat-layout";
import ChatNoneSelection from "@/components/chat/chat-none-selection";
import BookmarkPage from "@/pages/bookmark-page";
const TourManagementPage = lazy(() => import("@/pages/tour-management-page"));
const UserProfilePage = lazy(() => import("@/pages/user-profile/userprofile-page"));
const UserProfileToursPage = lazy(() => import("@/pages/user-profile/userprofile-tours-page"));
const UserProfileReviewPage = lazy(() => import("@/pages/user-profile/userprofile-review-page"));
const UserProfilePhotosPage = lazy(() => import("@/pages/user-profile/userprofile-photos-page"));
const UserProfileFollowPage = lazy(() => import("@/pages/user-profile/userprofile-follower-page"));
const SigninPage = lazy(() => import("@/pages/signin-page"));
const SignupPage = lazy(() => import("@/pages/signup-page"));
const HomePage = lazy(() => import("@/pages/home-page"));
const PostPage = lazy(() => import("@/pages/post-page"));
const ToursPage = lazy(() => import("@/pages/tours-page"));
const TourDetail = lazy(() => import("@/pages/tourdetail-page"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <ProfileLayout />,
        path: "/:username",
        children: [
          { index: true, element: <UserProfilePage /> },
          { path: "follow", element: <UserProfileFollowPage /> },
          { path: "photos", element: <UserProfilePhotosPage /> },
          { path: "tours", element: <UserProfileToursPage /> },
          { path: "reviews", element: <UserProfileReviewPage /> },
        ]
      },
      // Chat routes
      {
        path: "/messages",
        element: <ProtectedRoute />,
        children: [
          {
            element: <ChatLayout />,
            children: [
              { path: ":userId", element: <ChatPage /> },
              { index: true, element: <ChatNoneSelection /> },
            ]
          },
        ]
      },

      // Post routes
      { path: "/:username/post/:postId", element: <PostPage /> },
      { path: "/hashtag/:tag", element: <HashtagPage /> },

      // Tour Routes
      { path: "/tours", element: <ToursPage /> },
      { path: "/tours/:tourId", element: <TourDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/tours/:tourId/book", element: <TourBookingPage /> },
          // History Booking
          { path: "/history-booking", element: <HistoryBookingPage /> },
          // Payment Status
          { path: "/payment-status", element: <PaymentStatusPage /> },
          // Bookmarks Route
          { path: "/bookmarks", element: <BookmarkPage /> },
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["TOUR_GUIDE"]} />,
        children: [
          { path: "/tours/create", element: <CreateTourPage /> },
          { path: "/busy-schedule", element: <SetBusySchedulePage /> },
          { path: "/tour-management", element: <TourManagementPage /> }
        ]
      },
      // Ranking Route
      { path: "/ranking", element: <RankingPage /> },
      { path: "/not-found", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <SigninPage /> },
      { path: "/register", element: <SignupPage /> },
    ]
  }
]);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={routes} />
    </Suspense>
  )
}