import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";
const HomePage = lazy(() => import("@/pages/home-page"));

export default function AppRoutes() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />
    }
  ]);

  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading....</div>}>
      <RouterProvider router={routes} />
    </Suspense>
  )
}