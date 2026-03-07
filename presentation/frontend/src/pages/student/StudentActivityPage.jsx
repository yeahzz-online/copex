import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

function getBadgeClass(type, status) {
  if (status === "REJECTED") return "bg-red-400/20 text-red-100";
  if (status === "APPROVED") return "bg-emerald-400/20 text-emerald-100";
  if (type === "LOGIN") return "bg-brand-400/20 text-brand-100";
  return "bg-white/10 text-white";
}

export default function StudentActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  const loadActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/student/activity");
      setActivity(response.data.activity || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  if (loading) return <p className="text-soft">Loading activity...</p>;

  return (
    <section className="space-y-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-white">Activity Timeline</h3>
            <p className="mt-1 text-sm text-soft">
              Upload history, review updates, and latest login activity.
            </p>
          </div>
          <button
            type="button"
            onClick={loadActivity}
            className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/25"
          >
            Refresh
          </button>
        </div>
      </GlassCard>

      {activity.map((item) => (
        <GlassCard key={item.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-sm text-soft">{item.message}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] uppercase ${getBadgeClass(item.type, item.status)}`}>
              {item.type}
            </span>
          </div>
          <p className="mt-3 text-xs text-soft">
            {item.status ? `${item.status} | ` : ""}
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
          </p>
        </GlassCard>
      ))}

      {!error && activity.length === 0 ? (
        <GlassCard>
          <p className="text-soft">No activity recorded yet.</p>
        </GlassCard>
      ) : null}
      {error ? <p className="text-red-300">{error}</p> : null}
    </section>
  );
}
