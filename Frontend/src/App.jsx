import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

/* Admin Page */
import AdminLogin from "./admin/Login";
import AdminLayout from "./admin/MainLayout";
import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Devices from "./admin/Devices";
import Settings from "./admin/Settings";

/* User Page */
import UserLogin from "./user/Login";
import LandingLayout from "./user/LandingLayout";
import Home from "./user/home";
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

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="devices" element={<Devices />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* User Login */}
        <Route path="/user-login" element={<UserLogin />} />

        {/* User Routes */}
        <Route element={<LandingLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="why-motosphere" element={<WhyMotoSphere />} />
          <Route path="hardware-video" element={<HardwareVideo />} />
        </Route>
        
        <Route path="mission" element={<Mission />} />
        <Route path="learn-more" element={<LearnMore />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
