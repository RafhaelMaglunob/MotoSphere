import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

/* Admin Page */
import AdminLogin from "./admin/Login";
import AdminLayout from "./admin/MainLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminUsers from "./admin/Users";
import AdminDevices from "./admin/Devices";
import AdminSettings from "./admin/Settings";

/* User Page */
import UserLogin from "./user/Login";
import UserLayout from "./user/MainLayout";
import UserHome from "./user/UserHome";
import UserSettings from "./user/Settings";
import UserContactPersons from "./user/ContactPersons";
import UserNotifications from "./user/Notifications";

/* Landing Page */
import LandingLayout from "./user/LandingLayout";
import Home from "./user/Home";
import AboutUs from "./user/AboutUs";
import WhyMotoSphere from "./user/WhyMotoSphere";
import HardwareVideo from "./user/HardwareVideo";
import Mission from "./user/Mission";
import LearnMore from "./user/LearnMore";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Routes - Admin only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="devices" element={<AdminDevices />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Public / Guest-only routes (login + landing). 
            If logged in, GuestRoute will push user back to /user/home. */}
        <Route element={<GuestRoute />}>
          {/* User Login */}
          <Route path="/user-login" element={<UserLogin />} />

          {/* Landing Routes */}
          <Route element={<LandingLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="why-motosphere" element={<WhyMotoSphere />} />
            <Route path="hardware-video" element={<HardwareVideo />} />
          </Route>

          {/* Other public info pages */}
          <Route path="mission" element={<Mission />} />
          <Route path="learn-more" element={<LearnMore />} />
        </Route>
        
        {/* User Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<UserLayout />}>
            <Route path="home" element={<UserHome />} />
            <Route path="contact-persons" element={<UserContactPersons />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Route>
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
