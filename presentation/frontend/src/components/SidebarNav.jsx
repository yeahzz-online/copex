import { Link, useLocation } from "react-router-dom";
import PortalIcon, { getNavIconName } from "./PortalIcon";
import useAuth from "../hooks/useAuth";

function isActivePath(currentPath, href) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function SidebarNav({ items, role }) {
  const { logout } = useAuth();
  const location = useLocation();
  const isAdmin = role === "ADMIN";
  const mainItems = isAdmin
    ? items.filter((item) =>
        [
          "/admin/dashboard",
          "/admin/features",
          "/admin/departments",
          "/admin/classes",
          "/admin/subjects",
          "/admin/users",
          "/admin/uploads",
          "/smartboard/view"
        ].includes(item.href)
      )
    : items;
  const settingsItems = isAdmin
    ? items.filter((item) => ["/admin/analytics", "/admin/settings"].includes(item.href))
    : [];

  const renderNavItems = (navItems) =>
    navItems.map((item) => {
      const active = isActivePath(location.pathname, item.href);
      return (
        <Link
          key={item.href}
          to={item.href}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
            active
              ? isAdmin
                ? "bg-white/20 text-white ring-1 ring-white/25"
                : "bg-white/20 text-white"
              : isAdmin
                ? "text-[#d6dfff] hover:bg-white/10 hover:text-white"
                : "text-soft hover:bg-white/10 hover:text-white"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
              active
                ? isAdmin
                  ? "bg-white text-[#2f49c8]"
                  : "bg-white/20"
                : isAdmin
                  ? "bg-white/10 text-[#d6dfff]"
                  : "bg-white/5"
            }`}
          >
            <PortalIcon name={getNavIconName(item.href)} className="h-4 w-4" />
          </span>
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div
        className={`glass-card m-4 flex h-[calc(100vh-2rem)] w-64 flex-col rounded-3xl p-5 ${
          isAdmin ? "admin-sidebar sticky top-4 rounded-[2rem]" : "fixed"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/auth-assets/logo.jpg"
            alt="CMR Portal logo"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div>
            <h1 className="font-display text-xl text-white">CMR Portal</h1>
            <p className="text-xs uppercase tracking-[0.22em] text-soft">{role}</p>
          </div>
        </div>

        <div className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
          {isAdmin ? (
            <section>
              <p className="px-2 text-[10px] uppercase tracking-[0.3em] text-soft/80">Main Menu</p>
              <nav className="mt-3 space-y-2">{renderNavItems(mainItems)}</nav>
            </section>
          ) : (
            <nav className="space-y-2">{renderNavItems(mainItems)}</nav>
          )}

          {isAdmin ? (
            <section>
              <p className="px-2 text-[10px] uppercase tracking-[0.3em] text-soft/80">Settings</p>
              <nav className="mt-3 space-y-2">{renderNavItems(settingsItems)}</nav>
            </section>
          ) : null}
        </div>

        <div
          className={`border-t pt-4 ${
            isAdmin ? "border-white/20" : "border-white/10"
          }`}
        >
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isAdmin
                ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                isAdmin ? "bg-white/20 text-white" : "bg-white/10"
              }`}
            >
              <PortalIcon name="logout" className="h-4 w-4" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
