import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import PortalIcon from "../../components/PortalIcon";
import api from "../../services/api";

function toPercent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((Number(value || 0) / total) * 100);
}

function roleToIcon(role) {
  if (role === "STUDENT") return "subjects";
  if (role === "FACULTY") return "classes";
  if (role === "ADMIN") return "settings";
  if (role === "SMARTBOARD") return "smartboard";
  return "users";
}

function roleToTone(role) {
  if (role === "STUDENT") return "bg-[#e7eeff] text-[#3150cc]";
  if (role === "FACULTY") return "bg-[#e8f2ff] text-[#2f61be]";
  if (role === "ADMIN") return "bg-[#dce7ff] text-[#2947ad]";
  if (role === "SMARTBOARD") return "bg-[#e6f7ff] text-[#1d6c9f]";
  return "bg-[#eef2ff] text-[#2947ad]";
}

function MetricCard({ label, value, note, toneClass }) {
  return (
    <div className={`admin-panel-outline rounded-2xl p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-soft">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-soft">{note}</p>
    </div>
  );
}

function TimelineItem({ label, value, maxValue, toneClass }) {
  const width = maxValue > 0 ? Math.max(Math.round((value / maxValue) * 100), 8) : 8;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-soft">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-9 rounded-full bg-[#e9efff] p-1">
        <div
          className={`h-full rounded-full ${toneClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [state, setState] = useState({
    loading: true,
    analytics: null,
    error: ""
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/admin/analytics");
        setState({ loading: false, analytics: response.data, error: "" });
      } catch (requestError) {
        setState({
          loading: false,
          analytics: null,
          error: requestError?.response?.data?.message || "Failed to load admin dashboard"
        });
      }
    }

    loadDashboard();
  }, []);

  if (state.loading) return <p className="text-soft">Loading admin dashboard...</p>;
  if (state.error) return <p className="text-red-300">{state.error}</p>;

  const usersByRole = state.analytics?.usersByRole || [];
  const totals = state.analytics?.totals || {};
  const usersMap = usersByRole.reduce((acc, item) => {
    acc[item.role] = item.total;
    return acc;
  }, {});

  const totalUsers = Object.values(usersMap).reduce((sum, item) => sum + Number(item || 0), 0);
  const uploadHealth = Math.min(toPercent(totals.uploads || 0, (totals.subjects || 0) + 1), 100);

  const roleStats = ["STUDENT", "FACULTY", "ADMIN", "SMARTBOARD"].map((role) => ({
    role,
    value: usersMap[role] || 0
  }));

  const maxRoleValue = Math.max(...roleStats.map((item) => item.value), 1);

  const base =
    Number(totals.classes || 0) * 7 +
    Number(totals.subjects || 0) * 11 +
    Number(totals.uploads || 0) * 13 +
    Number(totalUsers || 0) * 5;
  const matrixValues = Array.from({ length: 24 }).map(
    (_, index) => ((base + (index + 3) * 17) % 93) + 7
  );

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-soft">Operations</p>
              <h3 className="admin-heading text-4xl text-white md:text-5xl">Command Deck</h3>
            </div>
            <span className="admin-pill border-[#ccd7f1] bg-[#eef3ff] text-xs uppercase tracking-[0.2em] text-[#2f49c8]">
              Live
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Classes"
              value={totals.classes || 0}
              note="Active class structures"
              toneClass="text-[#3650b3]"
            />
            <MetricCard
              label="Subjects"
              value={totals.subjects || 0}
              note="Tracked course entries"
              toneClass="text-[#2c5ca8]"
            />
            <MetricCard
              label="Uploads"
              value={totals.uploads || 0}
              note="Presentation submissions"
              toneClass="text-[#4f6fe9]"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roleStats.map((item) => (
              <div key={item.role} className="admin-panel-outline rounded-2xl p-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${roleToTone(
                      item.role
                    )}`}
                  >
                    <PortalIcon name={roleToIcon(item.role)} className="h-4 w-4" />
                  </span>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-soft">{item.role}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-soft">System Health</p>
            <span className="rounded-full border border-[#ccd7f1] bg-[#eff4ff] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#2f49c8]">
              Stability
            </span>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#2f49c8 ${uploadHealth * 3.6}deg, #4f6fe9 ${
                  uploadHealth * 3.6
                }deg ${Math.min(uploadHealth * 3.6 + 58, 350)}deg, #d8e2f8 350deg 360deg)`
              }}
            >
              <div className="absolute inset-[15px] rounded-full bg-[#ffffff]" />
              <div className="relative text-center">
                <p className="text-4xl font-bold text-white">{uploadHealth}%</p>
                <p className="text-xs uppercase tracking-[0.18em] text-soft">Upload Health</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[#d8e2f4] bg-[#f7f9ff] px-3 py-2">
              <span className="text-soft">Total Users</span>
              <span className="font-semibold text-white">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#d8e2f4] bg-[#f7f9ff] px-3 py-2">
              <span className="text-soft">Content Density</span>
              <span className="font-semibold text-white">
                {totals.classes ? ((totals.subjects || 0) / totals.classes).toFixed(1) : "0.0"} / class
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <GlassCard className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="admin-heading text-3xl text-white">Resource Matrix</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-soft">Signal Grid</p>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-12">
            {matrixValues.map((value, index) => {
              const pillColor =
                value > 66
                  ? "bg-[#2f49c8] text-white"
                  : value > 38
                    ? "bg-[#4f6fe9] text-white"
                    : "bg-[#dbe5ff] text-[#213463]";
              return (
                <div key={`matrix-${index}`} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 rounded-full text-center text-[10px] font-semibold ${pillColor}`}
                    style={{
                      height: `${20 + Math.round((value / 100) * 52)}px`,
                      lineHeight: `${20 + Math.round((value / 100) * 52)}px`
                    }}
                  >
                    {value}
                  </div>
                  <span className="text-[9px] text-soft">{index + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-2 text-soft">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2f49c8]" />
              Healthy
            </span>
            <span className="inline-flex items-center gap-2 text-soft">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4f6fe9]" />
              Medium
            </span>
            <span className="inline-flex items-center gap-2 text-soft">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dbe5ff]" />
              Idle
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="admin-heading text-3xl text-white">Projects Timeline</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-soft">Role Load</p>
          </div>

          <div className="mt-6 space-y-4">
            {roleStats.map((item) => (
              <TimelineItem
                key={`timeline-${item.role}`}
                label={item.role}
                value={item.value}
                maxValue={maxRoleValue}
                toneClass={
                  item.role === "STUDENT"
                    ? "bg-[#2f49c8]"
                    : item.role === "FACULTY"
                      ? "bg-[#4f6fe9]"
                      : item.role === "ADMIN"
                        ? "bg-[#6282eb]"
                        : "bg-[#84a2ff]"
                }
              />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#d8e2f4] bg-[#f7f9ff] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-soft">Admin Note</p>
            <p className="mt-2 text-sm text-[#445277]">
              Keep class and subject counts balanced to improve upload completion across student
              groups.
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
