import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

export default function FacultySmartboardPage() {
  const [session, setSession] = useState(null);
  const [sessionToken, setSessionToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [controlMessage, setControlMessage] = useState("");
  const [summary, setSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedUploadId, setSelectedUploadId] = useState("");
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [slideNumber, setSlideNumber] = useState(1);

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await api.get("/faculty/smartboard/summary");
      setSummary(response.data.smartboardData || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load smartboard summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (!selectedUploadId) return;
    const exists = summary.some((item) => String(item.uploadId || "") === String(selectedUploadId));
    if (!exists) {
      setSelectedUploadId("");
      setIsPresentationMode(false);
      setSlideNumber(1);
    }
  }, [selectedUploadId, summary]);

  const selectableUploads = summary.filter((item) => item.uploadId && item.fileUrl);
  const selectedUpload = selectableUploads.find(
    (item) => String(item.uploadId) === String(selectedUploadId)
  );

  const createSession = async () => {
    setError("");
    setMessage("");
    try {
      const response = await api.post("/auth/smartboard/session", {
        smartboardName: "Classroom Smartboard"
      });
      setSession(response.data);
      setSessionToken(response.data.sessionToken);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to create smartboard session");
    }
  };

  const authorizeSession = async () => {
    setError("");
    setMessage("");
    try {
      await api.post("/auth/smartboard/authorize", { sessionToken });
      setMessage("Smartboard session authorized successfully.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to authorize smartboard session");
    }
  };

  const sendToSmartboard = (uploadId) => {
    setSelectedUploadId(uploadId);
    setIsPresentationMode(false);
    setSlideNumber(1);
    setControlMessage("Presentation sent to smartboard queue.");
  };

  const startPresentationMode = () => {
    if (!selectedUpload) {
      setControlMessage("Select a presentation first.");
      return;
    }
    setIsPresentationMode(true);
    setSlideNumber(1);
    setControlMessage("Presentation mode started on smartboard.");
  };

  const moveSlide = (direction) => {
    if (!isPresentationMode) {
      setControlMessage("Start presentation mode before controlling slides.");
      return;
    }

    setSlideNumber((prev) => {
      if (direction === "NEXT") return prev + 1;
      return Math.max(prev - 1, 1);
    });
    setControlMessage(direction === "NEXT" ? "Moved to next slide." : "Moved to previous slide.");
  };

  const stopPresentationMode = () => {
    setIsPresentationMode(false);
    setSlideNumber(1);
    setControlMessage("Presentation mode stopped.");
  };

  return (
    <section className="space-y-5">
      <GlassCard>
        <h3 className="font-display text-lg text-white">Smartboard Login</h3>
        <p className="mt-1 text-sm text-soft">
          Generate QR and authorize board login for assigned classes.
        </p>
        <button
          type="button"
          onClick={createSession}
          className="mt-4 rounded-xl bg-gradient-to-r from-violetBrand-500 to-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Generate Smartboard QR
        </button>
      </GlassCard>

      {session ? (
        <GlassCard>
          <h4 className="font-display text-base text-white">Generated Session</h4>
          <p className="mt-2 break-all text-xs text-soft">{session.sessionToken}</p>
          <img
            src={session.qrDataUrl}
            alt="Smartboard QR"
            className="mt-4 w-full max-w-xs rounded-2xl border border-white/20"
          />
          <button
            type="button"
            onClick={authorizeSession}
            className="mt-4 rounded-xl bg-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/25"
          >
            Authorize This Session
          </button>
        </GlassCard>
      ) : null}

      <GlassCard>
        <h4 className="font-display text-base text-white">Smartboard Control</h4>
        <p className="mt-1 text-sm text-soft">
          Select a presentation, broadcast to board, control slides, and stop presentation mode.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-300"
            value={selectedUploadId}
            onChange={(event) => setSelectedUploadId(event.target.value)}
          >
            <option value="">Select presentation</option>
            {selectableUploads.map((item) => (
              <option key={item.uploadId} value={item.uploadId}>
                {item.subjectName} - {item.title || item.rollNumber || item.category}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-soft">
            {selectedUpload ? (
              <>
                <p className="font-semibold text-white">
                  {selectedUpload.title || selectedUpload.rollNumber || "Presentation"}
                </p>
                <p className="text-xs text-soft">
                  {selectedUpload.subjectName} | {selectedUpload.category}
                </p>
              </>
            ) : (
              <p>No presentation selected.</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!selectedUpload}
            onClick={() => sendToSmartboard(selectedUploadId)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            Send to Smartboard
          </button>
          <button
            type="button"
            disabled={!selectedUpload}
            onClick={startPresentationMode}
            className="rounded-xl bg-gradient-to-r from-violetBrand-500 to-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            Start Presentation Mode
          </button>
          <button
            type="button"
            disabled={!isPresentationMode}
            onClick={() => moveSlide("PREV")}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            Previous Slide
          </button>
          <button
            type="button"
            disabled={!isPresentationMode}
            onClick={() => moveSlide("NEXT")}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            Next Slide
          </button>
          <button
            type="button"
            disabled={!isPresentationMode}
            onClick={stopPresentationMode}
            className="rounded-xl border border-red-400/60 bg-red-400/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/30 disabled:opacity-60"
          >
            Stop Presentation
          </button>
        </div>

        <p className="mt-3 text-xs text-soft">
          Mode: {isPresentationMode ? "ACTIVE" : "IDLE"} | Current Slide: {slideNumber}
        </p>
        {controlMessage ? <p className="mt-1 text-xs text-emerald-300">{controlMessage}</p> : null}
      </GlassCard>

      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-display text-base text-white">Smartboard Content Summary</h4>
          <button
            type="button"
            onClick={loadSummary}
            className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/25"
          >
            Refresh
          </button>
        </div>

        {loadingSummary ? <p className="mt-3 text-soft">Loading smartboard summary...</p> : null}

        {!loadingSummary && summary.length === 0 ? (
          <p className="mt-3 text-soft">No subject uploads available for smartboard yet.</p>
        ) : null}

        {summary.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-soft">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Roll Number</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Uploaded At</th>
                  <th className="px-3 py-2">Controls</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item) => (
                  <tr key={`${item.subjectId}-${item.uploadId || "none"}`} className="border-t border-white/10">
                    <td className="px-3 py-3">{item.subjectName}</td>
                    <td className="px-3 py-3">{item.rollNumber || "-"}</td>
                    <td className="px-3 py-3">{item.category || "-"}</td>
                    <td className="px-3 py-3">{item.status || "-"}</td>
                    <td className="px-3 py-3">
                      {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                        {item.uploadId ? (
                          <button
                            type="button"
                            onClick={() => sendToSmartboard(item.uploadId)}
                            className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                          >
                            Send
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </GlassCard>

      {message ? <p className="text-emerald-300">{message}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
    </section>
  );
}
