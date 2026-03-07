import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  UserCircle2,
} from "lucide-react";

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type Props = {
  role: "student" | "faculty" | "admin";
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarItems: SidebarItem[];
  userName?: string;
  userSubtitle?: string;
};

const profileLinks = [
  {
    id: "profile",
    label: "My Profile",
    icon: <UserCircle2 size={15} />,
  },
  {
    id: "account",
    label: "Account Settings",
    icon: <Settings size={15} />,
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield size={15} />,
  },
  {
    id: "signout",
    label: "Sign Out",
    icon: <LogOut size={15} />,
  },
];

function DashboardLayout({
  role,
  children,
  activeTab,
  onTabChange,
  sidebarItems,
  userName = "User",
  userSubtitle = "EduSlide Member",
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const currentItem =
    sidebarItems.find((item) => item.id === activeTab) ?? sidebarItems[0];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hoverUp = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "translateY(-3px)";
    event.currentTarget.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.12)";
  };

  const hoverReset = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "translateY(0)";
    event.currentTarget.style.boxShadow = "none";
  };

  const sidebarBody = (
    <>
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-400 text-white"
            style={{ borderRadius: "14px" }}
          >
            <Shield size={20} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">EduSlide Pro</p>
            <p className="text-xs text-slate-500">PPT System</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <div
          className="border border-slate-200 bg-slate-50 p-3"
          style={{ borderRadius: "16px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center bg-slate-900 text-sm font-semibold text-white"
              style={{ borderRadius: "999px" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{userSubtitle}</p>
            </div>
          </div>
          <div className="mt-3">
            <span
              className="inline-flex border border-sky-200 bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700"
              style={{ borderRadius: "999px" }}
            >
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sidebarItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              onMouseEnter={hoverUp}
              onMouseLeave={hoverReset}
              className="mb-2 flex w-full items-center justify-between border px-3 py-3 text-left transition-all"
              style={{
                borderRadius: "14px",
                borderColor: isActive ? "#bfdbfe" : "#e2e8f0",
                background: isActive ? "linear-gradient(90deg,#eff6ff,#ecfeff)" : "#ffffff",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center"
                  style={{
                    borderRadius: "11px",
                    background: isActive ? "rgba(14, 116, 144, 0.12)" : "#f8fafc",
                    color: isActive ? "#0369a1" : "#64748b",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className="text-sm"
                  style={{ color: isActive ? "#0f172a" : "#475569", fontWeight: isActive ? 700 : 500 }}
                >
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge ? (
                  <span
                    className="inline-flex min-w-6 items-center justify-center px-1.5 py-0.5 text-[11px] font-semibold text-slate-700"
                    style={{ borderRadius: "999px", background: "#e2e8f0" }}
                  >
                    {item.badge}
                  </span>
                ) : null}
                <ChevronRight size={15} color={isActive ? "#0284c7" : "#94a3b8"} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600"
          style={{ borderRadius: "14px", background: "#fef2f2" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#fee2e2";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "#fef2f2";
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarBody}
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-900/45"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-white"
            style={{ boxShadow: "10px 0 30px rgba(15,23,42,0.25)" }}
          >
            {sidebarBody}
          </aside>
        </div>
      ) : null}

      <div className="pb-20 lg:pb-0 lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-700 lg:hidden"
                style={{ borderRadius: "12px" }}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-lg font-semibold text-slate-900">{currentItem?.label ?? "Dashboard"}</p>
                <p className="text-xs text-slate-500">{today}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <label
                  className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2"
                  style={{ borderRadius: "12px", minWidth: "240px" }}
                >
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  />
                </label>
              </div>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-700"
                style={{ borderRadius: "12px" }}
              >
                <Bell size={18} />
                <span
                  className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center bg-red-500 px-1 text-[10px] font-semibold text-white"
                  style={{ borderRadius: "999px" }}
                >
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  style={{ borderRadius: "12px" }}
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center bg-slate-900 text-xs font-semibold text-white"
                    style={{ borderRadius: "999px" }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block">Profile</span>
                  <ChevronDown size={15} className={profileOpen ? "rotate-180" : ""} />
                </button>
                {profileOpen ? (
                  <div
                    className="absolute right-0 mt-2 w-52 border border-slate-200 bg-white p-2"
                    style={{ borderRadius: "12px", boxShadow: "0 12px 32px rgba(15,23,42,0.16)" }}
                  >
                    <div className="border-b border-slate-100 px-2 pb-2">
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{userSubtitle}</p>
                    </div>
                    <div className="pt-2">
                      {profileLinks.map((link) => (
                        <button
                          key={link.id}
                          type="button"
                          className="mb-1 flex w-full items-center gap-2 px-2 py-2 text-left text-sm text-slate-600"
                          style={{ borderRadius: "10px" }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = "transparent";
                          }}
                        >
                          {link.icon}
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {sidebarItems.slice(0, 5).map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-[11px]"
                style={{
                  borderRadius: "10px",
                  color: active ? "#0369a1" : "#64748b",
                  background: active ? "#ecfeff" : "transparent",
                }}
                onClick={() => onTabChange(item.id)}
              >
                {item.icon}
                <span>{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export type { SidebarItem, Props };
export default DashboardLayout;
