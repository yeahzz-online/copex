import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Monitor,
  ShieldCheck,
  Wifi,
  X,
} from "lucide-react";
import type { Role } from "../../mockData";

type RoleOption = {
  id: Role;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
};

const roleOptions: RoleOption[] = [
  {
    id: "admin",
    label: "Admin",
    placeholder: "admin@college.edu",
    icon: <ShieldCheck size={17} />,
  },
  {
    id: "faculty",
    label: "Faculty",
    placeholder: "faculty@college.edu",
    icon: <BookOpen size={17} />,
  },
  {
    id: "student",
    label: "Student",
    placeholder: "student@college.edu",
    icon: <GraduationCap size={17} />,
  },
  {
    id: "smartboard",
    label: "Smartboard",
    placeholder: "smartboard@college.edu",
    icon: <Monitor size={17} />,
  },
];

const roleRouteMap: Record<Role, string> = {
  admin: "/admin",
  faculty: "/faculty",
  student: "/student",
  smartboard: "/smartboard",
};

function LoginPage() {
  const navigate = useNavigate();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [email, setEmail] = useState("student@college.edu");
  const [password, setPassword] = useState("demo123");
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordView, setForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);

  const selectedRole = roleOptions.find((item) => item.id === role) ?? roleOptions[2];

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOTPModal(true);
    }, 1200);
  };

  const handleOtpInput = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });

    if (cleanValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setOtpVerified(true);
    setTimeout(() => {
      navigate(roleRouteMap[role]);
    }, 900);
  };

  const inputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.borderColor = "#0f4c81";
  };

  const inputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.style.borderColor = "#e5e7eb";
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[55%_45%]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#06284f] via-[#0d3a6d] to-[#0e7490] p-10 text-white lg:flex lg:flex-col">
        <div
          className="absolute -left-16 top-14 h-56 w-56 bg-cyan-300/25 blur-3xl"
          style={{ borderRadius: "999px" }}
        />
        <div
          className="absolute right-[-80px] top-40 h-64 w-64 bg-blue-300/20 blur-3xl"
          style={{ borderRadius: "999px" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center bg-white/20 backdrop-blur"
            style={{ borderRadius: "14px" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold">EduSlide Pro</p>
            <p className="text-sm text-white/70">College PPT System</p>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex-1">
          <div
            className="overflow-hidden border border-white/20 bg-white/10"
            style={{ borderRadius: "22px" }}
          >
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
              alt="Modern classroom"
              className="h-72 w-full object-cover"
            />
            <div className="bg-slate-900/35 p-6">
              <h1 className="text-3xl font-semibold leading-tight text-white">
                Empower Learning Through
                <span className="block text-cyan-300">Smart Presentations</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/75">
                Manage faculty and student presentations, track submissions, and connect live classrooms
                with smartboard-ready playback.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 border-t border-white/20 pt-5">
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: "Departments", value: "24+" },
              { label: "Faculty", value: "180+" },
              { label: "Students", value: "5200+" },
              { label: "Presentations", value: "12400+" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-semibold text-cyan-300">{item.value}</p>
                <p className="text-xs uppercase tracking-wide text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[520px] border border-white/60 bg-white/80 p-7 shadow-xl backdrop-blur"
          style={{ borderRadius: "20px" }}
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-11 w-11 items-center justify-center bg-gradient-to-br from-[#0f4c81] to-[#00b4d8] text-white"
              style={{ borderRadius: "12px" }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">EduSlide Pro</p>
              <p className="text-xs text-slate-500">PPT Management System</p>
            </div>
          </div>

          {!forgotPasswordView ? (
            <form onSubmit={handleLogin}>
              <h2 className="text-3xl font-semibold text-slate-900">Welcome Back 👋</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your EduSlide Pro account</p>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Login As</label>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border bg-white px-3 py-3"
                    style={{
                      borderRadius: "12px",
                      borderColor: roleDropdownOpen ? "#0f4c81" : "#e5e7eb",
                    }}
                    onClick={() => setRoleDropdownOpen((current) => !current)}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {selectedRole.icon}
                      {selectedRole.label}
                    </span>
                    <ChevronDown size={16} className={roleDropdownOpen ? "rotate-180" : ""} />
                  </button>

                  <AnimatePresence>
                    {roleDropdownOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 mt-2 w-full border border-slate-200 bg-white p-2"
                        style={{ borderRadius: "12px", boxShadow: "0 12px 30px rgba(15,23,42,0.16)" }}
                      >
                        {roleOptions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="mb-1 flex w-full items-center justify-between px-3 py-2 text-left"
                            style={{ borderRadius: "10px" }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.background = "#eff6ff";
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.background = "transparent";
                            }}
                            onClick={() => {
                              setRole(item.id);
                              setRoleDropdownOpen(false);
                            }}
                          >
                            <span className="flex items-center gap-2 text-sm text-slate-700">
                              {item.icon}
                              {item.label}
                            </span>
                            {role === item.id ? <Check size={15} color="#0f4c81" /> : null}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <div
                  className="flex items-center gap-2 border bg-white px-3 py-3"
                  style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                >
                  <Mail size={16} color="#64748b" />
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder={selectedRole.placeholder}
                    className="w-full text-sm text-slate-800 outline-none"
                    onChange={(event) => setEmail(event.target.value)}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div
                  className="flex items-center gap-2 border bg-white px-3 py-3"
                  style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                >
                  <Lock size={16} color="#64748b" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    className="w-full text-sm text-slate-800 outline-none"
                    onChange={(event) => setPassword(event.target.value)}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="mt-3 text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-cyan-600"
                  onClick={() => setForgotPasswordView(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white"
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                  boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="h-4 w-4 border-2 border-white/40 border-t-white"
                      style={{ borderRadius: "999px", animation: "spin 1s linear infinite" }}
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div
                className="mt-5 flex items-center gap-2 border border-sky-100 bg-sky-50 px-3 py-3 text-xs text-sky-700"
                style={{ borderRadius: "12px" }}
              >
                <Wifi size={14} />
                Demo: Use any email & password, then verify OTP to explore.
              </div>
            </form>
          ) : (
            <div>
              <button
                type="button"
                className="mb-4 flex items-center gap-1 text-sm text-slate-500"
                onClick={() => setForgotPasswordView(false)}
              >
                <ArrowLeft size={14} />
                Back to login
              </button>
              <h2 className="text-3xl font-semibold text-slate-900">Reset Password</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your account email to receive a reset link.</p>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <div
                  className="flex items-center gap-2 border bg-white px-3 py-3"
                  style={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
                >
                  <Mail size={16} color="#64748b" />
                  <input
                    type="email"
                    value={forgotEmail}
                    className="w-full text-sm text-slate-800 outline-none"
                    onChange={(event) => setForgotEmail(event.target.value)}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full px-4 py-3 text-sm font-semibold text-white"
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                  boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
                }}
              >
                Send Reset Link
              </button>
            </div>
          )}
        </motion.div>
      </section>

      <AnimatePresence>
        {showOTPModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-[420px] border border-white/20 bg-white p-6"
              style={{ borderRadius: "18px" }}
            >
              <button
                type="button"
                className="ml-auto flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500"
                style={{ borderRadius: "999px" }}
                onClick={() => setShowOTPModal(false)}
              >
                <X size={14} />
              </button>

              <div className="flex justify-center">
                <div
                  className="flex h-14 w-14 items-center justify-center bg-gradient-to-br from-[#0f4c81] to-[#00b4d8] text-white"
                  style={{ borderRadius: "999px" }}
                >
                  <ShieldCheck size={24} />
                </div>
              </div>

              <h3 className="mt-4 text-center text-2xl font-semibold text-slate-900">
                {otpVerified ? "Verified! 🎉" : "OTP Verification"}
              </h3>
              <p className="mt-1 text-center text-sm text-slate-500">
                We sent a 6-digit OTP to {email || selectedRole.placeholder}
              </p>

              <div className="mt-5 flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={`otp-${index + 1}`}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    value={digit}
                    maxLength={1}
                    onChange={(event) => handleOtpInput(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    className="h-14 w-12 border text-center text-xl font-semibold outline-none"
                    style={{
                      borderRadius: "10px",
                      borderColor: digit ? "#0f4c81" : "#d1d5db",
                      background: digit ? "#e0f2fe" : "#ffffff",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="mt-5 w-full px-4 py-3 text-sm font-semibold text-white"
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                  boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
                }}
                onClick={handleVerifyOtp}
              >
                {otpVerified ? "Redirecting..." : "Verify OTP"}
              </button>
              <button type="button" className="mt-3 w-full text-sm font-medium text-cyan-600">
                Resend OTP
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default LoginPage;
