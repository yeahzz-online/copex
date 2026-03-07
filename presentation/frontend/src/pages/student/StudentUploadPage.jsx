import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

const ALLOWED_CONTENT_TYPES = new Set([
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/pdf"
]);

function getContentType(file) {
  if (!file) return "application/octet-stream";
  if (ALLOWED_CONTENT_TYPES.has(file.type)) return file.type;

  const lowerName = String(file.name || "").toLowerCase();
  if (lowerName.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (lowerName.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export default function StudentUploadPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: ""
  });
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        const response = await api.get("/student/subjects");
        setSubjects(response.data.subjects || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load subjects");
      }
    }

    loadSubjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!form.subjectId) {
      setError("Please select a subject");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter presentation title");
      return;
    }

    if (!file) {
      setError("Please choose a PPT, PPTX, or PDF file");
      return;
    }

    setSubmitting(true);
    try {
      const fileType = getContentType(file);

      const presignResponse = await api.post("/student/presentations/presign", {
        subjectId: form.subjectId,
        title: form.title.trim(),
        description: form.description.trim(),
        fileName: file.name,
        fileType
      });

      const uploadResponse = await fetch(presignResponse.data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileType
        },
        body: file
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        const reason = String(errorText || "").trim();
        throw new Error(reason ? `Storage upload failed: ${reason}` : "Failed to upload file to storage");
      }

      setResult({
        ...presignResponse.data,
        fileName: file.name
      });
      setForm({
        title: "",
        description: "",
        subjectId: ""
      });
      setFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to upload presentation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard>
      <h3 className="font-display text-lg text-white">Upload Presentation</h3>
      <p className="mt-1 text-sm text-soft">
        Upload PPT/PPTX/PDF with title, description, and subject mapping.
      </p>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-300 md:col-span-2"
          placeholder="Presentation title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />

        <textarea
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-300 md:col-span-2"
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />

        <select
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-300"
          value={form.subjectId}
          onChange={(event) => setForm((prev) => ({ ...prev, subjectId: event.target.value }))}
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} - {item.name}
            </option>
          ))}
        </select>

        <input
          key={fileInputKey}
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-white/20 file:px-3 file:py-1 file:text-white focus:border-brand-300"
          type="file"
          accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          required
        />

        <button
          className="rounded-xl bg-gradient-to-r from-violetBrand-500 to-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70 md:col-span-2"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Uploading..." : "Upload Presentation"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-xl border border-emerald-200/30 bg-emerald-200/10 p-4 text-xs">
          <p className="text-emerald-100">Upload completed successfully.</p>
          <p className="mt-2 text-emerald-50">File: {result.fileName}</p>
          <a
            className="mt-2 inline-block text-brand-200 hover:text-brand-100"
            href={result.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Uploaded File
          </a>
        </div>
      ) : null}
    </GlassCard>
  );
}
