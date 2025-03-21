import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  if (allowedRoles && !allowedRoles.includes("TOUR_GUIDE")) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute