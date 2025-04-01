import { useAppSelector } from "@/hooks/redux";
import { Navigate, Outlet, useLocation } from "react-router";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { userInfo, isAuthenticated } = useAppSelector(state => state.auth);

  const userHasRequiredRole = userInfo && allowedRoles?.includes(userInfo.role) ? true : false;

  if (allowedRoles && !userHasRequiredRole) {
    return <Navigate to="/" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />
}

export default ProtectedRoute