import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Building2,
  CheckCircle,
  Database,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Menu,
  Monitor,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  classCards,
  departments,
  facultyRecords,
  smartboards,
  students,
  subjectCards,
  type DepartmentRecord,
  type FacultyRecord,
  type SmartboardRecord,
  type StudentRecord,
} from "../../mockData";

type AdminTab =
  | "dashboard"
  | "departments"
  | "classes"
  | "subjects"
  | "students"
  | "faculty"
  | "smartboards"
  | "smtp"
  | "theme";

type AdminSection = "departments" | "students" | "faculty" | "smartboards" | "classes" | "subjects";

type ModalState = {
  open: boolean;
  mode: "add" | "edit";
  section: AdminSection;
};

type RowWithId = { id: string };

type Column<T extends RowWithId> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T extends RowWithId> = {
  title: string;
  addLabel: string;
  data: T[];
  columns: Column<T>[];
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: () => void;
};

const managementNav: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number }> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "departments", label: "Departments", icon: <Building2 size={16} /> },
  { id: "classes", label: "Classes", icon: <BookOpen size={16} /> },
  { id: "subjects", label: "Subjects", icon: <Database size={16} /> },
  { id: "students", label: "Students", icon: <GraduationCap size={16} />, badge: 12 },
  { id: "faculty", label: "Faculty", icon: <Users size={16} /> },
  { id: "smartboards", label: "Smartboards", icon: <Monitor size={16} /> },
];

const configNav: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: "smtp", label: "Mail (SMTP)", icon: <Mail size={16} /> },
  { id: "theme", label: "Theme Settings", icon: <Palette size={16} /> },
];

function DataTable<T extends RowWithId>({
  title,
  addLabel,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ borderRadius: "12px", background: "linear-gradient(90deg,#0f4c81,#00b4d8)", boxShadow: "0 4px 20px rgba(15,76,129,0.3)" }}
          onClick={onAdd}
        >
          <Plus size={15} />
          {addLabel}
        </button>
      </div>
      <div className="overflow-hidden border border-slate-200 bg-white" style={{ borderRadius: "14px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">{column.label}</th>
                ))}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#f8faff";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.key}`} className="border-t border-slate-100 px-4 py-3">{column.render(row)}</td>
                  ))}
                  <td className="border-t border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onEdit(row)}><Pencil size={15} color="#2563eb" /></button>
                      <button type="button" onClick={onDelete}><Trash2 size={15} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {data.length} records</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((page) => (
              <button
                key={`page-${page}`}
                type="button"
                className="h-7 w-7"
                style={{ borderRadius: "8px", color: page === 1 ? "#fff" : "#475569", background: page === 1 ? "linear-gradient(90deg,#0f4c81,#00b4d8)" : "#f1f5f9" }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);
  const [themeColor, setThemeColor] = useState("#0f4c81");
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [modalForm, setModalForm] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "add", section: "departments" });

  const closeModal = () => setModal((current) => ({ ...current, open: false }));
  const openModal = (section: AdminSection, mode: "add" | "edit", row?: RowWithId) => {
    setModal({ open: true, mode, section });
    if (!row) {
      setModalForm({});
      return;
    }
    const source =
      section === "departments"
        ? departments.find((item) => item.id === row.id)
        : section === "students"
          ? students.find((item) => item.id === row.id)
          : section === "faculty"
            ? facultyRecords.find((item) => item.id === row.id)
            : section === "smartboards"
              ? smartboards.find((item) => item.id === row.id)
              : classCards.find((item) => item.id === row.id);
    if (!source) {
      return;
    }
    const seed: Record<string, string> = {};
    Object.entries(source).forEach(([key, value]) => {
      seed[key] = String(value);
    });
    setModalForm(seed);
  };

  const statusChip = (status: string) => {
    const healthy = status === "active" || status === "online";
    return (
      <span
        className="inline-flex px-2 py-1 text-xs font-semibold capitalize"
        style={{ borderRadius: "999px", border: `1px solid ${healthy ? "#86efac" : "#fca5a5"}`, color: healthy ? "#166534" : "#b91c1c", background: healthy ? "#dcfce7" : "#fee2e2" }}
      >
        {status}
      </span>
    );
  };

  const filterRows = <T extends RowWithId>(rows: T[]) => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return rows;
    }
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  };

  const tableTabs: AdminTab[] = ["departments", "students", "faculty", "smartboards"];
  const currentSectionTitle =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "smtp"
        ? "SMTP Settings"
        : activeTab === "theme"
          ? "Theme Settings"
          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  const dashboardContent = (
    <div className="space-y-5">
      <section className="border border-slate-200 p-5 text-white" style={{ borderRadius: "16px", background: "linear-gradient(130deg,#1B262C,#0d1b22)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">System Overview</p>
            <h2 className="mt-1 text-3xl font-semibold">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-300">EduSlide Pro · Academic Year 2025-26</p>
          </div>
          <span className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300" style={{ borderRadius: "999px" }}>
            <span className="h-2 w-2 bg-green-300 pulse-dot" style={{ borderRadius: "999px" }} />
            System Online
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Departments", value: "24", color: "#22d3ee" },
            { label: "Total Students", value: "5,240", color: "#a78bfa" },
            { label: "Faculty", value: "184", color: "#4ade80" },
            { label: "Smartboards", value: "48", color: "#fbbf24" },
          ].map((item) => (
            <article key={item.label} className="border border-white/10 bg-white/8 p-4" style={{ borderRadius: "14px" }}>
              <p className="text-xs text-slate-300">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: item.color }}>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
          <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
          <div className="mt-3 space-y-3 text-sm">
            {[
              { label: "Database", status: "Operational", ok: true },
              { label: "Mail Server (SMTP)", status: "Operational", ok: true },
              { label: "File Storage", status: "87% Used", ok: true },
              { label: "Smartboard Network", status: "3/4 Online", ok: false },
            ].map((service) => (
              <div key={service.label} className="flex items-center justify-between border border-slate-100 px-3 py-2" style={{ borderRadius: "10px" }}>
                <span className="text-slate-600">{service.label}</span>
                <span className="flex items-center gap-1" style={{ color: service.ok ? "#15803d" : "#b45309" }}>
                  {service.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
          <h3 className="text-lg font-semibold text-slate-900">Quick Management</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Add Department", tab: "departments" as AdminTab },
              { label: "Add Student", tab: "students" as AdminTab },
              { label: "Add Faculty", tab: "faculty" as AdminTab },
              { label: "Add Smartboard", tab: "smartboards" as AdminTab },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
                style={{ borderRadius: "12px" }}
                onClick={() => {
                  setActiveTab(action.tab);
                  openModal(action.tab as AdminSection, "add");
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );

  const departmentsTable = (
    <DataTable<DepartmentRecord>
      title="Departments"
      addLabel="Add Department"
      data={filterRows(departments)}
      onAdd={() => openModal("departments", "add")}
      onEdit={(row) => openModal("departments", "edit", row)}
      onDelete={() => {}}
      columns={[
        { key: "name", label: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
        { key: "code", label: "Code", render: (row) => <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{row.code}</span> },
        { key: "hod", label: "HOD", render: (row) => row.hod },
        { key: "students", label: "Students", render: (row) => row.students },
        { key: "faculty", label: "Faculty", render: (row) => row.faculty },
        { key: "status", label: "Status", render: (row) => statusChip(row.status) },
      ]}
    />
  );

  const studentsTable = (
    <DataTable<StudentRecord>
      title="Students"
      addLabel="Add Student"
      data={filterRows(students)}
      onAdd={() => openModal("students", "add")}
      onEdit={(row) => openModal("students", "edit", row)}
      onDelete={() => {}}
      columns={[
        { key: "rollNo", label: "Roll No", render: (row) => row.rollNo },
        { key: "name", label: "Name", render: (row) => row.name },
        { key: "email", label: "Email", render: (row) => row.email },
        { key: "dept", label: "Dept", render: (row) => <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{row.dept}</span> },
        { key: "sem", label: "Semester", render: (row) => row.sem },
        { key: "status", label: "Status", render: (row) => statusChip(row.status) },
      ]}
    />
  );

  const facultyTable = (
    <DataTable<FacultyRecord>
      title="Faculty"
      addLabel="Add Faculty"
      data={filterRows(facultyRecords)}
      onAdd={() => openModal("faculty", "add")}
      onEdit={(row) => openModal("faculty", "edit", row)}
      onDelete={() => {}}
      columns={[
        { key: "empId", label: "Emp ID", render: (row) => row.empId },
        { key: "name", label: "Name", render: (row) => row.name },
        { key: "email", label: "Email", render: (row) => row.email },
        { key: "dept", label: "Dept", render: (row) => <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{row.dept}</span> },
        { key: "designation", label: "Designation", render: (row) => row.designation },
        { key: "status", label: "Status", render: (row) => statusChip(row.status) },
      ]}
    />
  );

  const smartboardsTable = (
    <DataTable<SmartboardRecord>
      title="Smartboards"
      addLabel="Add Smartboard"
      data={filterRows(smartboards)}
      onAdd={() => openModal("smartboards", "add")}
      onEdit={(row) => openModal("smartboards", "edit", row)}
      onDelete={() => {}}
      columns={[
        { key: "name", label: "Device", render: (row) => <span className="flex items-center gap-2"><Monitor size={14} color="#0f4c81" />{row.name}</span> },
        { key: "room", label: "Room", render: (row) => row.room },
        { key: "dept", label: "Dept", render: (row) => <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{row.dept}</span> },
        { key: "ip", label: "IP Address", render: (row) => <span className="font-mono text-xs">{row.ip}</span> },
        { key: "lastActive", label: "Last Active", render: (row) => row.lastActive },
        { key: "status", label: "Status", render: (row) => statusChip(row.status) },
      ]}
    />
  );
  const classesCardsContent = (
    <section>
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Classes</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {classCards.map((card) => (
          <article key={card.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
            <div className="flex items-start justify-between">
              <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{card.code}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => openModal("classes", "edit", card)}><Pencil size={15} color="#2563eb" /></button>
                <button type="button"><Trash2 size={15} color="#dc2626" /></button>
              </div>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.name}</h3>
            <p className="text-sm text-slate-500">{card.students} students · {card.dept}</p>
            <p className="text-sm text-slate-500">{card.owner}</p>
          </article>
        ))}
      </div>
    </section>
  );

  const subjectsCardsContent = (
    <section>
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Subjects</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjectCards.map((card) => (
          <article key={card.id} className="border border-slate-200 bg-white p-4" style={{ borderRadius: "14px" }}>
            <div className="flex items-start justify-between">
              <span className="inline-flex bg-slate-100 px-2 py-1 text-xs" style={{ borderRadius: "999px" }}>{card.code}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => openModal("subjects", "edit", card)}><Pencil size={15} color="#2563eb" /></button>
                <button type="button"><Trash2 size={15} color="#dc2626" /></button>
              </div>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.name}</h3>
            <p className="text-sm text-slate-500">{card.credits} credits · {card.dept}</p>
            <p className="text-sm text-slate-500">{card.owner}</p>
          </article>
        ))}
      </div>
    </section>
  );

  const smtpContent = (
    <section className="max-w-[680px] space-y-3">
      <h2 className="text-2xl font-semibold text-slate-900">Mail (SMTP) Settings</h2>
      {[
        { id: "host", label: "SMTP Host", value: "smtp.gmail.com" },
        { id: "port", label: "SMTP Port", value: "587" },
        { id: "fromEmail", label: "From Email", value: "admin@college.edu" },
        { id: "fromName", label: "From Name", value: "EduSlide Pro" },
        { id: "username", label: "Username", value: "admin.smtp" },
      ].map((field) => (
        <div key={field.id} className="border border-slate-200 bg-white p-3" style={{ borderRadius: "12px" }}>
          <p className="text-xs text-slate-500">{field.label}</p>
          <input defaultValue={field.value} className="mt-1 w-full bg-transparent text-sm outline-none" />
        </div>
      ))}

      <div className="border border-slate-200 bg-white p-3" style={{ borderRadius: "12px" }}>
        <p className="text-xs text-slate-500">Password</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <input type={smtpPasswordVisible ? "text" : "password"} defaultValue="SuperSecret" className="w-full bg-transparent text-sm outline-none" />
          <button type="button" className="text-xs text-cyan-600" onClick={() => setSmtpPasswordVisible((current) => !current)}>
            {smtpPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm" style={{ borderRadius: "12px" }}>
          <RefreshCw size={14} />
          Test Connection
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ borderRadius: "12px", background: "linear-gradient(120deg,#1B262C,#0d1b22)", boxShadow: "0 4px 20px rgba(15,76,129,0.3)" }}
        >
          <Save size={14} />
          Save SMTP Settings
        </button>
      </div>
    </section>
  );

  const themeContent = (
    <section className="max-w-[700px] space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Theme Settings</h2>
      <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "12px" }}>
        <p className="text-sm font-medium text-slate-700">Primary Color</p>
        <div className="mt-2 flex items-center gap-3">
          <input type="color" value={themeColor} onChange={(event) => setThemeColor(event.target.value)} className="h-10 w-16 border border-slate-200" style={{ borderRadius: "8px" }} />
          <span className="text-sm font-semibold text-slate-700">{themeColor.toUpperCase()}</span>
        </div>
      </article>
      <article className="border border-slate-200 bg-white p-4" style={{ borderRadius: "12px" }}>
        <p className="text-sm font-medium text-slate-700">Font Family</p>
        <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="mt-2 w-full border border-slate-200 px-3 py-2 text-sm outline-none" style={{ borderRadius: "10px" }}>
          <option value="Poppins">Poppins</option>
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
        </select>
      </article>
      <button
        type="button"
        className="w-full px-4 py-3 text-sm font-semibold text-white"
        style={{ borderRadius: "12px", background: "linear-gradient(120deg,#1B262C,#0d1b22)", boxShadow: "0 4px 20px rgba(15,76,129,0.3)" }}
      >
        Apply Theme Changes
      </button>
    </section>
  );

  const formFields: Record<AdminSection, string[]> = {
    departments: ["Department Name", "Short Code", "HOD Name", "Total Seats", "Department"],
    students: ["Full Name", "Roll Number", "Email", "Semester", "Department"],
    faculty: ["Full Name", "Employee ID", "Email", "Designation", "Department"],
    smartboards: ["Device Name", "Room/Location", "IP Address", "Display Resolution"],
    classes: ["Class Name", "Code", "Department", "Student Count", "Faculty Name"],
    subjects: ["Subject Name", "Code", "Credits", "Department", "Faculty Name"],
  };

  let content: React.ReactNode;
  if (activeTab === "dashboard") {
    content = dashboardContent;
  } else if (activeTab === "departments") {
    content = departmentsTable;
  } else if (activeTab === "classes") {
    content = classesCardsContent;
  } else if (activeTab === "subjects") {
    content = subjectsCardsContent;
  } else if (activeTab === "students") {
    content = studentsTable;
  } else if (activeTab === "faculty") {
    content = facultyTable;
  } else if (activeTab === "smartboards") {
    content = smartboardsTable;
  } else if (activeTab === "smtp") {
    content = smtpContent;
  } else {
    content = themeContent;
  }

  const sidebarItem = (item: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }) => {
    const active = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className="mb-1 flex w-full items-center justify-between px-3 py-2.5 text-left"
        style={{ borderRadius: "12px", background: active ? "rgba(239,68,68,0.16)" : "transparent", color: active ? "#fecaca" : "#cbd5e1" }}
        onClick={() => {
          setActiveTab(item.id);
          setSidebarOpen(false);
        }}
      >
        <span className="flex items-center gap-2">{item.icon}<span className="text-sm">{item.label}</span></span>
        {item.badge ? <span className="inline-flex min-w-5 justify-center bg-red-500 px-1 text-[10px] text-white" style={{ borderRadius: "999px" }}>{item.badge}</span> : null}
      </button>
    );
  };

  const sidebar = (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center bg-red-500/20 text-red-200" style={{ borderRadius: "12px" }}><Shield size={19} /></div>
          <div><p className="text-base font-semibold text-slate-100">Admin Panel</p><p className="text-xs text-slate-400">EduSlide Pro v2.0</p></div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="border border-white/10 bg-white/5 p-3" style={{ borderRadius: "12px" }}>
          <p className="text-sm font-semibold text-slate-100">Super Admin</p>
          <p className="text-xs text-slate-400">admin@college.edu</p>
          <span className="mt-2 inline-flex bg-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-200" style={{ borderRadius: "999px" }}>ROOT</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-[11px] uppercase tracking-wide text-slate-500">Management</p>
        {managementNav.map((item) => sidebarItem(item))}
        <p className="mb-2 mt-4 px-2 text-[11px] uppercase tracking-wide text-slate-500">Configuration</p>
        {configNav.map((item) => sidebarItem(item))}
      </div>
      <div className="border-t border-white/10 p-4"><button type="button" className="w-full border border-red-400/20 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200" style={{ borderRadius: "12px" }}>Sign Out</button></div>
    </>
  );
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col lg:flex" style={{ background: "linear-gradient(180deg,#1B262C,#0d1b22)" }}>
        {sidebar}
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/55" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[270px] flex-col" style={{ background: "linear-gradient(180deg,#1B262C,#0d1b22)" }}>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-10 w-10 items-center justify-center border border-slate-200 lg:hidden" style={{ borderRadius: "10px" }} onClick={() => setSidebarOpen(true)}>
                <Menu size={18} />
              </button>
              <div>
                <p className="text-lg font-semibold text-slate-900">{currentSectionTitle}</p>
                <p className="text-xs text-slate-500">Admin · Full System Access</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tableTabs.includes(activeTab) ? (
                <label className="hidden items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 md:flex" style={{ borderRadius: "12px" }}>
                  <Search size={15} color="#64748b" />
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search records" className="w-[220px] bg-transparent text-sm outline-none" />
                </label>
              ) : null}
              <button type="button" className="relative flex h-10 w-10 items-center justify-center border border-slate-200" style={{ borderRadius: "10px" }}>
                <Bell size={17} />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-red-500 px-1 text-[10px] text-white" style={{ borderRadius: "999px" }}>5</span>
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 md:px-6">{content}</main>
      </div>

      <AnimatePresence>
        {modal.open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="w-full max-w-[500px] overflow-hidden border border-slate-200 bg-white" style={{ borderRadius: "14px" }}>
              <div className="flex items-start justify-between bg-gradient-to-r from-[#1B262C] to-[#0d1b22] p-4 text-white">
                <div>
                  <h3 className="text-lg font-semibold">{modal.mode === "add" ? "Add" : "Edit"} {modal.section}</h3>
                  <p className="text-xs text-slate-300">Fill in the details below</p>
                </div>
                <button type="button" className="flex h-8 w-8 items-center justify-center border border-white/30" style={{ borderRadius: "999px" }} onClick={closeModal}>
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3 p-4">
                {formFields[modal.section].map((fieldLabel) => {
                  const key = fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                  const isDepartment = fieldLabel === "Department";
                  return (
                    <div key={`${modal.section}-${key}`}>
                      <label className="mb-1 block text-xs text-slate-500">{fieldLabel}</label>
                      {isDepartment ? (
                        <select value={modalForm[key] ?? ""} onChange={(event) => setModalForm((prev) => ({ ...prev, [key]: event.target.value }))} className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" style={{ borderRadius: "10px" }}>
                          <option value="">Select department</option>
                          {departments.map((dept) => <option key={dept.id} value={dept.code}>{dept.code}</option>)}
                        </select>
                      ) : (
                        <input
                          value={modalForm[key] ?? ""}
                          onChange={(event) => setModalForm((prev) => ({ ...prev, [key]: event.target.value }))}
                          className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                          style={{ borderRadius: "10px" }}
                          onFocus={(event) => { event.currentTarget.style.borderColor = "#0f4c81"; }}
                          onBlur={(event) => { event.currentTarget.style.borderColor = "#e5e7eb"; }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
                <button type="button" className="border border-slate-200 px-4 py-2 text-sm" style={{ borderRadius: "10px" }} onClick={closeModal}>Cancel</button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-white"
                  style={{ borderRadius: "10px", background: "linear-gradient(120deg,#1B262C,#0d1b22)", boxShadow: "0 4px 20px rgba(15,76,129,0.3)" }}
                  onClick={closeModal}
                >
                  {modal.mode === "add" ? "Add Record" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default AdminPanel;
