import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./protected-route";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth-layout";
import CreateTour from "@/components/form/createtour-form";
import ProfileLayout from "@/layouts/profile-layout";
import UserProfilePage from "@/pages/userprofile-page";
const HomePage = lazy(() => import("@/pages/home-page"));
const SigninPage = lazy(() => import("@/pages/signin-page"));
const SignupPage = lazy(() => import("@/pages/signup-page"));
const ToursPage = lazy(() => import("@/pages/tours-page"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/createtour", element: <CreateTour /> },
          { path: "/tours", element: <ToursPage /> },
          {
            element: <ProfileLayout />,
            children: [
              { path: "/users/:userId", element: <UserProfilePage /> },
            ]
          }
        ]
      }
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