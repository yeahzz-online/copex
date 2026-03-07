import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  MoreVertical,
  Search,
  Settings,
  Share2,
  Star,
  Upload,
  X,
} from "lucide-react";
import DashboardLayout, { type SidebarItem } from "../layout/DashboardLayout";
import { recentPpts, subjects } from "../../mockData";

type StudentTab = "dashboard" | "subjects" | "upload" | "downloads" | "settings";

type StatusTone = {
  text: string;
  bg: string;
  border: string;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BookOpen size={16} />,
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: <BookOpen size={16} />,
  },
  {
    id: "upload",
    label: "Upload PPT",
    icon: <Upload size={16} />,
  },
  {
    id: "downloads",
    label: "Downloads",
    icon: <Download size={16} />,
    badge: 3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={16} />,
  },
];

const downloadsList = [
  {
    id: "download-1",
    filename: "Advanced Graph Theory.pptx",
    subject: "Data Structures",
    size: "4.8MB",
    date: "Mar 04",
  },
  {
    id: "download-2",
    filename: "OSI Layer Walkthrough.pptx",
    subject: "Computer Networks",
    size: "2.4MB",
    date: "Mar 02",
  },
  {
    id: "download-3",
    filename: "SQL Query Optimization.pptx",
    subject: "DBMS",
    size: "3.0MB",
    date: "Feb 28",
  },
];

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<StudentTab>("dashboard");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [presentationDescription, setPresentationDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code ?? "");

  const hoverLift = (event: React.MouseEvent<HTMLElement>, amount = -4) => {
    event.currentTarget.style.transform = `translateY(${amount}px)`;
    event.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 23, 42, 0.12)";
  };

  const hoverReset = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "translateY(0)";
    event.currentTarget.style.boxShadow = "none";
  };

  const filteredSubjects = subjects.filter((subject) => {
    const query = subjectSearch.toLowerCase();
    return subject.name.toLowerCase().includes(query) || subject.code.toLowerCase().includes(query);
  });

  const statusTone = (status: "approved" | "pending" | "rejected"): StatusTone => {
    if (status === "approved") {
      return { text: "#15803d", bg: "#dcfce7", border: "#86efac" };
    }
    if (status === "pending") {
      return { text: "#b45309", bg: "#fef3c7", border: "#fcd34d" };
    }
    return { text: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" };
  };

  const renderDashboardTab = () => {
    return (
      <div className="space-y-6">
        <section
          className="border border-blue-100 p-6 text-white"
          style={{
            borderRadius: "18px",
            background: "linear-gradient(120deg, #0f4c81, #09335a, #00b4d8)",
          }}
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Good Morning</p>
              <h2 className="mt-1 text-3xl font-semibold">Welcome back, Alex! 👋</h2>
              <p className="mt-2 text-sm text-white/75">You have 3 pending submissions due this week.</p>
            </div>
            <button
              type="button"
              className="border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"
              style={{ borderRadius: "12px", backdropFilter: "blur(8px)" }}
              onClick={() => {
                setActiveTab("upload");
                setShowUploadModal(true);
              }}
            >
              Upload New PPT
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Subjects", value: 12, trend: "+1 this month", color: "#0f4c81", icon: <BookOpen size={18} /> },
            { label: "Uploaded PPTs", value: 47, trend: "+8 this week", color: "#00b4d8", icon: <Upload size={18} /> },
            { label: "Pending Submissions", value: 3, trend: "Due in 2 days", color: "#f59e0b", icon: <Clock size={18} /> },
            { label: "Downloaded PPTs", value: 128, trend: "+12 this week", color: "#16a34a", icon: <Download size={18} /> },
          ].map((card) => (
            <article
              key={card.label}
              className="border border-slate-200 bg-white p-5"
              style={{ borderRadius: "16px", transition: "all 0.2s ease" }}
              onMouseEnter={(event) => hoverLift(event)}
              onMouseLeave={hoverReset}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center"
                  style={{ borderRadius: "12px", background: `${card.color}1a`, color: card.color }}
                >
                  {card.icon}
                </div>
                <p className="text-xs font-medium text-slate-400">Today</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-600">{card.label}</p>
              <p className="mt-2 text-xs" style={{ color: card.color }}>
                {card.trend}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="border border-slate-200 bg-white p-5 xl:col-span-2" style={{ borderRadius: "16px" }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Presentations</h3>
              <button type="button" className="text-sm font-medium text-cyan-600">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentPpts.map((item) => {
                const tone = statusTone(item.status);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 px-3 py-3"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-600"
                        style={{ borderRadius: "10px" }}
                      >
                        <FileText size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.filename}</p>
                        <p className="text-xs text-slate-500">
                          {item.subject} · {item.size} · {item.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 text-xs font-semibold capitalize"
                      style={{ borderRadius: "999px", color: tone.text, background: tone.bg, border: `1px solid ${tone.border}` }}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="space-y-4">
            <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "16px" }}>
              <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Upload Presentation", icon: <Upload size={16} />, color: "#0f4c81", tab: "upload" as StudentTab },
                  { label: "Download Resources", icon: <Download size={16} />, color: "#059669", tab: "downloads" as StudentTab },
                  { label: "Browse Subjects", icon: <BookOpen size={16} />, color: "#0891b2", tab: "subjects" as StudentTab },
                  { label: "My Submissions", icon: <FileText size={16} />, color: "#f59e0b", tab: "dashboard" as StudentTab },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left"
                    style={{ borderRadius: "12px" }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = `${item.color}14`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "transparent";
                    }}
                    onClick={() => setActiveTab(item.tab)}
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      <span style={{ color: item.color }}>{item.icon}</span>
                      {item.label}
                    </span>
                    <ChevronRight size={15} color="#64748b" />
                  </button>
                ))}
              </div>
            </article>

            <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "16px" }}>
              <h3 className="text-base font-semibold text-slate-900">Subject Progress</h3>
              <div className="mt-3 space-y-3">
                {subjects.slice(0, 4).map((subject) => (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{subject.code}</span>
                      <span style={{ color: subject.color }}>{subject.progress}%</span>
                    </div>
                    <div
                      className="h-2 w-full bg-slate-100"
                      style={{ borderRadius: "999px", overflow: "hidden" }}
                    >
                      <div
                        className="h-full"
                        style={{ width: `${subject.progress}%`, background: subject.color, transition: "width 0.3s ease" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  };

  const renderSubjectsTab = () => {
    return (
      <div>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">My Subjects</h2>
            <p className="text-sm text-slate-500">Semester 6 · Computer Science Engineering</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label
              className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2"
              style={{ borderRadius: "12px" }}
            >
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search subjects"
                value={subjectSearch}
                className="w-full text-sm outline-none"
                onChange={(event) => setSubjectSearch(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="flex items-center justify-center gap-1 border border-slate-200 bg-white px-4 py-2 text-sm"
              style={{ borderRadius: "12px" }}
            >
              <Filter size={14} />
              Filter
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-white"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
              }}
              onClick={() => {
                setActiveTab("upload");
                setShowUploadModal(true);
              }}
            >
              Upload
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <article
              key={subject.id}
              className="overflow-hidden border border-slate-200 bg-white"
              style={{ borderRadius: "16px", transition: "all 0.25s ease" }}
              onMouseEnter={(event) => hoverLift(event, -6)}
              onMouseLeave={hoverReset}
            >
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${subject.color}, #00b4d8)` }} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center"
                    style={{ borderRadius: "10px", background: `${subject.color}16`, color: subject.color }}
                  >
                    <BookOpen size={17} />
                  </div>
                  <button type="button" className="text-slate-500">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">{subject.name}</h3>
                <p className="text-sm font-medium" style={{ color: subject.color }}>
                  {subject.code}
                </p>
                <p className="mt-1 text-sm text-slate-500">{subject.faculty}</p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Completion</span>
                    <span style={{ color: subject.color }}>{subject.progress}%</span>
                  </div>
                  <div
                    className="h-2 w-full bg-slate-100"
                    style={{ borderRadius: "999px", overflow: "hidden" }}
                  >
                    <div
                      className="h-full"
                      style={{ width: `${subject.progress}%`, background: subject.color, transition: "width 0.3s ease" }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText size={13} />
                    {subject.pptCount} presentations
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
                  {[
                    { label: "Upload", icon: <Upload size={12} /> },
                    { label: "View", icon: <FileText size={12} /> },
                    { label: "Download", icon: <Download size={12} /> },
                    { label: "Share", icon: <Share2 size={12} /> },
                  ].map((action) => (
                    <button
                      key={`${subject.id}-${action.label}`}
                      type="button"
                      className="flex items-center justify-center gap-1 border border-slate-200 px-1 py-1.5 text-slate-600"
                      style={{ borderRadius: "999px" }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = `${subject.color}14`;
                        event.currentTarget.style.borderColor = `${subject.color}66`;
                        event.currentTarget.style.color = subject.color;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                        event.currentTarget.style.borderColor = "#e2e8f0";
                        event.currentTarget.style.color = "#475569";
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  const renderUploadTab = () => {
    return (
      <section className="mx-auto max-w-[640px] border border-slate-200 bg-white p-5" style={{ borderRadius: "18px" }}>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Presentation</h2>
        <p className="text-sm text-slate-500">Submit your PPT to the selected subject for review.</p>

        <button
          type="button"
          className="mt-4 flex w-full flex-col items-center border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center"
          style={{ borderRadius: "14px" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor = "#0f4c81";
            event.currentTarget.style.background = "#eff6ff";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = "#cbd5e1";
            event.currentTarget.style.background = "#f8fafc";
          }}
        >
          <Upload size={40} color="#0f4c81" />
          <p className="mt-3 text-lg font-semibold text-slate-900">Drag & Drop your presentation</p>
          <p className="mt-1 text-sm text-slate-500">Supported formats: .ppt, .pptx, .pdf</p>
          <span className="mt-3 text-sm font-medium text-cyan-600">Browse Files</span>
        </button>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Presentation Title</label>
            <input
              value={presentationTitle}
              onChange={(event) => setPresentationTitle(event.target.value)}
              className="w-full border border-slate-200 px-3 py-2 text-sm outline-none"
              style={{ borderRadius: "10px" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              value={presentationDescription}
              onChange={(event) => setPresentationDescription(event.target.value)}
              className="w-full border border-slate-200 px-3 py-2 text-sm outline-none"
              style={{ borderRadius: "10px" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              className="w-full border border-slate-200 px-3 py-2 text-sm outline-none"
              style={{ borderRadius: "10px" }}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.code}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full px-4 py-3 text-sm font-semibold text-white"
          style={{
            borderRadius: "12px",
            background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
            boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
          }}
        >
          Submit Presentation
        </button>
      </section>
    );
  };

  const renderDownloadsTab = () => {
    return (
      <section className="border border-slate-200 bg-white p-4" style={{ borderRadius: "16px" }}>
        <h2 className="text-2xl font-semibold text-slate-900">Downloads</h2>
        <p className="text-sm text-slate-500">Recently downloaded presentations.</p>
        <div className="mt-4 space-y-3">
          {downloadsList.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 px-3 py-3"
              style={{ borderRadius: "12px" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-600"
                  style={{ borderRadius: "10px" }}
                >
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.filename}</p>
                  <p className="text-xs text-slate-500">
                    {item.subject} · {item.size} · {item.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                style={{ borderRadius: "999px" }}
              >
                Re-download
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSettingsTab = () => {
    const fields = [
      { id: "full-name", label: "Full Name", value: "Alex Johnson" },
      { id: "email", label: "Email Address", value: "alex.johnson@college.edu" },
      { id: "student-id", label: "Student ID", value: "CS001" },
      { id: "department", label: "Department", value: "Computer Science" },
      { id: "semester", label: "Semester", value: "6" },
    ];

    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <article key={field.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
              <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{field.value}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="mt-5 px-5 py-2.5 text-sm font-semibold text-white"
          style={{
            borderRadius: "12px",
            background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
            boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
          }}
        >
          Save Changes
        </button>
      </section>
    );
  };

  let content: React.ReactNode;
  if (activeTab === "dashboard") {
    content = renderDashboardTab();
  } else if (activeTab === "subjects") {
    content = renderSubjectsTab();
  } else if (activeTab === "upload") {
    content = renderUploadTab();
  } else if (activeTab === "downloads") {
    content = renderDownloadsTab();
  } else {
    content = renderSettingsTab();
  }

  return (
    <>
      <DashboardLayout
        role="student"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as StudentTab)}
        sidebarItems={sidebarItems}
        userName="Alex Johnson"
        userSubtitle="CS · Semester 6"
      >
        {content}
      </DashboardLayout>

      <AnimatePresence>
        {showUploadModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-[560px] border border-slate-200 bg-white p-5"
              style={{ borderRadius: "16px" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Upload Presentation</h3>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500"
                  style={{ borderRadius: "999px" }}
                  onClick={() => setShowUploadModal(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <button
                type="button"
                className="flex w-full flex-col items-center border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8"
                style={{ borderRadius: "12px" }}
              >
                <Upload size={34} color="#0f4c81" />
                <p className="mt-2 text-sm font-medium text-slate-800">Drop your PPT here or browse files</p>
              </button>

              <div className="mt-4 grid gap-3">
                <input
                  placeholder="Presentation title"
                  value={presentationTitle}
                  onChange={(event) => setPresentationTitle(event.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 text-sm outline-none"
                  style={{ borderRadius: "10px" }}
                />
                <select
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 text-sm outline-none"
                  style={{ borderRadius: "10px" }}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="mt-4 w-full px-4 py-3 text-sm font-semibold text-white"
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                  boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
                }}
                onClick={() => setShowUploadModal(false)}
              >
                Upload Presentation
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default StudentDashboard;
