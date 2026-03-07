import useAuth from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import PortalIcon, { getNavIconName } from "./PortalIcon";
import { navByRole } from "../routes/navConfig";

function getInitials(name, fallback = "U") {
  const clean = String(name || "").trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function TopBar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = navByRole[role] || [];
  const isAdmin = role === "ADMIN";

  const activeNav =
    navItems.find(
      (item) =>
        location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
    ) || null;

  const pageTitle = activeNav?.label || "Overview";
  const initials = getInitials(user?.name, "U");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3 ${
        isAdmin ? "admin-topbar" : "bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
            isAdmin ? "bg-[#e9efff] text-[#2f49c8]" : "bg-white/10 text-white"
          }`}
        >
          <PortalIcon name={getNavIconName(activeNav?.href)} className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-soft">Current Page</p>
          <h2
            className={`font-display text-lg sm:text-xl ${
              isAdmin ? "text-[#1f2d4f]" : "text-white"
            }`}
          >
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className={`text-sm font-semibold ${isAdmin ? "text-[#1f2d4f]" : "text-white"}`}>
            {user?.name || "User"}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-soft">{role || "User"}</p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white ${
            isAdmin
              ? "bg-gradient-to-br from-[#3151d3] to-[#4f6fe9]"
              : "bg-gradient-to-br from-brand-500 to-violetBrand-500"
          }`}
          title={user?.name || "Account"}
        >
          {initials}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            isAdmin
              ? "bg-[#edf2ff] text-[#2f49c8] hover:bg-[#e4ecff] border border-[#ced9f2]"
              : "bg-white/15 text-white hover:bg-white/25 border border-white/10"
          }`}
        >
          <PortalIcon name="logout" className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
