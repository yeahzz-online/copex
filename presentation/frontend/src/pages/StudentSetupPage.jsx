import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import useAuth from "../hooks/useAuth";

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" }
];

const DEPARTMENT_OPTIONS = [
  { value: "ECE", label: "ECE" },
  { value: "CSE", label: "CSE" },
  { value: "CSM", label: "CSM" },
  { value: "MEC", label: "MEC" }
];

const SECTION_OPTIONS_BY_DEPARTMENT = {
  ECE: [
    { value: "ECE-A", label: "ECE-A" },
    { value: "ECE-B", label: "ECE-B" }
  ],
  CSE: [
    { value: "CSE-A", label: "CSE-A" },
    { value: "CSE-B", label: "CSE-B" }
  ],
  CSM: [
    { value: "CSM-A", label: "CSM-A" },
    { value: "CSM-B", label: "CSM-B" }
  ],
  MEC: [
    { value: "MEC-A", label: "MEC-A" },
    { value: "MEC-B", label: "MEC-B" }
  ]
};

export default function StudentSetupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeStudentSetup } = useAuth();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    rollNumber: "",
    name: "",
    mobile: "",
    year: "",
    department: "",
    section: "",
    profilePhoto: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fieldClass =
    "w-full rounded-xl border border-white/15 bg-[#0f1734] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 transition focus:border-brand-300";
  const labelClass = "mb-2 block text-xs uppercase tracking-[0.12em] text-slate-300";
  const sectionOptions = useMemo(
    () => SECTION_OPTIONS_BY_DEPARTMENT[form.department] || [],
    [form.department]
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDepartmentChange = (value) => {
    setForm((prev) => {
      const nextSections = SECTION_OPTIONS_BY_DEPARTMENT[value] || [];
      const sectionStillValid = nextSections.some((item) => item.value === prev.section);
      return {
        ...prev,
        department: value,
        section: sectionStillValid ? prev.section : ""
      };
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      handleChange("profilePhoto", "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be 2MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profilePhoto: String(reader.result || "") }));
      setError("");
    };
    reader.onerror = () => {
      setError("Unable to read selected image");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        email: form.email.trim(),
        rollNumber: form.rollNumber.trim().toUpperCase(),
        name: form.name.trim(),
        mobile: form.mobile.replace(/\D/g, ""),
        year: Number(form.year),
        branch: form.department,
        section: form.section,
        profilePhoto: form.profilePhoto
      };

      await completeStudentSetup(payload);
      setMessage("Profile setup completed. You can now sign in.");
      setTimeout(() => navigate("/login"), 900);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Setup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      title="Student Profile Setup."
      subtitle="Step 3: Complete your profile details."
      helperText="Already completed setup?"
      helperLinkLabel="Sign In."
      helperLinkTo="/login"
    >
      <form className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <div className="lg:col-span-2">
          <label className={labelClass} htmlFor="setup-photo">
            Profile Photo
          </label>
          <input
            id="setup-photo"
            className={fieldClass}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required
          />
          {form.profilePhoto ? (
            <img
              src={form.profilePhoto}
              alt="Profile preview"
              className="mt-3 h-20 w-20 rounded-full border border-white/20 object-cover"
            />
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <label className={labelClass} htmlFor="setup-email">
            Account Email
          </label>
          <input
            id="setup-email"
            className={fieldClass}
            type="email"
            placeholder="Rollnumber@cmrcet.ac.in"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-roll-number">
            Roll Number
          </label>
          <input
            id="setup-roll-number"
            className={fieldClass}
            placeholder="Enter roll number"
            value={form.rollNumber}
            onChange={(event) => handleChange("rollNumber", event.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-name">
            Student Name
          </label>
          <input
            id="setup-name"
            className={fieldClass}
            placeholder="Enter student name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-mobile">
            Mobile Number
          </label>
          <input
            id="setup-mobile"
            className={fieldClass}
            type="tel"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={(event) =>
              handleChange("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-year">
            Year
          </label>
          <select
            id="setup-year"
            className={fieldClass}
            value={form.year}
            onChange={(event) => handleChange("year", event.target.value)}
            required
          >
            <option value="">Select Year...</option>
            {YEAR_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-department">
            Department
          </label>
          <select
            id="setup-department"
            className={fieldClass}
            value={form.department}
            onChange={(event) => handleDepartmentChange(event.target.value)}
            required
          >
            <option value="">Select Branch...</option>
            {DEPARTMENT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="setup-section">
            Section
          </label>
          <select
            id="setup-section"
            className={fieldClass}
            value={form.section}
            onChange={(event) => handleChange("section", event.target.value)}
            disabled={!form.department}
            required
          >
            <option value="">{form.department ? "Select Section..." : "Select branch first"}</option>
            {sectionOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-red-300 lg:col-span-2">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300 lg:col-span-2">{message}</p> : null}

        <button
          className="lg:col-span-2 rounded-xl bg-[#3f66ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4e74ff] disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Continue"}
        </button>

        <p className="text-xs text-slate-400 lg:col-span-2">
          Need to re-verify OTP?{" "}
          <Link className="text-brand-300 hover:text-brand-100" to="/verify-otp">
            Open Verify OTP
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
