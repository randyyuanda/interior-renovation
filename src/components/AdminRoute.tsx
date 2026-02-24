import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/authStore";
import type { Role } from "../models/auth";

interface AdminRouteProps {
  allowedRoles: Role[];
}

export default function AdminRoute({ allowedRoles }: AdminRouteProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
