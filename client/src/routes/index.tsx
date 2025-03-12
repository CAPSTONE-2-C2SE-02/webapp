import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./protected-route";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth-layout";
const HomePage = lazy(() => import("@/pages/home-page"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> }
        ]
      }
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <div>Login Page</div> },
      { path: "/register", element: <div>Register Page</div> }
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