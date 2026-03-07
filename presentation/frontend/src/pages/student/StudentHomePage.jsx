import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

function MetricTile({ label, value }) {
  return (
    <GlassCard className="rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-soft">{label}</p>
      <h3 className="mt-2 font-display text-3xl text-white">{value}</h3>
    </GlassCard>
  );
}

export default function StudentHomePage() {
  const [state, setState] = useState({
    loading: true,
    dashboard: null,
    error: ""
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/student/dashboard");
        setState({
          loading: false,
          dashboard: response.data || null,
          error: ""
        });
      } catch (requestError) {
        setState({
          loading: false,
          dashboard: null,
          error: requestError?.response?.data?.message || "Failed to load student dashboard"
        });
      }
    }

    loadDashboard();
  }, []);

  if (state.loading) return <p className="text-soft">Loading student dashboard...</p>;
  if (state.error) return <p className="text-red-300">{state.error}</p>;

  const metrics = state.dashboard?.metrics || {};
  const subjects = state.dashboard?.subjects || [];
  const recentUploads = state.dashboard?.recentUploads || [];
  const notifications = state.dashboard?.notifications || [];
  const activityHistory = state.dashboard?.activityHistory || [];

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile label="Assigned Subjects" value={metrics.subjectsCount || 0} />
        <MetricTile label="Total Uploads" value={metrics.uploadedCount || 0} />
        <MetricTile label="Pending Submissions" value={metrics.pendingCount || 0} />
      </div>

      <GlassCard>
        <h3 className="font-display text-lg text-white">Assigned Subjects</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-soft">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Faculty</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="border-t border-white/10">
                  <td className="px-3 py-3">{subject.code}</td>
                  <td className="px-3 py-3">{subject.name}</td>
                  <td className="px-3 py-3">{subject.facultyName || "-"}</td>
                  <td className="px-3 py-3">{subject.uploadStatus || "PENDING"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-display text-lg text-white">Recent Uploads</h3>
          {recentUploads.length === 0 ? (
            <p className="mt-3 text-soft">No uploads yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentUploads.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="font-semibold text-white">{item.title || item.subjectName || "Presentation"}</p>
                  <p className="text-xs text-soft">
                    {item.subjectCode || "-"} | {item.status} | {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg text-white">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="mt-3 text-soft">No notifications available.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {notifications.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-soft">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-display text-lg text-white">Activity History</h3>
        {activityHistory.length === 0 ? (
          <p className="mt-3 text-soft">No activity yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {activityHistory.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-soft">
                  {item.message} | {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </section>
  );
}
