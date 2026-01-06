import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./services/authService";

function GuestRoute() {
  const authed = isAuthenticated();

  // If already logged in, keep user on their dashboard
  if (authed) {
    return <Navigate to="/user/home" replace />;
  }

  // Otherwise render public / guest pages (login, landing, etc.)
  return <Outlet />;
}

export default GuestRoute;


