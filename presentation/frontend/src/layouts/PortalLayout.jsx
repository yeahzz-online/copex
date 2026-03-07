import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SidebarNav from "../components/SidebarNav";
import TopBar from "../components/TopBar";
import useAuth from "../hooks/useAuth";
import { navByRole } from "../routes/navConfig";

export default function PortalLayout() {
  const { role, logout } = useAuth();
  const navItems = navByRole[role] || [];
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-mode");
    } else {
      document.body.classList.remove("admin-mode");
    }
    return () => {
      document.body.classList.remove("admin-mode");
    };
  }, [isAdmin]);

  if (role === "SMARTBOARD") {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Logout
          </button>
        </div>
        <main className="content-fade-in h-[calc(100vh-2rem)]">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen lg:flex ${isAdmin ? "admin-shell" : ""}`}>
      <SidebarNav items={navItems} role={role} />
      <div className={`flex-1 p-4 pb-24 lg:p-6 lg:pl-0 ${isAdmin ? "admin-content-wrap" : ""}`}>
        <TopBar />
        <main className={`content-fade-in ${isAdmin ? "admin-main" : ""}`}>
          <Outlet />
        </main>
      </div>
      <BottomNav items={navItems} role={role} />
    </div>
  );
}
