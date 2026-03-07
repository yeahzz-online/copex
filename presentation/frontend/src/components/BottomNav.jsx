import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PortalIcon, { getNavIconName } from "./PortalIcon";
import { ADMIN_UI_PREFS_EVENT, getAdminUiPrefs } from "../services/adminUiPrefs";
import useAuth from "../hooks/useAuth";

function isActivePath(currentPath, href) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function BottomNav({ items, role }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [adminUiPrefs, setAdminUiPrefs] = useState(() => getAdminUiPrefs());

  useEffect(() => {
    if (role !== "ADMIN") return undefined;

    const syncPrefs = () => {
      setAdminUiPrefs(getAdminUiPrefs());
    };

    window.addEventListener(ADMIN_UI_PREFS_EVENT, syncPrefs);
    window.addEventListener("storage", syncPrefs);
    return () => {
      window.removeEventListener(ADMIN_UI_PREFS_EVENT, syncPrefs);
      window.removeEventListener("storage", syncPrefs);
    };
  }, [role]);

  const visibleItems = items;
  const navItems = useMemo(
    () => [...visibleItems, { label: "Logout", action: "logout" }],
    [visibleItems]
  );

  const gridColumns = useMemo(() => {
    if (role === "ADMIN") {
      return Math.min(Math.max(Number(adminUiPrefs.mobileNavColumns) || 3, 2), 4);
    }
    return Math.min(Math.max(navItems.length, 1), 4);
  }, [adminUiPrefs.mobileNavColumns, navItems.length, role]);

  return (
    <nav
      className={`glass-card fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.25rem)] -translate-x-1/2 rounded-2xl p-2 lg:hidden ${
        role === "ADMIN" ? "admin-mobile-nav max-h-[45vh] overflow-y-auto rounded-3xl" : ""
      }`}
    >
      <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
        {navItems.map((item) => {
          const active = isActivePath(location.pathname, item.href);
          return (
            <li key={item.href || item.action}>
              {item.action === "logout" ? (
                <button
                  type="button"
                  onClick={logout}
                  className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-[11px] transition ${
                    role === "ADMIN"
                      ? "text-blue-100 hover:bg-white/10 hover:text-white"
                      : "text-soft hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <PortalIcon name="logout" className="h-4 w-4" />
                  {item.label}
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-[11px] ${
                    active
                      ? role === "ADMIN"
                        ? "bg-white text-[#2f49c8]"
                        : "bg-white/20 text-white"
                      : role === "ADMIN"
                        ? "text-blue-100 hover:bg-white/10 hover:text-white"
                        : "text-soft hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <PortalIcon name={getNavIconName(item.href)} className="h-4 w-4" />
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
