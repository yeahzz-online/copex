import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import useAuth from "../hooks/useAuth";

function getRoleLandingPath(role) {
  if (role === "STUDENT") return "/student/home";
  if (role === "FACULTY") return "/faculty/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "SMARTBOARD") return "/smartboard/view";
  return "/login";
}

function getPortalCopy(portalRole) {
  if (portalRole === "STUDENT") {
    return {
      title: "Student Portal Login",
      subtitle: "Use your student email or roll number to continue.",
      switchLabel: "Faculty login",
      switchTo: "/faculty/login"
    };
  }
  if (portalRole === "FACULTY") {
    return {
      title: "Faculty Portal Login",
      subtitle: "Sign in with faculty email or username ID.",
      switchLabel: "Student login",
      switchTo: "/student/login"
    };
  }
  return {
    title: "Welcome Back.",
    subtitle: "Please enter your account.",
    switchLabel: "Student login",
    switchTo: "/student/login"
  };
}

export default function LoginPage({ portalRole = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const routeRole = location.pathname.startsWith("/student/login")
    ? "STUDENT"
    : location.pathname.startsWith("/faculty/login")
      ? "FACULTY"
      : null;
  const activePortalRole = portalRole || routeRole;
  const portalCopy = getPortalCopy(activePortalRole);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const inputClass =
    "w-full rounded-xl border border-white/15 bg-[#0f1734] px-4 py-3 text-white outline-none placeholder:text-slate-400 transition focus:border-brand-300";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login({ ...form, role: activePortalRole });
      navigate(getRoleLandingPath(user.role), { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthShell
      mode="login"
      title={portalCopy.title}
      subtitle={portalCopy.subtitle}
      helperText="Don't have an account?"
      helperLinkLabel="Sign Up."
      helperLinkTo="/register"
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-soft" htmlFor="login-identifier">
            Email or ID
          </label>
          <input
            id="login-identifier"
            className={inputClass}
            type="text"
            placeholder={activePortalRole === "STUDENT" ? "Roll Number or Email" : "Email or ID"}
            value={form.identifier}
            onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-soft" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            className={inputClass}
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <div className="mt-2 text-right">
            <Link className="text-xs text-brand-300 hover:text-brand-100" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          className="w-full rounded-xl bg-[#3f66ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4e74ff] disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <p className="text-xs text-slate-400">
          By clicking Sign In you agree to our{" "}
          <Link className="text-brand-300 hover:text-brand-100" to="/terms-and-conditions">
            Terms and Conditions
          </Link>
          .
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link className="text-brand-300 hover:text-brand-100" to={portalCopy.switchTo}>
            {portalCopy.switchLabel}
          </Link>
          <Link className="text-brand-300 hover:text-brand-100" to="/login">
            Universal login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
