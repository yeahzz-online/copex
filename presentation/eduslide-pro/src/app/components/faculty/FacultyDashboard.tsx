import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Monitor,
  QrCode,
  Search,
  Settings,
  Upload,
  Users,
  X,
} from "lucide-react";
import DashboardLayout, { type SidebarItem } from "../layout/DashboardLayout";
import { classOptions, facultySubjectStats, students, submissions, type SubmissionStatus } from "../../mockData";

type FacultyTab = "dashboard" | "classes" | "submissions" | "students" | "resources" | "settings";

type ClassOption = (typeof classOptions)[number];

type FilterKey = "all" | SubmissionStatus;

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BookOpen size={16} />,
  },
  {
    id: "classes",
    label: "My Classes",
    icon: <BookOpen size={16} />,
  },
  {
    id: "submissions",
    label: "Submissions",
    icon: <Upload size={16} />,
    badge: 7,
  },
  {
    id: "students",
    label: "Students",
    icon: <Users size={16} />,
  },
  {
    id: "resources",
    label: "Resources",
    icon: <Download size={16} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={16} />,
  },
];

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<FacultyTab>("dashboard");
  const [selectedClass, setSelectedClass] = useState<ClassOption>(classOptions[0]);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [submissionFilter, setSubmissionFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionsData, setSubmissionsData] = useState(submissions);

  const pendingCount = submissionsData.filter((item) => item.status === "pending").length;

  const filteredSubmissions = submissionsData.filter((item) => {
    const statusMatches = submissionFilter === "all" || item.status === submissionFilter;
    const query = searchQuery.toLowerCase();
    const queryMatches =
      item.studentName.toLowerCase().includes(query) ||
      item.filename.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query);
    return statusMatches && queryMatches;
  });

  const updateSubmissionStatus = (id: string, status: SubmissionStatus) => {
    setSubmissionsData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const statusPalette = (status: SubmissionStatus) => {
    if (status === "approved") {
      return { text: "#166534", border: "#86efac", bg: "#dcfce7" };
    }
    if (status === "pending") {
      return { text: "#b45309", border: "#fcd34d", bg: "#fef3c7" };
    }
    return { text: "#b91c1c", border: "#fca5a5", bg: "#fee2e2" };
  };

  const topBanner = (
    <section
      className="mb-5 border border-white/40 bg-white/75 px-4 py-3 backdrop-blur md:px-5"
      style={{ borderRadius: "16px" }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Active Class</p>
          <button
            type="button"
            className="mt-1 flex min-w-[280px] items-center justify-between border border-slate-200 bg-white px-3 py-2 text-sm"
            style={{ borderRadius: "12px" }}
            onClick={() => setClassDropdownOpen((current) => !current)}
          >
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <BookOpen size={16} />
              {selectedClass.label}
            </span>
            <ChevronDown size={15} className={classDropdownOpen ? "rotate-180" : ""} />
          </button>

          <AnimatePresence>
            {classDropdownOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-30 mt-2 w-full border border-slate-200 bg-white p-2"
                style={{ borderRadius: "12px", boxShadow: "0 10px 24px rgba(15,23,42,0.15)" }}
              >
                {classOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="mb-1 flex w-full items-center justify-between px-3 py-2 text-left"
                    style={{ borderRadius: "10px" }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = "#eff6ff";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "transparent";
                    }}
                    onClick={() => {
                      setSelectedClass(option);
                      setClassDropdownOpen(false);
                    }}
                  >
                    <span>
                      <span className="block text-sm font-medium text-slate-700">{option.label}</span>
                      <span className="text-xs text-slate-500">{option.dept}</span>
                    </span>
                    {selectedClass.id === option.id ? <Check size={15} color="#0f4c81" /> : null}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
              boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
            }}
            onClick={() => setShowQRModal(true)}
          >
            <Monitor size={15} />
            Connect Smartboard
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center border border-slate-200 bg-white"
            style={{ borderRadius: "12px" }}
          >
            <Bell size={16} />
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-red-500 px-1 text-[10px] text-white"
              style={{ borderRadius: "999px" }}
            >
              2
            </span>
          </button>
        </div>
      </div>
    </section>
  );

  const renderDashboardTab = () => {
    return (
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Students", value: 147, color: "#0f4c81" },
            { label: "Submissions", value: 312, color: "#00b4d8" },
            { label: "Pending Review", value: pendingCount, color: "#f59e0b" },
            { label: "Approved", value: submissionsData.filter((item) => item.status === "approved").length, color: "#16a34a" },
          ].map((item) => (
            <article key={item.label} className="border border-slate-200 bg-white p-5" style={{ borderRadius: "14px" }}>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: item.color }}>
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {facultySubjectStats.map((subject) => (
            <button
              key={subject.id}
              type="button"
              className="border border-slate-200 bg-white p-4 text-left"
              style={{ borderRadius: "15px", transition: "all 0.2s ease" }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-4px)";
                event.currentTarget.style.boxShadow = "0 12px 24px rgba(15,23,42,0.14)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => setActiveTab("submissions")}
            >
              <div className="mb-3 h-1.5" style={{ borderRadius: "999px", background: subject.color }} />
              <span
                className="inline-flex px-2 py-1 text-[11px] font-semibold"
                style={{ borderRadius: "999px", background: `${subject.color}16`, color: subject.color }}
              >
                {subject.code}
              </span>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{subject.name}</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{subject.submissions}</p>
              <p className="text-sm text-slate-500">submissions</p>
              {subject.pending > 0 ? (
                <span
                  className="mt-3 inline-flex px-2 py-1 text-xs font-semibold"
                  style={{ borderRadius: "999px", background: "#fef3c7", color: "#b45309" }}
                >
                  {subject.pending} pending
                </span>
              ) : null}
            </button>
          ))}
        </section>
      </div>
    );
  };

  const renderClassesTab = () => {
    return (
      <section className="grid gap-4 md:grid-cols-2">
        {classOptions.map((option) => (
          <article key={option.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
            <h3 className="text-lg font-semibold text-slate-900">{option.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{option.dept}</p>
            <div className="mt-3 text-xs text-slate-500">Schedule synced with Smartboard</div>
          </article>
        ))}
      </section>
    );
  };

  const renderSubmissionsTab = () => {
    const filters: Array<{ key: FilterKey; label: string }> = [
      { key: "all", label: "All" },
      { key: "pending", label: `Pending (${pendingCount})` },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
    ];

    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => {
            const active = item.key === submissionFilter;
            return (
              <button
                key={item.key}
                type="button"
                className="border px-3 py-1.5 text-sm font-medium"
                style={{
                  borderRadius: "999px",
                  borderColor: active ? "transparent" : "#cbd5e1",
                  color: active ? "#ffffff" : "#475569",
                  background: active ? "linear-gradient(90deg,#0f4c81,#00b4d8)" : "#ffffff",
                }}
                onClick={() => setSubmissionFilter(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <label
          className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2"
          style={{ borderRadius: "12px" }}
        >
          <Search size={15} color="#64748b" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by student, subject or file"
            className="w-full text-sm outline-none"
          />
        </label>

        <div className="space-y-3">
          {filteredSubmissions.map((item) => {
            const status = statusPalette(item.status);
            return (
              <article key={item.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center"
                      style={{ borderRadius: "10px", background: "#eff6ff", color: "#0f4c81" }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.filename}</p>
                      <p className="text-xs text-slate-500">
                        {item.studentName} · {item.rollNo} · {item.subject} · {item.size} · {item.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 text-xs font-semibold capitalize"
                    style={{ borderRadius: "999px", border: `1px solid ${status.border}`, background: status.bg, color: status.text }}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                    style={{ borderRadius: "999px" }}
                  >
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                    style={{ borderRadius: "999px" }}
                  >
                    <Download size={13} />
                    Download
                  </button>
                  {item.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        className="border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                        style={{ borderRadius: "999px" }}
                        onClick={() => updateSubmissionStatus(item.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        style={{ borderRadius: "999px" }}
                        onClick={() => updateSubmissionStatus(item.id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderStudentsTab = () => {
    return (
      <section className="overflow-hidden border border-slate-200 bg-white" style={{ borderRadius: "14px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#f8faff";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <td className="border-t border-slate-100 px-4 py-3 font-medium">{student.rollNo}</td>
                  <td className="border-t border-slate-100 px-4 py-3">{student.name}</td>
                  <td className="border-t border-slate-100 px-4 py-3">{student.email}</td>
                  <td className="border-t border-slate-100 px-4 py-3">{student.dept}</td>
                  <td className="border-t border-slate-100 px-4 py-3">{student.sem}</td>
                  <td className="border-t border-slate-100 px-4 py-3">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-semibold capitalize"
                      style={{
                        borderRadius: "999px",
                        background: student.status === "active" ? "#dcfce7" : "#fee2e2",
                        color: student.status === "active" ? "#166534" : "#b91c1c",
                      }}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  const renderResourcesTab = () => {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {facultySubjectStats.map((subject) => (
          <article key={`resource-${subject.id}`} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
            <h3 className="text-base font-semibold text-slate-900">{subject.name}</h3>
            <p className="text-sm text-slate-500">{subject.submissions} submissions archived</p>
            <button
              type="button"
              className="mt-3 flex items-center gap-1 border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700"
              style={{ borderRadius: "999px" }}
            >
              <Download size={13} />
              Download pack
            </button>
          </article>
        ))}
      </section>
    );
  };

  const renderSettingsTab = () => {
    return (
      <section className="max-w-[700px] space-y-3">
        {[
          { id: "name", label: "Full Name", value: "Dr. Priya Sharma" },
          { id: "email", label: "Email", value: "priya.sharma@college.edu" },
          { id: "emp", label: "Employee ID", value: "FAC001" },
          { id: "dept", label: "Department", value: "Computer Science" },
          { id: "designation", label: "Designation", value: "Associate Professor" },
        ].map((field) => (
          <div key={field.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "12px" }}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
            <p className="text-sm font-medium text-slate-800">{field.value}</p>
          </div>
        ))}
        <button
          type="button"
          className="px-5 py-2.5 text-sm font-semibold text-white"
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

  let tabContent: React.ReactNode;
  if (activeTab === "dashboard") {
    tabContent = renderDashboardTab();
  } else if (activeTab === "classes") {
    tabContent = renderClassesTab();
  } else if (activeTab === "submissions") {
    tabContent = renderSubmissionsTab();
  } else if (activeTab === "students") {
    tabContent = renderStudentsTab();
  } else if (activeTab === "resources") {
    tabContent = renderResourcesTab();
  } else {
    tabContent = renderSettingsTab();
  }

  return (
    <>
      <DashboardLayout
        role="faculty"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as FacultyTab)}
        sidebarItems={sidebarItems}
        userName="Dr. Priya Sharma"
        userSubtitle="Computer Science Dept."
      >
        {topBanner}
        {tabContent}
      </DashboardLayout>

      <AnimatePresence>
        {showQRModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-[520px] overflow-hidden border border-slate-200 bg-white"
              style={{ borderRadius: "16px" }}
            >
              <div className="flex items-start justify-between bg-gradient-to-r from-[#0f4c81] to-[#00b4d8] p-4 text-white">
                <div>
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    <Monitor size={18} />
                    Connect Smartboard
                  </p>
                  <p className="text-xs text-white/80">Pair this class to start live presentation mode</p>
                </div>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center border border-white/30"
                  style={{ borderRadius: "999px" }}
                  onClick={() => setShowQRModal(false)}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 text-center">
                <div className="relative mx-auto h-[220px] w-[220px]" style={{ borderRadius: "18px" }}>
                  <div
                    className="absolute inset-0 border-2 border-cyan-300 ping-ring"
                    style={{ borderRadius: "18px" }}
                  />
                  <svg viewBox="0 0 220 220" className="relative z-10 h-full w-full bg-white p-4" style={{ borderRadius: "16px" }}>
                    <rect x="0" y="0" width="220" height="220" fill="white" />
                    <rect x="16" y="16" width="48" height="48" fill="#0f172a" />
                    <rect x="26" y="26" width="28" height="28" fill="white" />
                    <rect x="34" y="34" width="12" height="12" fill="#0f172a" />

                    <rect x="156" y="16" width="48" height="48" fill="#0f172a" />
                    <rect x="166" y="26" width="28" height="28" fill="white" />
                    <rect x="174" y="34" width="12" height="12" fill="#0f172a" />

                    <rect x="16" y="156" width="48" height="48" fill="#0f172a" />
                    <rect x="26" y="166" width="28" height="28" fill="white" />
                    <rect x="34" y="174" width="12" height="12" fill="#0f172a" />

                    {Array.from({ length: 90 }).map((_, index) => {
                      const x = (index * 17) % 180 + 20;
                      const y = Math.floor(index * 1.9) % 180 + 20;
                      if ((x < 72 && y < 72) || (x > 146 && y < 72) || (x < 72 && y > 146)) {
                        return null;
                      }
                      return <rect key={`qr-${index}`} x={x} y={y} width="6" height="6" fill="#0f172a" />;
                    })}

                    <rect x="86" y="86" width="48" height="48" fill="#0f172a" rx="12" />
                    <foreignObject x="98" y="98" width="24" height="24">
                      <div className="flex h-full w-full items-center justify-center text-white">
                        <QrCode size={18} />
                      </div>
                    </foreignObject>
                  </svg>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Classroom ID: <span className="font-semibold text-cyan-600">ROOM-304-A</span>
                </p>
                <p className="mt-2 text-sm text-slate-500">Scan this code from EduSlide Pro mobile app.</p>

                <div
                  className="mx-auto mt-4 inline-flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                  style={{ borderRadius: "999px" }}
                >
                  <span className="h-2 w-2 bg-green-500 pulse-dot" style={{ borderRadius: "999px" }} />
                  Waiting for smartboard...
                </div>

                <button
                  type="button"
                  className="mt-4 w-full px-4 py-3 text-sm font-semibold text-white"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(90deg,#0f4c81,#00b4d8)",
                    boxShadow: "0 4px 20px rgba(15,76,129,0.3)",
                  }}
                >
                  Start Presentation
                </button>
                <button
                  type="button"
                  className="mt-2 w-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
                  style={{ borderRadius: "12px" }}
                  onClick={() => setShowQRModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default FacultyDashboard;
