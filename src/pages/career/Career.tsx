import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiEye,
  FiDownload,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMapPin,
  FiClock,
  FiMoreHorizontal,
  FiFileText,
  FiGrid,
} from "react-icons/fi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getJobOpenings,
  saveJobOpening,
  deleteJobOpening,
  toggleJobStatus,
  getJobApplications,
  updateApplicationStatus,
  deleteJobApplication,
} from "../../services/career.api";

import type {
  JobOpening,
  JobApplication,
  ApplicationStatus,
  JobType,
  JobLocation,
} from "../../types/career";

// ============================================================
// CONSTANTS
// ============================================================

const ROWS_PER_PAGE = 5;

// ============================================================
// JOB ACTION MENU
// ============================================================

interface JobActionMenuProps {
  job: JobOpening;
  onEdit: (job: JobOpening) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function JobActionMenu({
  job,
  onEdit,
  onDelete,
  onToggle,
}: JobActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7688] transition hover:bg-[#F3F5F7] hover:text-[#101E33]"
        aria-label="Open actions"
      >
        <FiMoreHorizontal size={19} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onEdit(job);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              <FiEdit2 size={16} />
              Edit Job
            </button>

            <button
              type="button"
              onClick={() => {
                onToggle(job.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              {job.enabled ? (
                <>
                  <FiXCircle size={16} />
                  Disable
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} />
                  Enable
                </>
              )}
            </button>

            <div className="my-1 border-t border-[#E7E9EC]" />

            <button
              type="button"
              onClick={() => {
                onDelete(job.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#C0272D] hover:bg-[#FFF5F5]"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// APPLICATION ACTION MENU
// ============================================================

interface ApplicationActionMenuProps {
  application: JobApplication;
  onView: (application: JobApplication) => void;
  onDelete: (id: string) => void;
}

function ApplicationActionMenu({
  application,
  onView,
  onDelete,
}: ApplicationActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7688] transition hover:bg-[#F3F5F7] hover:text-[#101E33]"
        aria-label="Open actions"
      >
        <FiMoreHorizontal size={19} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onView(application);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              <FiEye size={16} />
              View Application
            </button>

            <div className="my-1 border-t border-[#E7E9EC]" />

            <button
              type="button"
              onClick={() => {
                onDelete(application.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#C0272D] hover:bg-[#FFF5F5]"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// STATUS BADGE HELPERS
// ============================================================

function applicationStatusClasses(status: ApplicationStatus) {
  switch (status) {
    case "Pending":
      return "bg-[#FFF6E5] text-[#B76A00]";
    case "Reviewed":
      return "bg-[#EEF3FA] text-[#1B3A6B]";
    case "Shortlisted":
      return "bg-[#EAF7EE] text-[#267044]";
    case "Rejected":
      return "bg-[#FFF0F0] text-[#C0272D]";
    default:
      return "bg-[#F2F3F5] text-[#6B7688]";
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CareerManager() {
  const [activeTab, setActiveTab] = useState<
    "jobs" | "applications"
  >("jobs");

  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<
    JobApplication[]
  >([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedJobIds, setSelectedJobIds] = useState<
    string[]
  >([]);

  const [selectedAppIds, setSelectedAppIds] = useState<
    string[]
  >([]);

  // Export
  const [exportOpen, setExportOpen] = useState(false);

  // Delete modals
  const [deleteJobId, setDeleteJobId] = useState<
    string | null
  >(null);

  const [deleteAppId, setDeleteAppId] = useState<
    string | null
  >(null);

  // Job create/edit modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] =
    useState<JobOpening | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    locationType: "On-site" as JobLocation,
    locationName: "Kalyan, Maharashtra",
    type: "Full-time" as JobType,
    experienceLevel: "",
    description: "",
    requirements: "",
    responsibilities: "",
    enabled: true,
  });

  // Application detail modal
  const [selectedApp, setSelectedApp] =
    useState<JobApplication | null>(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const refreshData = () => {
    setJobs(getJobOpenings());
    setApplications(getJobApplications());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ==========================================================
  // RESET ON TAB / FILTER CHANGE
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, activeTab]);

  function switchTab(tab: "jobs" | "applications") {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("all");
  }

  // ==========================================================
  // FILTERED DATA
  // ==========================================================

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && job.enabled) ||
        (statusFilter === "disabled" && !job.enabled);

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesSearch =
        !query ||
        app.applicantName.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const activeOpenings = jobs.filter(
    (job) => job.enabled
  ).length;

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (app) => app.status === "Pending"
  ).length;

  const shortlistedApplications = applications.filter(
    (app) => app.status === "Shortlisted"
  ).length;

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const activeDatasetLength =
    activeTab === "jobs"
      ? filteredJobs.length
      : filteredApplications.length;

  const totalPages = Math.max(
    1,
    Math.ceil(activeDatasetLength / ROWS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;

  const paginatedJobs = filteredJobs.slice(
    startIndex,
    endIndex
  );

  const paginatedApplications = filteredApplications.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================================================
  // SELECTION HELPERS
  // ==========================================================

  const isAllJobsSelected =
    paginatedJobs.length > 0 &&
    paginatedJobs.every((job) =>
      selectedJobIds.includes(job.id)
    );

  const toggleJobSelection = (id: string) => {
    setSelectedJobIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllJobs = () => {
    if (isAllJobsSelected) {
      setSelectedJobIds((previous) =>
        previous.filter(
          (id) =>
            !paginatedJobs.some((job) => job.id === id)
        )
      );
      return;
    }

    const visibleIds = paginatedJobs.map((job) => job.id);

    setSelectedJobIds((previous) =>
      Array.from(new Set([...previous, ...visibleIds]))
    );
  };

  const isAllAppsSelected =
    paginatedApplications.length > 0 &&
    paginatedApplications.every((app) =>
      selectedAppIds.includes(app.id)
    );

  const toggleAppSelection = (id: string) => {
    setSelectedAppIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllApps = () => {
    if (isAllAppsSelected) {
      setSelectedAppIds((previous) =>
        previous.filter(
          (id) =>
            !paginatedApplications.some(
              (app) => app.id === id
            )
        )
      );
      return;
    }

    const visibleIds = paginatedApplications.map(
      (app) => app.id
    );

    setSelectedAppIds((previous) =>
      Array.from(new Set([...previous, ...visibleIds]))
    );
  };

  // ==========================================================
  // JOB CRUD
  // ==========================================================

  function openJobModal(job?: JobOpening) {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        locationType: job.locationType,
        locationName: job.locationName,
        type: job.type,
        experienceLevel: job.experienceLevel,
        description: job.description,
        requirements: job.requirements.join("\n"),
        responsibilities: job.responsibilities.join("\n"),
        enabled: job.enabled,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        department: "Operations",
        locationType: "On-site",
        locationName: "Kalyan, Maharashtra",
        type: "Full-time",
        experienceLevel: "1-3 Years",
        description: "",
        requirements: "",
        responsibilities: "",
        enabled: true,
      });
    }

    setIsJobModalOpen(true);
  }

  function handleSaveJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveJobOpening({
      ...(editingJob?.id ? { id: editingJob.id } : {}),
      title: formData.title,
      department: formData.department,
      locationType: formData.locationType,
      locationName: formData.locationName,
      type: formData.type,
      experienceLevel: formData.experienceLevel,
      description: formData.description,
      requirements: formData.requirements
        .split("\n")
        .filter((r) => r.trim().length > 0),
      responsibilities: formData.responsibilities
        .split("\n")
        .filter((r) => r.trim().length > 0),
      enabled: formData.enabled,
    });

    setIsJobModalOpen(false);
    refreshData();
  }

  function handleDeleteJob() {
    if (!deleteJobId) return;

    deleteJobOpening(deleteJobId);

    setSelectedJobIds((previous) =>
      previous.filter((id) => id !== deleteJobId)
    );

    setDeleteJobId(null);
    refreshData();
  }

  function handleToggleJob(id: string) {
    toggleJobStatus(id);
    refreshData();
  }

  function handleBulkEnableJobs() {
    selectedJobIds.forEach((id) => {
      const job = jobs.find((item) => item.id === id);
      if (job && !job.enabled) {
        toggleJobStatus(id);
      }
    });

    setSelectedJobIds([]);
    refreshData();
  }

  function handleBulkDisableJobs() {
    selectedJobIds.forEach((id) => {
      const job = jobs.find((item) => item.id === id);
      if (job && job.enabled) {
        toggleJobStatus(id);
      }
    });

    setSelectedJobIds([]);
    refreshData();
  }

  // ==========================================================
  // APPLICATION ACTIONS
  // ==========================================================

  function handleUpdateAppStatus(
    appId: string,
    status: ApplicationStatus
  ) {
    updateApplicationStatus(appId, status);

    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status });
    }

    refreshData();
  }

  function handleDeleteApplication() {
    if (!deleteAppId) return;

    deleteJobApplication(deleteAppId);

    setSelectedAppIds((previous) =>
      previous.filter((id) => id !== deleteAppId)
    );

    if (selectedApp?.id === deleteAppId) {
      setSelectedApp(null);
    }

    setDeleteAppId(null);
    refreshData();
  }

  // ==========================================================
  // EXPORT
  // ==========================================================

  function getJobsExportData() {
    return selectedJobIds.length > 0
      ? jobs.filter((job) => selectedJobIds.includes(job.id))
      : filteredJobs;
  }

  function getApplicationsExportData() {
    return selectedAppIds.length > 0
      ? applications.filter((app) =>
          selectedAppIds.includes(app.id)
        )
      : filteredApplications;
  }

  function exportCSV() {
    if (activeTab === "jobs") {
      const data = getJobsExportData();
      if (data.length === 0) return;

      const headers = [
        "Title",
        "Department",
        "Type",
        "Location Type",
        "Location",
        "Experience Level",
        "Status",
      ];

      const rows = data.map((job) => [
        job.title,
        job.department,
        job.type,
        job.locationType,
        job.locationName,
        job.experienceLevel,
        job.enabled ? "Active" : "Disabled",
      ]);

      downloadCSV(
        "sunraj-job-openings.csv",
        headers,
        rows
      );
    } else {
      const data = getApplicationsExportData();
      if (data.length === 0) return;

      const headers = [
        "Applicant",
        "Email",
        "Phone",
        "Position",
        "Experience (Years)",
        "Status",
        "Applied On",
      ];

      const rows = data.map((app) => [
        app.applicantName,
        app.email,
        app.phone,
        app.jobTitle,
        app.experienceYears,
        app.status,
        new Date(app.appliedAt).toLocaleDateString("en-IN"),
      ]);

      downloadCSV(
        "sunraj-job-applications.csv",
        headers,
        rows
      );
    }

    setExportOpen(false);
  }

  function downloadCSV(
    filename: string,
    headers: string[],
    rows: (string | number)[][]
  ) {
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (activeTab === "jobs") {
      const data = getJobsExportData();
      if (data.length === 0) return;

      const rows = data.map((job) => ({
        Title: job.title,
        Department: job.department,
        Type: job.type,
        "Location Type": job.locationType,
        Location: job.locationName,
        "Experience Level": job.experienceLevel,
        Status: job.enabled ? "Active" : "Disabled",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Job Openings"
      );

      XLSX.writeFile(workbook, "sunraj-job-openings.xlsx");
    } else {
      const data = getApplicationsExportData();
      if (data.length === 0) return;

      const rows = data.map((app) => ({
        Applicant: app.applicantName,
        Email: app.email,
        Phone: app.phone,
        Position: app.jobTitle,
        "Experience (Years)": app.experienceYears,
        Status: app.status,
        "Applied On": new Date(
          app.appliedAt
        ).toLocaleDateString("en-IN"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Applications"
      );

      XLSX.writeFile(
        workbook,
        "sunraj-job-applications.xlsx"
      );
    }

    setExportOpen(false);
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "landscape" });

    if (activeTab === "jobs") {
      const data = getJobsExportData();
      if (data.length === 0) return;

      doc.setFontSize(16);
      doc.text("Sunraj Job Openings", 14, 15);

      doc.setFontSize(9);
      doc.text(`Total Records: ${data.length}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [
          [
            "Title",
            "Department",
            "Type",
            "Location",
            "Experience",
            "Status",
          ],
        ],
        body: data.map((job) => [
          job.title,
          job.department,
          job.type,
          `${job.locationName} (${job.locationType})`,
          job.experienceLevel,
          job.enabled ? "Active" : "Disabled",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fontSize: 8, fontStyle: "bold" },
      });

      doc.save("sunraj-job-openings.pdf");
    } else {
      const data = getApplicationsExportData();
      if (data.length === 0) return;

      doc.setFontSize(16);
      doc.text("Sunraj Job Applications", 14, 15);

      doc.setFontSize(9);
      doc.text(`Total Records: ${data.length}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [
          [
            "Applicant",
            "Position",
            "Experience",
            "Status",
            "Applied On",
          ],
        ],
        body: data.map((app) => [
          app.applicantName,
          app.jobTitle,
          `${app.experienceYears} yrs`,
          app.status,
          new Date(app.appliedAt).toLocaleDateString(
            "en-IN"
          ),
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fontSize: 8, fontStyle: "bold" },
      });

      doc.save("sunraj-job-applications.pdf");
    }

    setExportOpen(false);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  const selectedCount =
    activeTab === "jobs"
      ? selectedJobIds.length
      : selectedAppIds.length;

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiBriefcase size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#101E33]">
              Careers & Recruitment
            </h1>

            <p className="mt-1 text-sm text-[#6B7688]">
              Manage job openings and incoming candidate
              applications.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => openJobModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153056]"
        >
          <FiPlus size={18} />
          Post New Job
        </button>

      </div>

      {/* ======================================================
          STATISTICS CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7688]">
                Active Openings
              </p>
              <p className="mt-2 text-4xl font-bold text-[#101E33]">
                {activeOpenings}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
              <FiBriefcase size={20} />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#8994A5]">
            {jobs.length} total postings
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7688]">
                Total Applications
              </p>
              <p className="mt-2 text-4xl font-bold text-[#101E33]">
                {totalApplications}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
              <FiUserCheck size={20} />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#8994A5]">
            All candidate submissions
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7688]">
                Pending Review
              </p>
              <p className="mt-2 text-4xl font-bold text-[#C0272D]">
                {pendingApplications}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#C0272D]">
              <FiClock size={20} />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#8994A5]">
            Awaiting first review
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7688]">
                Shortlisted
              </p>
              <p className="mt-2 text-4xl font-bold text-[#267044]">
                {shortlistedApplications}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
              <FiCheckCircle size={20} />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#8994A5]">
            Moving to next stage
          </p>
        </div>

      </div>

      {/* ======================================================
          TABS
      ======================================================= */}

      <div className="flex flex-wrap items-center gap-2">

        <button
          type="button"
          onClick={() => switchTab("jobs")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "jobs"
              ? "bg-[#1B3A6B] text-white"
              : "border border-[#E7E9EC] bg-white text-[#6B7688] hover:text-[#101E33]"
          }`}
        >
          Job Openings ({jobs.length})
        </button>

        <button
          type="button"
          onClick={() => switchTab("applications")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "applications"
              ? "bg-[#1B3A6B] text-white"
              : "border border-[#E7E9EC] bg-white text-[#6B7688] hover:text-[#101E33]"
          }`}
        >
          Candidate Applications ({applications.length})
        </button>

      </div>

      {/* ======================================================
          FILTER / SEARCH BAR
      ======================================================= */}

      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-4">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5]"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                activeTab === "jobs"
                  ? "Search job title or department..."
                  : "Search applicant, email, position..."
              }
              className="h-11 w-full rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] pl-10 pr-4 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] px-4 pr-10 text-sm text-[#101E33] outline-none focus:border-[#1B3A6B]"
            >
              <option value="all">All Status</option>

              {activeTab === "jobs" ? (
                <>
                  <option value="enabled">Active Only</option>
                  <option value="disabled">
                    Disabled Only
                  </option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">
                    Shortlisted
                  </option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
            </select>

            <FiChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7688]"
              size={16}
            />
          </div>

        </div>
      </div>

      {/* ======================================================
          BULK ACTION TOOLBAR
      ======================================================= */}

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#D8E1EF] bg-[#F4F7FB] p-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-sm font-medium text-[#1B3A6B]">
            {selectedCount}{" "}
            {selectedCount === 1 ? "item" : "items"} selected
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setExportOpen((previous) => !previous)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-[#D8DDE5] bg-white px-3 py-2 text-sm font-medium text-[#101E33] hover:bg-[#F8F9FA]"
              >
                <FiDownload size={16} />
                Export
                <FiChevronDown size={14} />
              </button>

              {exportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setExportOpen(false)}
                  />

                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-xl">
                    <button
                      type="button"
                      onClick={exportCSV}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
                    >
                      <FiFileText size={16} />
                      Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={exportExcel}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
                    >
                      <FiGrid size={16} />
                      Export Excel
                    </button>

                    <button
                      type="button"
                      onClick={exportPDF}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
                    >
                      <FiFileText size={16} />
                      Export PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            {activeTab === "jobs" && (
              <>
                <button
                  type="button"
                  onClick={handleBulkEnableJobs}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#CFE5D7] bg-white px-3 py-2 text-sm font-medium text-[#267044] hover:bg-[#F1FAF4]"
                >
                  <FiCheckCircle size={16} />
                  Enable
                </button>

                <button
                  type="button"
                  onClick={handleBulkDisableJobs}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#F0D1D3] bg-white px-3 py-2 text-sm font-medium text-[#C0272D] hover:bg-[#FFF5F5]"
                >
                  <FiXCircle size={16} />
                  Disable
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                activeTab === "jobs"
                  ? setSelectedJobIds([])
                  : setSelectedAppIds([])
              }
              className="px-3 py-2 text-sm font-medium text-[#6B7688] hover:text-[#101E33]"
            >
              Clear
            </button>

          </div>
        </div>
      )}

      {/* ======================================================
          JOBS TAB
      ======================================================= */}

      {activeTab === "jobs" && (
        <>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white md:block">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E7E9EC] bg-[#FBFBF9]">
                    <th className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isAllJobsSelected}
                        onChange={toggleAllJobs}
                        className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                      />
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Job
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Location & Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Experience
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center"
                      >
                        <FiBriefcase
                          className="mx-auto mb-3 text-[#B1B8C3]"
                          size={35}
                        />
                        <p className="font-medium text-[#101E33]">
                          No job openings found
                        </p>
                        <p className="mt-1 text-sm text-[#6B7688]">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-[#EEF0F2] last:border-b-0 hover:bg-[#FCFCFB]"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedJobIds.includes(
                              job.id
                            )}
                            onChange={() =>
                              toggleJobSelection(job.id)
                            }
                            className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#536071]">
                            {job.department}
                          </span>
                          <p className="mt-1.5 font-semibold text-[#101E33]">
                            {job.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#8A94A4]">
                            Posted{" "}
                            {new Date(
                              job.createdAt
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-[#536071]">
                            <FiMapPin size={13} />
                            {job.locationName} (
                            {job.locationType})
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8A94A4]">
                            <FiClock size={12} />
                            {job.type}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#536071]">
                          {job.experienceLevel}
                        </td>

                        <td className="px-5 py-4">
                          {job.enabled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7EE] px-3 py-1.5 text-xs font-semibold text-[#267044]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#267044]" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F3F5] px-3 py-1.5 text-xs font-semibold text-[#6B7688]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#8A94A4]" />
                              Disabled
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <JobActionMenu
                            job={job}
                            onEdit={openJobModal}
                            onDelete={setDeleteJobId}
                            onToggle={handleToggleJob}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredJobs.length > ROWS_PER_PAGE && (
              <PaginationBar
                startIndex={startIndex}
                endIndex={endIndex}
                totalLength={filteredJobs.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {paginatedJobs.length === 0 ? (
              <EmptyState
                icon={<FiBriefcase size={35} />}
                title="No job openings found"
              />
            ) : (
              paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-[#E7E9EC] bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.includes(job.id)}
                      onChange={() =>
                        toggleJobSelection(job.id)
                      }
                      className="mt-1 h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex rounded-lg bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-medium text-[#536071]">
                            {job.department}
                          </span>
                          <h3 className="mt-1.5 font-semibold text-[#101E33]">
                            {job.title}
                          </h3>
                        </div>

                        <JobActionMenu
                          job={job}
                          onEdit={openJobModal}
                          onDelete={setDeleteJobId}
                          onToggle={handleToggleJob}
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B7688]">
                        <FiMapPin size={12} />
                        {job.locationName} ({job.locationType})
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {job.enabled ? (
                          <span className="rounded-full bg-[#EAF7EE] px-2.5 py-1 text-xs font-semibold text-[#267044]">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F2F3F5] px-2.5 py-1 text-xs font-semibold text-[#6B7688]">
                            Disabled
                          </span>
                        )}

                        <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#536071]">
                          {job.experienceLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredJobs.length > ROWS_PER_PAGE && (
              <MobilePaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

        </>
      )}

      {/* ======================================================
          APPLICATIONS TAB
      ======================================================= */}

      {activeTab === "applications" && (
        <>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white md:block">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#E7E9EC] bg-[#FBFBF9]">
                    <th className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isAllAppsSelected}
                        onChange={toggleAllApps}
                        className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                      />
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Applicant
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Position
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Experience
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Applied On
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedApplications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-16 text-center"
                      >
                        <FiUserCheck
                          className="mx-auto mb-3 text-[#B1B8C3]"
                          size={35}
                        />
                        <p className="font-medium text-[#101E33]">
                          No applications found
                        </p>
                        <p className="mt-1 text-sm text-[#6B7688]">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-[#EEF0F2] last:border-b-0 hover:bg-[#FCFCFB]"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAppIds.includes(
                              app.id
                            )}
                            onChange={() =>
                              toggleAppSelection(app.id)
                            }
                            className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3FA] text-xs font-bold text-[#1B3A6B]">
                              {app.applicantName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#101E33]">
                                {app.applicantName}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#8A94A4]">
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-[#101E33]">
                          {app.jobTitle}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#536071]">
                          {app.experienceYears} yrs
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={app.status}
                            onChange={(event) =>
                              handleUpdateAppStatus(
                                app.id,
                                event.target
                                  .value as ApplicationStatus
                              )
                            }
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none ${applicationStatusClasses(
                              app.status
                            )}`}
                          >
                            <option value="Pending">
                              Pending
                            </option>
                            <option value="Reviewed">
                              Reviewed
                            </option>
                            <option value="Shortlisted">
                              Shortlisted
                            </option>
                            <option value="Rejected">
                              Rejected
                            </option>
                          </select>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#536071]">
                          {new Date(
                            app.appliedAt
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <ApplicationActionMenu
                            application={app}
                            onView={setSelectedApp}
                            onDelete={setDeleteAppId}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredApplications.length > ROWS_PER_PAGE && (
              <PaginationBar
                startIndex={startIndex}
                endIndex={endIndex}
                totalLength={filteredApplications.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {paginatedApplications.length === 0 ? (
              <EmptyState
                icon={<FiUserCheck size={35} />}
                title="No applications found"
              />
            ) : (
              paginatedApplications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-[#E7E9EC] bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAppIds.includes(app.id)}
                      onChange={() =>
                        toggleAppSelection(app.id)
                      }
                      className="mt-1 h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF3FA] text-sm font-bold text-[#1B3A6B]">
                      {app.applicantName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-[#101E33]">
                            {app.applicantName}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#8A94A4]">
                            {app.jobTitle}
                          </p>
                        </div>

                        <ApplicationActionMenu
                          application={app}
                          onView={setSelectedApp}
                          onDelete={setDeleteAppId}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationStatusClasses(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>

                        <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#536071]">
                          {app.experienceYears} yrs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredApplications.length > ROWS_PER_PAGE && (
              <MobilePaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

        </>
      )}

      {/* ======================================================
          JOB CREATE / EDIT MODAL
      ======================================================= */}

      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-4">
              <h3 className="text-lg font-semibold text-[#101E33]">
                {editingJob
                  ? "Edit Job Position"
                  : "Create New Job Opening"}
              </h3>

              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="text-[#6B7688] hover:text-[#101E33]"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveJob}
              className="mt-5 space-y-5"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                    Job Title
                    <span className="text-[#C0272D]">{" "}*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Production Manager"
                    className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                    Department
                    <span className="text-[#C0272D]">{" "}*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value,
                      })
                    }
                    placeholder="e.g. Operations / Quality"
                    className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                    Job Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as JobType,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">
                      Internship
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                    Work Location Type
                  </label>
                  <select
                    value={formData.locationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationType: e.target
                          .value as JobLocation,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                    Experience Level
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceLevel: e.target.value,
                      })
                    }
                    placeholder="e.g. 2-4 Years"
                    className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationName: e.target.value,
                    })
                  }
                  placeholder="e.g. Kalyan, Maharashtra"
                  className="w-full rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                  Description
                  <span className="text-[#C0272D]">{" "}*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Overview of the role..."
                  className="w-full resize-none rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                  Key Requirements (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: e.target.value,
                    })
                  }
                  placeholder={
                    "Degree in Packaging Engineering\n5+ years experience"
                  }
                  className="w-full resize-none rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#101E33]">
                  Key Responsibilities (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsibilities: e.target.value,
                    })
                  }
                  placeholder={
                    "Manage floor shift operators\nEnsure safety compliance"
                  }
                  className="w-full resize-none rounded-xl border border-[#E7E9EC] px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B]"
                />
              </div>

              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                />
                <span className="text-sm font-semibold text-[#101E33]">
                  Active & visible on the live career page
                </span>
              </label>

              <div className="flex justify-end gap-3 border-t border-[#E7E9EC] pt-5">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="rounded-xl border border-[#E7E9EC] bg-white px-5 py-2.5 text-sm font-semibold text-[#101E33] hover:bg-[#F6F7F9]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1B3A6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#142d54]"
                >
                  Save Job Position
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================
          APPLICATION DETAIL MODAL
      ======================================================= */}

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Candidate Application
                </p>
                <h3 className="text-lg font-semibold text-[#101E33]">
                  {selectedApp.applicantName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-[#6B7688] hover:text-[#101E33]"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#FBFBF9] p-4">
                <div>
                  <p className="text-xs text-[#8994A5]">
                    Applied For
                  </p>
                  <p className="mt-0.5 font-semibold text-[#101E33]">
                    {selectedApp.jobTitle}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8994A5]">
                    Total Experience
                  </p>
                  <p className="mt-0.5 font-semibold text-[#101E33]">
                    {selectedApp.experienceYears} Years
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8994A5]">
                    Email
                  </p>
                  <p className="mt-0.5 font-semibold text-[#101E33]">
                    {selectedApp.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8994A5]">
                    Phone
                  </p>
                  <p className="mt-0.5 font-semibold text-[#101E33]">
                    {selectedApp.phone}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Application Status
                </label>
                <select
                  value={selectedApp.status}
                  onChange={(e) =>
                    handleUpdateAppStatus(
                      selectedApp.id,
                      e.target.value as ApplicationStatus
                    )
                  }
                  className={`w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none ${applicationStatusClasses(
                    selectedApp.status
                  )}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">
                    Shortlisted
                  </option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <p className="font-semibold text-[#101E33]">
                    Cover Letter / Statement
                  </p>
                  <p className="mt-1.5 rounded-xl border border-[#E7E9EC] p-3 text-sm leading-6 text-[#6B7688]">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#E7E9EC] pt-4">
                <a
                  href={selectedApp.resumeUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#1B3A6B] px-3.5 py-2 text-sm font-semibold text-[#1B3A6B] hover:bg-[#EEF3FA]"
                >
                  <FiDownload size={14} />
                  Download Resume
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142d54]"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          DELETE JOB MODAL
      ======================================================= */}

      {deleteJobId && (
        <DeleteConfirmModal
          title="Delete job opening?"
          description="This action cannot be undone. The selected job opening will be permanently removed."
          onCancel={() => setDeleteJobId(null)}
          onConfirm={handleDeleteJob}
        />
      )}

      {/* ======================================================
          DELETE APPLICATION MODAL
      ======================================================= */}

      {deleteAppId && (
        <DeleteConfirmModal
          title="Delete this application?"
          description="This action cannot be undone. The candidate's application will be permanently removed."
          onCancel={() => setDeleteAppId(null)}
          onConfirm={handleDeleteApplication}
        />
      )}

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E9EC] bg-white px-5 py-12 text-center">
      <div className="mx-auto mb-3 text-[#B1B8C3]">{icon}</div>
      <p className="font-medium text-[#101E33]">{title}</p>
      <p className="mt-1 text-sm text-[#6B7688]">
        Try changing your search or filters.
      </p>
    </div>
  );
}

// ============================================================
// DELETE CONFIRM MODAL
// ============================================================

function DeleteConfirmModal({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#C0272D]">
          <FiTrash2 size={21} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[#101E33]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7688]">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#E1E4E8] px-4 py-2.5 text-sm font-medium text-[#536071] hover:bg-[#F7F8FA]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#C0272D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A91F24]"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// PAGINATION BAR (DESKTOP)
// ============================================================

function PaginationBar({
  startIndex,
  endIndex,
  totalLength,
  currentPage,
  totalPages,
  onPageChange,
}: {
  startIndex: number;
  endIndex: number;
  totalLength: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[#E7E9EC] px-5 py-4">
      <p className="text-xs text-[#6B7688]">
        Showing{" "}
        <span className="font-semibold text-[#101E33]">
          {startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-[#101E33]">
          {Math.min(endIndex, totalLength)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#101E33]">
          {totalLength}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(Math.max(1, currentPage - 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={16} />
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
              currentPage === page
                ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                : "border-[#E1E4E8] bg-white text-[#536071] hover:bg-[#F7F8FA]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(Math.min(totalPages, currentPage + 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAGINATION BAR (MOBILE)
// ============================================================

function MobilePaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E7E9EC] bg-white p-4">
      <p className="text-xs text-[#6B7688]">
        Page{" "}
        <span className="font-semibold text-[#101E33]">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#101E33]">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(Math.max(1, currentPage - 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] disabled:opacity-40"
        >
          <FiChevronLeft size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(Math.min(totalPages, currentPage + 1))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] disabled:opacity-40"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}