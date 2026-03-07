import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import useAuth from "../hooks/useAuth";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: ""
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fieldClass =
    "w-full rounded-xl border border-white/15 bg-[#0f1734] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-brand-300";
  const labelClass = "mb-2 block text-xs uppercase tracking-[0.12em] text-slate-300";

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await register({
        email: form.email.trim(),
        password: form.password,
        role: "STUDENT"
      });

      setMessage("OTP sent to your email. Verify to continue setup.");
      navigate("/verify-otp", {
        state: {
          email: form.email.trim(),
          next: "student-setup"
        }
      });
    } catch (requestError) {
      if (requestError.message === "Passwords do not match") {
        setError("Passwords do not match");
      } else {
        setError(requestError?.response?.data?.message || "Account creation failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      title="Create Account."
      subtitle="Step 1: Create your account with email and password."
      helperText="Already have an account?"
      helperLinkLabel="Sign In."
      helperLinkTo="/login"
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelClass} htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            className={fieldClass}
            type="email"
            placeholder="Rollnumber@cmrcet.ac.in"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            className={fieldClass}
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            minLength={8}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="register-confirm-password">
            Re-enter Password
          </label>
          <input
            id="register-confirm-password"
            className={fieldClass}
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
            minLength={8}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <button
          className="w-full rounded-xl bg-[#3f66ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4e74ff] disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Account & Send OTP"}
        </button>

        <p className="text-xs text-slate-400">
          By registering, you agree to our{" "}
          <Link className="text-brand-300 hover:text-brand-100" to="/terms-and-conditions">
            Terms and Conditions
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
