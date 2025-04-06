import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./protected-route";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth-layout";
import ProfileLayout from "@/layouts/profile-layout";
import UserProfilePage from "@/pages/userprofile-page";
import UserProfileFollowPage from "@/pages/userprofile-follower-page";
import UserProfileToursPage from "@/pages/userprofile-tours-page";
import UserProfileReviewPage from "@/pages/userprofile-review-page";
import CreateTourPage from "@/pages/createtour-page";
import SetBusySchedulePage from "@/pages/set-busy-schedule-page";
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
          { index: true, element: <UserProfilePage />},
          { path: "follow", element: <UserProfileFollowPage /> },
          { path: "photos", element: <div>Photos Page</div> },
          { path: "tours", element: <UserProfileToursPage /> },
          { path: "reviews", element: <UserProfileReviewPage /> },
        ]
      },
      
      // Post routes
      { path: "/:username/post/:postId", element: <PostPage /> },
      { path: "/posts", element: <div>HashTag Post Page</div> },

      // Tour Routes
      { path: "/tours", element: <ToursPage /> },
      { path: "/tours/:tourId", element: <TourDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/tours/:tourId/book", element: <div>TourBookingPage</div> },
          { path: "/tours/:tourId/payment", element: <div>TourPaymentPage</div> },
        ]
      },
      { 
        path: "/tours/create",
        element: <ProtectedRoute allowedRoles={["TOUR_GUIDE"]} />,
        children: [
          { index: true, element: <CreateTourPage /> }
        ]
      },
      { 
        path: "/busySchedule",
        element: <ProtectedRoute allowedRoles={["TOUR_GUIDE"]} />,
        children: [
          { index: true, element: <SetBusySchedulePage /> }
        ]
      },
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
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading....</div>}>
      <RouterProvider router={routes} />
    </Suspense>
  )
}