import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./services/authService";

function ProtectedRoute() {
  const authed = isAuthenticated();

  // If not logged in, send to user login
  if (!authed) {
    return <Navigate to="/user-login" replace />;
  }

  // Otherwise render nested routes
  return <Outlet />;
}

export default ProtectedRoute;


