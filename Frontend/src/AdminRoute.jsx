import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "./services/authService";

function AdminRoute() {
  const current = getCurrentUser();
  const userType = String(current?.userType || current?.role || "").toLowerCase();

  // Only allow authenticated admins to access nested routes
  if (userType !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;


