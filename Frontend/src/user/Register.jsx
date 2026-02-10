import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, psgcAPI } from "../services/api";
import MotoSphere_logo from "../component/img/MotoSphere Logo.png";
import { AiFillEye } from "react-icons/ai";

export default function Register() {
  const navigate = useNavigate();
  const features = ["Gps Tracking", "Accident Alerts", "Emergency Alerts"];

  const [form, setForm] = useState({
    username: "",
    email: "",
    contactNo: "",
    contactNoDigits: "", // Only the 9 digits after +63
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); // Terms & Conditions checkbox
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [provinceRequired, setProvinceRequired] = useState(true);
  const [addr, setAddr] = useState({
    region: null,
    province: null,
    city: null,
    cityType: null,
    barangay: null,
    addressLine: "",
  });

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

      case "contactNoDigits":
        // Validate exactly 10 digits after +63
        if (!value || value.trim().length === 0) {
          error = "Contact number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = "Contact number must be exactly 10 digits (e.g., 9123456789)";
        } else if (!value.trim().startsWith('9')) {
          error = "Contact number must start with 9 (e.g., 9123456789)";
        }
        break;

      case "address":
        if (!value || value.trim().length === 0)
          error = "Address is required";
        else if (value.trim().length < 10)
          error = "Address must be at least 10 characters";
        break;

      case "password":
        // Strong password: uppercase, lowercase, number, special character, 8+ characters
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value))
          error =
            "Password must be 8+ chars with uppercase, lowercase, number, and special character";
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

    // Map contactNoDigits error back to contactNoDigits in errors state
    const errorKey = name === "contactNoDigits" ? "contactNoDigits" : name;
    setErrors((prev) => ({ ...prev, [errorKey]: error }));
  };

  // Load Google Identity Services script
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      console.warn('Google Client ID not configured. Google Sign-In will not work.');
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      // Script already loaded, just initialize
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn(googleClientId);
      }
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn(googleClientId);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && !document.querySelector('body[data-google-script-loaded]')) {
        existingScript.remove();
      }
    };
  }, []);

  const initializeGoogleSignIn = (clientId) => {
    if (!window.google || !window.google.accounts) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignIn,
    });

    // Render the button with a small delay to ensure DOM is ready
    setTimeout(() => {
      if (googleButtonRef.current && window.google.accounts.id.renderButton) {
        try {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            width: '100%',
          });
        } catch (error) {
          console.error('Error rendering Google button:', error);
        }
      }
    }, 100);
  };

  const handleGoogleSignIn = async (response) => {
    setSubmitError("");
    setGoogleLoading(true);

    try {
      const authResponse = await authAPI.googleLogin(response.credential);

      if (authResponse.success) {
        // Store token in localStorage
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));

        // Check user role and redirect accordingly
        if (authResponse.user.role === 'admin') {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/user/home", { replace: true });
        }
      } else {
        setSubmitError(authResponse.message || 'Google registration failed');
      }
    } catch (err) {
      // Filter out technical Firebase errors
      let errorMessage = err.message || 'Google authentication failed. Please try again.';

      if (errorMessage.includes('default credentials') ||
        errorMessage.includes('cloud.google.com') ||
        errorMessage.includes('Database not initialized')) {
        errorMessage = "Server configuration error. Please contact the administrator.";
      }

      setSubmitError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const toTitle = (s) => {
    if (!s) return s;
    return s
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\b(Ncr)\b/i, "NCR");
  };
  const cityDisplay = (name) => {
    if (!name) return name;
    const t = toTitle(name);
    return /\bCity\b/i.test(t) ? t : `${t} City`;
  };
  useEffect(() => {
    (async () => {
      try {
        const r = await psgcAPI.getRegions();
        const formatted = r
          .map((x) => ({ code: x.code || x.psgc_id || x.correspondence_code, name: x.name }))
          .filter((x) => x.code && x.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setRegions(formatted);
      } catch (e) { void e; }
    })();
  }, []);

  useEffect(() => {
    const parts = [
      addr.addressLine ? addr.addressLine : "",
      addr.barangay ? addr.barangay.name : "",
      addr.city ? `${addr.city.name}${addr.cityType ? ` (${addr.cityType})` : ""}` : "",
      addr.province ? addr.province.name : "",
      addr.region ? addr.region.name : "",
    ].filter(Boolean);
    const composed = parts.join(", ");
    setForm((prev) => ({ ...prev, address: composed }));
  }, [addr]);

  const handleRegionChange = async (code) => {
    const region = regions.find((r) => r.code === code) || null;
    setAddr((prev) => ({ ...prev, region, province: null, city: null, cityType: null, barangay: null }));
    setProvinces([]);
    setCitiesMunicipalities([]);
    setBarangays([]);
    if (!region) return;
    try {
      if (/national capital region/i.test(region.name) || region.code === "130000000") {
        setProvinceRequired(true);
        setProvinces([{ code: `synthetic:${region.code}`, name: "Metro Manila" }]);
        setCitiesMunicipalities([]);
        return;
      }
      const p = await psgcAPI.getProvincesByRegion(region.code);
      const formatted = p
        .map((x) => ({ code: x.code || x.psgc_id || x.correspondence_code, name: x.name }))
        .filter((x) => x.code && x.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      setProvinces(formatted);
      if (formatted.length > 0) {
        setProvinceRequired(true);
      } else {
        setProvinceRequired(false);
        const cm = await psgcAPI.getCitiesMunicipalitiesByRegion(region.code);
        setCitiesMunicipalities(cm);
      }
    } catch (e) { void e; }
  };

  const handleProvinceChange = async (code) => {
    const province = provinces.find((p) => p.code === code) || null;
    setAddr((prev) => ({ ...prev, province, city: null, cityType: null, barangay: null }));
    setCitiesMunicipalities([]);
    setBarangays([]);
    if (!province) return;
    try {
      if (code.startsWith("synthetic:")) {
        const cm = await psgcAPI.getCitiesMunicipalitiesByRegion(addr.region.code);
        setCitiesMunicipalities(cm);
      } else {
        const cm = await psgcAPI.getCitiesMunicipalitiesByProvince(province.code);
        setCitiesMunicipalities(cm);
      }
    } catch (e) { void e; }
  };

  const handleCityChange = async (code) => {
    const city = citiesMunicipalities.find((c) => c.code === code) || null;
    setAddr((prev) => ({ ...prev, city, cityType: city ? city.type : null, barangay: null }));
    setBarangays([]);
    if (!city) return;
    try {
      if (city.type === "City") {
        const b = await psgcAPI.getBarangaysByCity(city.code);
        const formatted = b
          .map((x) => ({ code: x.code || x.psgc_id || x.correspondence_code, name: x.name }))
          .filter((x) => x.code && x.name)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
        setBarangays(formatted);
      } else {
        const b = await psgcAPI.getBarangaysByMunicipality(city.code);
        const formatted = b
          .map((x) => ({ code: x.code || x.psgc_id || x.correspondence_code, name: x.name }))
          .filter((x) => x.code && x.name)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
        setBarangays(formatted);
      }
    } catch (e) { void e; }
  };

  const handleBarangayChange = (code) => {
    const brgy = barangays.find((b) => b.code === code) || null;
    setAddr((prev) => ({ ...prev, barangay: brgy }));
  };

  // ================= HANDLER =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle contact number specially - only allow digits, exactly 10 digits
    if (name === "contactNoDigits") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10); // Max 10 digits
      
      // If user starts typing and first digit is not 9, show error
      if (digitsOnly.length > 0 && digitsOnly[0] !== '9') {
        setErrors((prev) => ({ ...prev, contactNoDigits: "Contact number must start with 9" }));
      }
      
      setForm((prev) => ({
        ...prev,
        [name]: digitsOnly,
        contactNo: `+63${digitsOnly}` // Automatically prepend +63
      }));
      validateField(name, digitsOnly);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Check Terms & Conditions acceptance
    if (!termsAccepted) {
      setSubmitError("Please accept the Terms & Conditions and Privacy Policy");
      return;
    }

    // Final check before register
    ["username", "email", "contactNoDigits", "address", "password", "confirmPassword"].forEach(
      (field) => validateField(field, form[field])
    );

    const hasError = Object.values(errors).some((e) => e);
    if (hasError) {
      setSubmitError("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        username: form.username,
        email: form.email,
        contactNo: form.contactNo, // Already includes +63
        address: form.address,
        password: form.password,
        confirmPassword: form.confirmPassword,
        termsAccepted: true,
      });

      if (response.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/user/home");
      } else {
        setSubmitError(response.message || "Registration failed");
      }
    } catch (err) {
      // Filter out technical Firebase errors and show user-friendly messages
      let errorMessage = err.message || "Registration failed. Please try again.";

      if (errorMessage.includes('default credentials') ||
        errorMessage.includes('cloud.google.com') ||
        errorMessage.includes('Database not initialized')) {
        errorMessage = "Server configuration error. Please contact the administrator.";
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0A0E27] flex items-center justify-center p-2 md:p-6">
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 items-center gap-3 md:gap-6 mx-auto px-2 md:px-6">
      {/* LEFT */}
      <div className="hidden md:flex flex-col space-y-3">
        <div className="flex items-center space-x-4 bg-[#1E293B]/50 px-6 py-1 rounded-3xl w-fit">
          <span className="text-[#22C55E]">●</span>
          <span className="text-white">MotoSphere · Smart Helmet System</span>
        </div>

        <span className="text-lg md:text-[1.6rem] font-bold text-white">Rider safer with</span>
        <span className="text-lg md:text-[1.6rem] font-bold bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent">
          real-time monitoring
        </span>

        <span className="text-[#94A3B8]">
          MotoSphere connects your smart helmet to cloud for GPS
          <br />
          tracking, accident detection, and emergency alerts.
        </span>

        <div className="flex gap-2 md:gap-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0F1729]/80 px-2 py-1 border border-[#164E63]/50 rounded-xl text-[#22D3EE] text-[11px]"
            >
              {feature}
            </div>
          ))}
        </div>

        <img src={MotoSphere_logo} className="w-28 md:w-44 mt-2 self-center" />
      </div>

      {/* RIGHT */}
      <div className="bg-[#0F1729]/90 p-3 md:p-5 flex flex-col w-full max-w-[520px] md:max-w-[640px] rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)] ring-1 ring-[#164E63]/30 mx-auto max-h-[88vh] md:max-h-[85vh] overflow-y-auto scrollbar-thin">
        <span className="text-lg md:text-2xl font-extrabold text-white tracking-wide">Register</span>
        <div className="flex items-center gap-3">
          <span className="text-[#9BB3D6] text-sm md:text-base">Create your MotoSphere account</span>
          <span className="hidden md:inline-block h-[3px] w-16 bg-gradient-to-r from-[#22D3EE] to-[#0EA5B7] rounded-full"></span>
        </div>

        {submitError && !submitError.includes('default credentials') && !submitError.includes('cloud.google.com') && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{submitError}</p>
          </div>
        )}
        {submitError && (submitError.includes('default credentials') || submitError.includes('cloud.google.com')) && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-sm text-center">
              Server configuration issue detected. Please contact the administrator or check server logs.
            </p>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-2 mt-1.5 md:mt-4 w-full">
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
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs md:text-sm text-[#9BB3D6]">Contact No. (+63)</label>
            <div className="flex gap-2">
              <span className="bg-[#0A0E27]/50 text-[#CCCCCC] text-base px-3 py-3 md:px-4 md:py-3 rounded-lg border border-transparent flex items-center">
                +63
              </span>
              <input
                type="text"
                name="contactNoDigits"
                value={form.contactNoDigits}
                onChange={handleChange}
                placeholder="9123456789"
                maxLength={10}
                className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base px-3 py-3 md:px-4 md:py-3 rounded-lg outline-none border flex-1 ${errors.contactNoDigits ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"
                  }`}
              />
            </div>
            {errors.contactNoDigits && <span className="text-red-400 text-xs">{errors.contactNoDigits}</span>}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs md:text-sm text-[#9BB3D6]">Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={addr.region?.code || ""}
                onChange={(e) => handleRegionChange(e.target.value)}
                className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 rounded-lg outline-none border ${errors.address ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"}`}
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              {provinceRequired && (
                <select
                  value={addr.province?.code || ""}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={!addr.region}
                  className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 rounded-lg outline-none border ${!addr.region ? "opacity-50 cursor-not-allowed" : errors.address ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"}`}
                >
                  <option value="">Select Province</option>
                  {addr.region && provinces.length === 0 && (
                    <option disabled>No provinces found</option>
                  )}
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              )}
              <select
                value={addr.city?.code || ""}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={provinceRequired ? !addr.province : !addr.region}
                className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 rounded-lg outline-none border ${(provinceRequired ? !addr.province : !addr.region) ? "opacity-50 cursor-not-allowed" : errors.address ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"}`}
              >
                <option value="">Select City/Municipality</option>
                {(provinceRequired ? addr.province : addr.region) && citiesMunicipalities.length === 0 && (
                  <option disabled>No cities/municipalities found</option>
                )}
                {citiesMunicipalities.map((c) => (
                  <option key={c.code} value={c.code}>{cityDisplay(c.name)} {c.type === "City" ? "(City)" : "(Municipality)"}</option>
                ))}
              </select>
              <select
                value={addr.barangay?.code || ""}
                onChange={(e) => handleBarangayChange(e.target.value)}
                disabled={!addr.city}
                className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 rounded-lg outline-none border ${!addr.city ? "opacity-50 cursor-not-allowed" : errors.address ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"}`}
              >
                <option value="">Select Barangay</option>
                {addr.city && barangays.length === 0 && (
                  <option disabled>No barangays found</option>
                )}
                {barangays.map((b) => (
                  <option key={b.code} value={b.code}>{toTitle(b.name)}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={addr.addressLine}
              onChange={(e) => setAddr((prev) => ({ ...prev, addressLine: e.target.value }))}
              placeholder="House no., Building, Street"
              className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 rounded-lg outline-none border ${errors.address ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"}`}
            />
            <div className="text-[#94A3B8] text-xs md:text-sm">
              {form.address}
            </div>
            {errors.address && <span className="text-red-400 text-xs">{errors.address}</span>}
          </div>

          {/* Password */}
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            visible={passwordVisible}
            onToggle={() => setPasswordVisible((v) => !v)}
            showToggle={true}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            visible={passwordVisible}
            onToggle={() => setPasswordVisible((v) => !v)}
            showToggle={false}
          />

          

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="cursor-pointer mt-1"
            />
            <label htmlFor="terms" className="text-[#94A3B8] text-xs md:text-sm cursor-pointer">
              I accept the{" "}
              <a href="/terms" target="_blank" className="text-[#22D3EE] hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" className="text-[#22D3EE] hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {!termsAccepted && submitError && submitError.includes("Terms") && (
            <span className="text-red-400 text-xs">Please accept the Terms & Conditions</span>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 md:py-3 rounded-lg w-full transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-3 md:my-4">
          <div className="flex-1 border-t border-[#334155]"></div>
          <span className="px-4 text-[#94A3B8] text-xs">OR</span>
          <div className="flex-1 border-t border-[#334155]"></div>
        </div>

        {/* Google Sign-In Button */}
        <div className="w-full flex flex-col items-center">
          <div
            ref={googleButtonRef}
            className={`w-full ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ minHeight: '40px' }}
          ></div>
          {googleLoading && (
            <div className="mt-2">
              <span className="text-[#22D3EE] text-sm">Signing up with Google...</span>
            </div>
          )}
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="text-xs text-[#94A3B8] mt-2 text-center">
              Google Sign-In not configured
            </p>
          )}
        </div>

        <div className="flex w-full justify-between text-sm text-[#94A3B8] mt-4">
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
function Input({ label, error, type = "text", visible, onToggle, showToggle = true, ...props }) {
  const [showInternal, setShowInternal] = useState(false);
  const show = typeof visible === "boolean" ? visible : showInternal;
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs md:text-sm text-[#9BB3D6]">{label}</label>
      <div className="relative w-full">
        <input
          {...props}
          type={inputType}
          className={`bg-[#0A0E27]/50 text-[#CCCCCC] text-base w-full px-4 py-3 md:px-5 md:py-3.5 pr-12 rounded-lg outline-none border ${error ? "border-red-400" : "border-transparent focus:border-[#22D3EE]"
            }`}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => (onToggle ? onToggle() : setShowInternal((s) => !s))}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#94A3B8]"
            aria-label="Toggle password visibility"
          >
            <AiFillEye className={`w-5 h-5 ${show ? "text-[#22D3EE]" : "text-[#94A3B8]"}`} />
          </button>
        )}
      </div>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
