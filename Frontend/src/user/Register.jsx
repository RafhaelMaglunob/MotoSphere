import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MotoSphere_logo from "../component/img/MotoSphere Logo.png";

export default function Register() {
  const navigate = useNavigate();
  const features = ["Gps Tracking", "Accident Alerts", "Emergency Alerts"];

  const [form, setForm] = useState({
    username: "",
    email: "",
    contactNo: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setChecked] = useState(false); // checkbox state

  // ================= LIVE VALIDATION =================
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!/^[A-Za-z0-9 ]+$/.test(value))
          error = "Username can contain only letters, digits, and spaces";
        break;

      case "email":
        if (
          !/^[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(value)
        )
          error =
            "Email must be letters, digits, underscore and end with gmail.com, yahoo.com, or hotmail.com";
        break;

      case "contactNo":
        if (!/^09\d{9}$/.test(value))
          error = "Contact number must start with 09 and be 11 digits";
        break;

      case "password":
        if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/.test(value))
          error =
            "Password must be 8–15 chars, include uppercase, number, and symbol";
        // Also validate confirmPassword live
        if (form.confirmPassword && value !== form.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else {
          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
        break;

      case "confirmPassword":
        if (value !== form.password) error = "Passwords do not match";
        break;

      default:
        error = "";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ================= HANDLER =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleRegister = () => {
    // Final check before register
    ["username", "email", "contactNo", "password", "confirmPassword"].forEach(
      (field) => validateField(field, form[field])
    );

    const hasError = Object.values(errors).some((e) => e);
    if (hasError) return;

    alert("Registered successfully");
    navigate("/user/home");
  };

  return (
    <div className="flex min-h-screen bg-[#0A0E27] p-20 items-center justify-center gap-20">
      {/* LEFT */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4 bg-[#1E293B]/50 px-6 py-1 rounded-3xl w-fit">
          <span className="text-[#22C55E]">●</span>
          <span className="text-white">MotoSphere · Smart Helmet System</span>
        </div>

        <span className="text-5xl font-bold text-white">Rider safer with</span>
        <span className="text-5xl font-bold bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent">
          real-time monitoring
        </span>

        <span className="text-[#94A3B8]">
          MotoSphere connects your smart helmet to cloud for GPS
          <br />
          tracking, accident detection, and emergency alerts.
        </span>

        <div className="flex gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0F1729]/80 px-4 py-2 border border-[#164E63]/50 rounded-xl text-[#22D3EE]"
            >
              {feature}
            </div>
          ))}
        </div>

        <img src={MotoSphere_logo} className="w-72 mt-5 self-center" />
      </div>

      {/* RIGHT */}
      <div className="bg-[#0F1729]/90 p-10 flex flex-col w-[420px] rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
        <span className="text-2xl font-bold text-white">Register</span>
        <span className="text-[#94A3B8]">Create your MotoSphere account</span>

        <div className="flex flex-col gap-4 mt-8 w-full">
          {/* Username */}
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
          />

          {/* Email */}
          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          {/* Contact */}
          <Input
            label="Contact No."
            name="contactNo"
            value={form.contactNo}
            onChange={handleChange}
            error={errors.contactNo}
          />

          {/* Password */}
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {/* Show / Hide Password Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                setChecked(e.target.checked);
                setShowPassword(e.target.checked);
              }}
              className="cursor-pointer"
            />
            <label className="text-[#94A3B8] text-sm cursor-pointer">
              Show Passwords
            </label>
          </div>

          <button
            onClick={handleRegister}
            className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-white font-bold py-3 rounded-lg w-full"
          >
            Register
          </button>

          <div className="flex w-full justify-between text-sm text-[#94A3B8]">
            <span>Already have an account?</span>
            <span
              onClick={() => navigate("/user-login")}
              className="text-[#22D3EE] cursor-pointer"
            >
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= REUSABLE INPUT =================
function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm text-[#9BB3D6]">{label}</label>
      <input
        {...props}
        className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-sm px-4 py-3 rounded-lg outline-none border ${
          error ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"
        }`}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
