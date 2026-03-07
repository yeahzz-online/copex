import { useEffect, useMemo, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function getInitials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "FA";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function FacultyProfilePage() {
  const { user, updateUserSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    profilePhoto: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const profilePhoto = useMemo(() => form.profilePhoto || user?.profilePhoto || "", [form.profilePhoto, user?.profilePhoto]);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/faculty/profile");
        const profile = response.data.profile || {};
        setForm({
          name: profile.name || "",
          mobile: profile.mobile || "",
          profilePhoto: profile.profilePhoto || ""
        });
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      const response = await api.put("/faculty/profile", {
        name: form.name,
        mobile: form.mobile,
        profilePhoto: form.profilePhoto
      });
      const nextProfile = response.data.profile || {};
      updateUserSession({ ...user, ...nextProfile });
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match");
      setSavingPassword(false);
      return;
    }

    try {
      await api.put("/faculty/profile/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setMessage("Password changed successfully.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const onPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, profilePhoto: dataUrl }));
    } catch (fileError) {
      setError(fileError.message || "Failed to process image");
    }
  };

  if (loading) return <p className="text-soft">Loading profile...</p>;

  return (
    <section className="space-y-5">
      <GlassCard>
        <h3 className="font-display text-lg text-white">Faculty Profile</h3>
        <p className="mt-1 text-sm text-soft">Update your profile details and password.</p>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="flex items-center gap-4">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile preview"
                  className="h-16 w-16 rounded-xl border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                  {getInitials(form.name || user?.name)}
                </div>
              )}
              <label className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </label>
            </div>

            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="Mobile number"
              value={form.mobile}
              onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="Image URL (optional)"
              value={form.profilePhoto.startsWith("data:image/") ? "" : form.profilePhoto}
              onChange={(event) => setForm((prev) => ({ ...prev, profilePhoto: event.target.value }))}
            />

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-gradient-to-r from-violetBrand-500 to-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </GlassCard>

        <GlassCard>
          <form className="space-y-4" onSubmit={savePassword}>
            <p className="text-sm font-semibold text-white">Change Password</p>
            <input
              type="password"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              required
            />
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-70"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </GlassCard>
      </div>

      {message ? <p className="text-emerald-300">{message}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
    </section>
  );
}
