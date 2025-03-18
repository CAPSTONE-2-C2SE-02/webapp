import { useAppSelector } from "@/hooks/redux";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes("TOUR_GUIDE")) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export default ProtectedRoute