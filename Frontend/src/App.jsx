import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import AdminLogin from "./admin/Login";
import AdminLayout from "./admin/MainLayout";

import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Devices from "./admin/Devices";
import Settings from "./admin/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
