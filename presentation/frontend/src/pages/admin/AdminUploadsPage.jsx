import { useEffect, useMemo, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

const STATUS_OPTIONS = ["ALL", "UPLOADED", "APPROVED", "REJECTED", "PENDING"];

function buildOfficeViewerUrl(fileUrl) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    async function loadUploads() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/uploads", { params: { limit: 300 } });
        setUploads(response.data.uploads || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load uploads");
      } finally {
        setLoading(false);
      }
    }
    loadUploads();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return uploads.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (item.subjectCode || "").toLowerCase().includes(q) ||
        (item.subjectName || "").toLowerCase().includes(q) ||
        (item.rollNumber || "").toLowerCase().includes(q) ||
        (item.email || "").toLowerCase().includes(q) ||
        (item.studentName || "").toLowerCase().includes(q)
      );
    });
  }, [uploads, statusFilter, query]);

  const summary = useMemo(() => {
    const totals = { ALL: uploads.length };
    STATUS_OPTIONS.slice(1).forEach((status) => {
      totals[status] = uploads.filter((u) => u.status === status).length;
    });
    return totals;
  }, [uploads]);

  return (
    <section className="space-y-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-white">PPT Uploads</h3>
            <p className="text-sm text-soft">View and audit presentations across all roles.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-300"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status} ({summary[status] ?? 0})
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-soft focus:border-brand-300"
              placeholder="Search subject, roll, email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        {loading ? <p className="mt-3 text-soft">Loading uploads...</p> : null}
        {error ? <p className="mt-3 text-red-300">{error}</p> : null}
        {!loading && !error && filtered.length === 0 ? (
          <p className="mt-3 text-soft">No uploads found.</p>
        ) : null}

        {filtered.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-soft">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">
                        {item.subjectCode || "-"} • {item.subjectName || "Subject"}
                      </p>
                      <p className="text-xs text-soft">Class: {item.classId || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-white">{item.studentName || "-"}</p>
                      <p className="text-xs text-soft">
                        {item.rollNumber || item.email || "NA"} • {item.branch || ""}{" "}
                        {item.section || ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white">
                        {item.status || "UPLOADED"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-soft">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.fileUrl ? (
                          <>
                            <a
                              className="rounded-lg bg-white/15 px-3 py-1 text-xs text-white hover:bg-white/25"
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => setPreviewUrl(item.fileUrl)}
                              className="rounded-lg bg-brand-500/80 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-500"
                            >
                              Preview
                            </button>
                            <a
                              className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open in new tab
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-soft">No file</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </GlassCard>

      {previewUrl ? (
        <GlassCard>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-white">Preview</h4>
            <button
              type="button"
              onClick={() => setPreviewUrl("")}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Close
            </button>
          </div>
          <div className="mt-3 h-[70vh] overflow-hidden rounded-xl border border-white/10 bg-white">
            <iframe
              title="PPT Preview"
              src={buildOfficeViewerUrl(previewUrl)}
              className="h-full w-full"
            />
          </div>
        </GlassCard>
      ) : null}
    </section>
  );
}
