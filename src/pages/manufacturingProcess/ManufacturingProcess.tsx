import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiPlus,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiChevronDown,
  FiExternalLink,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { ManufacturingProcessItem } from "../../types/manufacturingProcess";

import {
  getManufacturingProcesses,
  deleteManufacturingProcess,
  toggleManufacturingProcess,
  enableManufacturingProcesses,
  disableManufacturingProcesses,
} from "../../services/manufacturingProcess.api";

// ============================================================
// CONSTANTS
// ============================================================

const ROWS_PER_PAGE = 5;

// ============================================================
// ACTION MENU
// ============================================================

interface ProcessActionMenuProps {
  process: ManufacturingProcessItem;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function ProcessActionMenu({
  process,
  onDelete,
  onToggle,
}: ProcessActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="
          flex h-9 w-9 items-center justify-center
          rounded-lg text-[#6B7688]
          transition hover:bg-[#F3F5F7]
          hover:text-[#101E33]
        "
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

          <div
            className="
              absolute right-0 z-20 mt-2
              w-52 overflow-hidden
              rounded-xl border border-[#E7E9EC]
              bg-white py-1 shadow-xl
            "
          >
            {/* Edit */}

            <Link
              to={`/admin/manufacturing-process/${process.id}/edit`}
              onClick={() => setOpen(false)}
              className="
                flex items-center gap-3
                px-4 py-2.5 text-sm
                text-[#101E33]
                hover:bg-[#F7F8FA]
              "
            >
              <FiEdit2 size={16} />
              Edit Process
            </Link>

            {/* View */}

            <Link
              to={`/admin/manufacturing-process/${process.id}/view`}
              onClick={() => setOpen(false)}
              className="
                flex items-center gap-3
                px-4 py-2.5 text-sm
                text-[#101E33]
                hover:bg-[#F7F8FA]
              "
            >
              <FiExternalLink size={16} />
              View Process
            </Link>

            {/* Enable / Disable */}

            <button
              type="button"
              onClick={() => {
                onToggle(process.id);
                setOpen(false);
              }}
              className="
                flex w-full items-center gap-3
                px-4 py-2.5 text-left text-sm
                text-[#101E33]
                hover:bg-[#F7F8FA]
              "
            >
              {process.enabled ? (
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

            {/* Delete */}

            <button
              type="button"
              onClick={() => {
                onDelete(process.id);
                setOpen(false);
              }}
              className="
                flex w-full items-center gap-3
                px-4 py-2.5 text-left text-sm
                text-[#C0272D]
                hover:bg-[#FFF5F5]
              "
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
// MAIN COMPONENT
// ============================================================

export default function ManufacturingProcess() {
  const [processes, setProcesses] = useState<
    ManufacturingProcessItem[]
  >([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [exportOpen, setExportOpen] = useState(false);

  // ----------------------------------------------------------
  // FILTER STATE
  // ----------------------------------------------------------

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "enabled" | "disabled"
  >("all");

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================================
  // LOAD PROCESSES
  // ==========================================================

  const loadProcesses = () => {
    setProcesses(getManufacturingProcesses());
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  // ==========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  // ==========================================================
  // FILTER PROCESSES
  // ==========================================================

  const filteredProcesses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return processes
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.shortDescription
            .toLowerCase()
            .includes(normalizedSearch) ||
          String(item.stepNumber).includes(normalizedSearch);

        const matchesStatus =
          status === "all" ||
          (status === "enabled" && item.enabled) ||
          (status === "disabled" && !item.enabled);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [processes, search, status]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalProcesses = processes.length;

  const enabledProcesses = processes.filter(
    (item) => item.enabled
  ).length;

  const disabledProcesses = processes.filter(
    (item) => !item.enabled
  ).length;

  // ==========================================================
  // PAGINATION CALCULATIONS
  // ==========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProcesses.length / ROWS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;

  const paginatedProcesses = filteredProcesses.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================================================
  // SELECT / DESELECT
  // ==========================================================

  const isAllSelected =
    paginatedProcesses.length > 0 &&
    paginatedProcesses.every((item) =>
      selectedIds.includes(item.id)
    );

  const toggleSelection = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !paginatedProcesses.some((item) => item.id === id)
        )
      );

      return;
    }

    const visibleIds = paginatedProcesses.map((item) => item.id);

    setSelectedIds((previous) =>
      Array.from(new Set([...previous, ...visibleIds]))
    );
  };

  // ==========================================================
  // TOGGLE ONE PROCESS
  // ==========================================================

  const handleToggle = (id: string) => {
    toggleManufacturingProcess(id);
    loadProcesses();
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = () => {
    if (!deleteId) return;

    deleteManufacturingProcess(deleteId);

    setDeleteId(null);

    setSelectedIds((previous) =>
      previous.filter((id) => id !== deleteId)
    );

    loadProcesses();
  };

  // ==========================================================
  // BULK ENABLE / DISABLE
  // ==========================================================

  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;

    enableManufacturingProcesses(selectedIds);

    setSelectedIds([]);
    loadProcesses();
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;

    disableManufacturingProcesses(selectedIds);

    setSelectedIds([]);
    loadProcesses();
  };

  // ==========================================================
  // EXPORT DATA
  // ==========================================================

  const getExportData = () => {
    return selectedIds.length > 0
      ? processes.filter((item) => selectedIds.includes(item.id))
      : filteredProcesses;
  };

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const exportCSV = () => {
    const data = getExportData();

    if (data.length === 0) return;

    const headers = [
      "Step",
      "Title",
      "Description",
      "Display Order",
      "Status",
      "Slug",
    ];

    const rows = data.map((item) => [
      item.stepNumber,
      item.title,
      item.shortDescription,
      item.displayOrder,
      item.enabled ? "Enabled" : "Disabled",
      item.slug,
    ]);

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
    link.download = "sunraj-manufacturing-process.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setExportOpen(false);
  };

  // ==========================================================
  // EXCEL EXPORT
  // ==========================================================

  const exportExcel = () => {
    const data = getExportData();

    if (data.length === 0) return;

    const rows = data.map((item) => ({
      Step: item.stepNumber,
      Title: item.title,
      Description: item.shortDescription,
      "Display Order": item.displayOrder,
      Status: item.enabled ? "Enabled" : "Disabled",
      Slug: item.slug,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Manufacturing Process"
    );

    XLSX.writeFile(
      workbook,
      "sunraj-manufacturing-process.xlsx"
    );

    setExportOpen(false);
  };

  // ==========================================================
  // PDF EXPORT
  // ==========================================================

  const exportPDF = () => {
    const data = getExportData();

    if (data.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Sunraj Manufacturing Process", 14, 15);

    doc.setFontSize(9);
    doc.text(`Total Records: ${data.length}`, 14, 22);

    autoTable(doc, {
      startY: 28,

      head: [["Step", "Title", "Description", "Order", "Status"]],

      body: data.map((item) => [
        String(item.stepNumber),
        item.title,
        item.shortDescription,
        String(item.displayOrder),
        item.enabled ? "Enabled" : "Disabled",
      ]),

      styles: {
        fontSize: 8,
        cellPadding: 3,
      },

      headStyles: {
        fontSize: 8,
        fontStyle: "bold",
      },
    });

    doc.save("sunraj-manufacturing-process.pdf");

    setExportOpen(false);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
              <FiFileText size={21} />
            </div>

            <div>
              <h1 className="mt-1.5 font-sora text-2xl font-semibold tracking-[-0.03em] text-[#101E33] sm:text-3xl">
                Manufacturing Process
              </h1>

              <p className="mt-1 text-sm text-[#6B7688]">
                Manage manufacturing process steps shown on the website.
              </p>
            </div>

          </div>
        </div>

        <Link
          to="/admin/manufacturing-process/new"
          className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl bg-[#1B3A6B]
            px-5 py-3 text-sm
            font-semibold text-white
            transition hover:bg-[#153056]
          "
        >
          <FiPlus size={18} />
          Add Process Step
        </Link>

      </div>

      {/* ======================================================
          STATISTICS CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xl font-bold text-[#101E33]">
                Total Steps
              </p>

              <p className="mt-2 text-4xl font-bold text-[#101E33]">
                {totalProcesses}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
              <FiFileText size={20} />
            </div>

          </div>

          <p className="mt-3 text-sm text-[#8994A5]">
            All process records
          </p>

        </div>

        {/* Enabled */}

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xl font-bold text-[#101E33]">
                Enabled
              </p>

              <p className="mt-2 text-4xl font-bold text-[#267044]">
                {enabledProcesses}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
              <FiCheckCircle size={20} />
            </div>

          </div>

          <p className="mt-3 text-sm text-[#8994A5]">
            Visible on website
          </p>

        </div>

        {/* Disabled */}

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xl font-bold text-[#101E33]">
                Disabled
              </p>

              <p className="mt-2 text-4xl font-bold text-[#C0272D]">
                {disabledProcesses}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#C0272D]">
              <FiXCircle size={20} />
            </div>

          </div>

          <p className="mt-3 text-sm text-[#8994A5]">
            Hidden from website
          </p>

        </div>

      </div>

      {/* ======================================================
          FILTER / SEARCH BAR
      ======================================================= */}

      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-4">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Search */}

          <div className="relative flex-1">

            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5]"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search process title or description..."
              className="
                h-11 w-full rounded-xl
                border border-[#E7E9EC]
                bg-[#FBFBF9]
                pl-10 pr-4 text-sm
                text-[#101E33]
                outline-none transition
                focus:border-[#1B3A6B]
              "
            />

          </div>

          {/* Status */}

          <div className="relative">

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "all"
                    | "enabled"
                    | "disabled"
                )
              }
              className="
                h-11 min-w-[160px]
                appearance-none rounded-xl
                border border-[#E7E9EC]
                bg-[#FBFBF9]
                px-4 pr-10 text-sm
                text-[#101E33]
                outline-none
                focus:border-[#1B3A6B]
              "
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
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

      {selectedIds.length > 0 && (
        <div className="
          flex flex-col gap-3
          rounded-2xl border
          border-[#D8E1EF]
          bg-[#F4F7FB]
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div className="text-sm font-medium text-[#1B3A6B]">
            {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "step" : "steps"} selected
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* Export Dropdown */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setExportOpen((previous) => !previous)
                }
                className="
                  inline-flex items-center
                  gap-2 rounded-lg
                  border border-[#D8DDE5]
                  bg-white px-3 py-2
                  text-sm font-medium
                  text-[#101E33]
                  hover:bg-[#F8F9FA]
                "
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

                  <div className="
                    absolute right-0
                    z-20 mt-2 w-44
                    overflow-hidden
                    rounded-xl border
                    border-[#E7E9EC]
                    bg-white py-1
                    shadow-xl
                  ">

                    <button
                      type="button"
                      onClick={exportCSV}
                      className="
                        flex w-full
                        items-center gap-3
                        px-4 py-2.5
                        text-left text-sm
                        text-[#101E33]
                        hover:bg-[#F7F8FA]
                      "
                    >
                      <FiFileText size={16} />
                      Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={exportExcel}
                      className="
                        flex w-full
                        items-center gap-3
                        px-4 py-2.5
                        text-left text-sm
                        text-[#101E33]
                        hover:bg-[#F7F8FA]
                      "
                    >
                      <FiGrid size={16} />
                      Export Excel
                    </button>

                    <button
                      type="button"
                      onClick={exportPDF}
                      className="
                        flex w-full
                        items-center gap-3
                        px-4 py-2.5
                        text-left text-sm
                        text-[#101E33]
                        hover:bg-[#F7F8FA]
                      "
                    >
                      <FiFileText size={16} />
                      Export PDF
                    </button>

                  </div>
                </>
              )}

            </div>

            {/* Enable */}

            <button
              type="button"
              onClick={handleBulkEnable}
              className="
                inline-flex items-center
                gap-2 rounded-lg
                border border-[#CFE5D7]
                bg-white px-3 py-2
                text-sm font-medium
                text-[#267044]
                hover:bg-[#F1FAF4]
              "
            >
              <FiCheckCircle size={16} />
              Enable
            </button>

            {/* Disable */}

            <button
              type="button"
              onClick={handleBulkDisable}
              className="
                inline-flex items-center
                gap-2 rounded-lg
                border border-[#F0D1D3]
                bg-white px-3 py-2
                text-sm font-medium
                text-[#C0272D]
                hover:bg-[#FFF5F5]
              "
            >
              <FiXCircle size={16} />
              Disable
            </button>

            {/* Clear */}

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="
                px-3 py-2
                text-sm font-medium
                text-[#6B7688]
                hover:text-[#101E33]
              "
            >
              Clear
            </button>

          </div>
        </div>
      )}

      {/* ======================================================
          DESKTOP TABLE
      ======================================================= */}

      <div className="
        hidden overflow-hidden
        rounded-2xl border
        border-[#E7E9EC]
        bg-white md:block
      ">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>

              <tr className="
                border-b
                border-[#E7E9EC]
                bg-[#FBFBF9]
              ">

                <th className="w-12 px-5 py-4">

                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="
                      h-4 w-4 rounded
                      border-[#CBD1D9]
                      accent-[#1B3A6B]
                    "
                  />

                </th>

                <th className="
                  px-5 py-4 text-left
                  text-xs font-bold
                  uppercase tracking-wide
                  text-[#6B7688]
                ">
                  Process
                </th>

                <th className="
                  px-5 py-4 text-left
                  text-xs font-bold
                  uppercase tracking-wide
                  text-[#6B7688]
                ">
                  Description
                </th>

                <th className="
                  px-5 py-4 text-left
                  text-xs font-bold
                  uppercase tracking-wide
                  text-[#6B7688]
                ">
                  Order
                </th>

                <th className="
                  px-5 py-4 text-left
                  text-xs font-bold
                  uppercase tracking-wide
                  text-[#6B7688]
                ">
                  Status
                </th>

                <th className="
                  px-5 py-4 text-left
                  text-xs font-bold
                  uppercase tracking-wide
                  text-[#6B7688]
                ">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedProcesses.length === 0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-5 py-16
                      text-center
                    "
                  >

                    <FiFileText
                      className="
                        mx-auto mb-3
                        text-[#B1B8C3]
                      "
                      size={35}
                    />

                    <p className="
                      font-medium
                      text-[#101E33]
                    ">
                      No process steps found
                    </p>

                    <p className="
                      mt-1 text-sm
                      text-[#6B7688]
                    ">
                      Try changing your search or filters.
                    </p>

                  </td>

                </tr>
              ) : (
                paginatedProcesses.map((item) => (
                  <tr
                    key={item.id}
                    className="
                      border-b
                      border-[#EEF0F2]
                      last:border-b-0
                      hover:bg-[#FCFCFB]
                    "
                  >

                    {/* Checkbox */}

                    <td className="px-5 py-4">

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="
                          h-4 w-4 rounded
                          border-[#CBD1D9]
                          accent-[#1B3A6B]
                        "
                      />

                    </td>

                    {/* Process */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="
                          flex h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-xl
                          bg-[#EEF3FA]
                          text-sm font-bold
                          text-[#1B3A6B]
                        ">
                          {String(item.stepNumber).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">

                          <p className="
                            truncate
                            font-semibold
                            text-[#101E33]
                          ">
                            {item.title}
                          </p>

                          <p className="
                            mt-0.5 text-xs
                            text-[#8A94A4]
                          ">
                            /{item.slug}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Description */}

                    <td className="
                      max-w-[320px]
                      px-5 py-4
                    ">

                      <p className="
                        line-clamp-2
                        text-sm
                        text-[#536071]
                      ">
                        {item.shortDescription}
                      </p>

                    </td>

                    {/* Order */}

                    <td className="px-5 py-4 text-sm font-medium text-[#101E33]">
                      {item.displayOrder}
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">

                      {item.enabled ? (
                        <span className="
                          inline-flex
                          items-center gap-1.5
                          rounded-full
                          bg-[#EAF7EE]
                          px-3 py-1.5
                          text-xs font-semibold
                          text-[#267044]
                        ">
                          <span className="
                            h-1.5 w-1.5
                            rounded-full
                            bg-[#267044]
                          " />
                          Enabled
                        </span>
                      ) : (
                        <span className="
                          inline-flex
                          items-center gap-1.5
                          rounded-full
                          bg-[#F2F3F5]
                          px-3 py-1.5
                          text-xs font-semibold
                          text-[#6B7688]
                        ">
                          <span className="
                            h-1.5 w-1.5
                            rounded-full
                            bg-[#8A94A4]
                          " />
                          Disabled
                        </span>
                      )}

                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">

                      <ProcessActionMenu
                        process={item}
                        onDelete={setDeleteId}
                        onToggle={handleToggle}
                      />

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            PAGINATION
        =================================================== */}

        {filteredProcesses.length > ROWS_PER_PAGE && (
          <div className="
            flex items-center
            justify-between
            border-t
            border-[#E7E9EC]
            px-5 py-4
          ">

            <p className="
              text-xs
              text-[#6B7688]
            ">
              Showing{" "}
              <span className="
                font-semibold
                text-[#101E33]
              ">
                {startIndex + 1}
              </span>
              {" "}to{" "}
              <span className="
                font-semibold
                text-[#101E33]
              ">
                {Math.min(endIndex, filteredProcesses.length)}
              </span>
              {" "}of{" "}
              <span className="
                font-semibold
                text-[#101E33]
              ">
                {filteredProcesses.length}
              </span>
            </p>

            <div className="
              flex items-center
              gap-1
            ">

              {/* Previous */}

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#E1E4E8]
                  bg-white
                  text-[#6B7688]
                  transition
                  hover:bg-[#F7F8FA]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiChevronLeft size={16} />
              </button>

              {/* Pages */}

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    text-sm
                    font-medium
                    transition

                    ${
                      currentPage === page
                        ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                        : "border-[#E1E4E8] bg-white text-[#536071] hover:bg-[#F7F8FA]"
                    }
                  `}
                >
                  {page}
                </button>
              ))}

              {/* Next */}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#E1E4E8]
                  bg-white
                  text-[#6B7688]
                  transition
                  hover:bg-[#F7F8FA]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiChevronRight size={16} />
              </button>

            </div>

          </div>
        )}

      </div>

      {/* ======================================================
          MOBILE CARDS
      ======================================================= */}

      <div className="space-y-3 md:hidden">

        {paginatedProcesses.length === 0 ? (
          <div className="
            rounded-2xl
            border border-[#E7E9EC]
            bg-white px-5 py-12
            text-center
          ">

            <FiFileText
              className="
                mx-auto mb-3
                text-[#B1B8C3]
              "
              size={35}
            />

            <p className="
              font-medium
              text-[#101E33]
            ">
              No process steps found
            </p>

            <p className="
              mt-1 text-sm
              text-[#6B7688]
            ">
              Try changing your search or filters.
            </p>

          </div>
        ) : (
          paginatedProcesses.map((item) => (
            <div
              key={item.id}
              className="
                rounded-2xl
                border border-[#E7E9EC]
                bg-white p-4
              "
            >

              <div className="
                flex items-start
                gap-3
              ">

                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="
                    mt-1 h-4 w-4
                    rounded
                    border-[#CBD1D9]
                    accent-[#1B3A6B]
                  "
                />

                <div className="
                  flex h-12 w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#EEF3FA]
                  text-sm font-bold
                  text-[#1B3A6B]
                ">
                  {String(item.stepNumber).padStart(2, "0")}
                </div>

                <div className="
                  min-w-0 flex-1
                ">

                  <div className="
                    flex items-start
                    justify-between
                    gap-2
                  ">

                    <div>

                      <h3 className="
                        font-semibold
                        text-[#101E33]
                      ">
                        {item.title}
                      </h3>

                      <p className="
                        mt-0.5 text-xs
                        text-[#8A94A4]
                      ">
                        /{item.slug}
                      </p>

                    </div>

                    <ProcessActionMenu
                      process={item}
                      onDelete={setDeleteId}
                      onToggle={handleToggle}
                    />

                  </div>

                  <p className="
                    mt-3 line-clamp-2
                    text-sm
                    text-[#6B7688]
                  ">
                    {item.shortDescription}
                  </p>

                  <div className="
                    mt-3 flex flex-wrap
                    items-center gap-2
                  ">

                    {item.enabled ? (
                      <span className="
                        rounded-full
                        bg-[#EAF7EE]
                        px-2.5 py-1
                        text-xs font-semibold
                        text-[#267044]
                      ">
                        Enabled
                      </span>
                    ) : (
                      <span className="
                        rounded-full
                        bg-[#F2F3F5]
                        px-2.5 py-1
                        text-xs font-semibold
                        text-[#6B7688]
                      ">
                        Disabled
                      </span>
                    )}

                    <span className="
                      rounded-full
                      bg-[#F2F4F7]
                      px-2.5 py-1
                      text-xs font-medium
                      text-[#536071]
                    ">
                      Order #{item.displayOrder}
                    </span>

                  </div>

                </div>

              </div>

            </div>
          ))
        )}

        {/* Mobile Pagination */}

        {filteredProcesses.length > ROWS_PER_PAGE && (
          <div className="
            flex items-center
            justify-between
            rounded-2xl
            border border-[#E7E9EC]
            bg-white p-4
          ">

            <p className="
              text-xs
              text-[#6B7688]
            ">
              Page{" "}
              <span className="
                font-semibold
                text-[#101E33]
              ">
                {currentPage}
              </span>
              {" "}of{" "}
              <span className="
                font-semibold
                text-[#101E33]
              ">
                {totalPages}
              </span>
            </p>

            <div className="
              flex items-center
              gap-1
            ">

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#E1E4E8]
                  bg-white
                  text-[#6B7688]
                  disabled:opacity-40
                "
              >
                <FiChevronLeft size={16} />
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#E1E4E8]
                  bg-white
                  text-[#6B7688]
                  disabled:opacity-40
                "
              >
                <FiChevronRight size={16} />
              </button>

            </div>

          </div>
        )}

      </div>

      {/* ======================================================
          DELETE MODAL
      ======================================================= */}

      {deleteId && (
        <div className="
          fixed inset-0 z-50
          flex items-center
          justify-center
          bg-black/40 px-4
        ">

          <div className="
            w-full max-w-md
            rounded-2xl
            bg-white p-6
            shadow-2xl
          ">

            <div className="
              flex h-12 w-12
              items-center
              justify-center
              rounded-xl
              bg-[#FFF0F0]
              text-[#C0272D]
            ">
              <FiTrash2 size={21} />
            </div>

            <h2 className="
              mt-4 text-lg
              font-semibold
              text-[#101E33]
            ">
              Delete process step?
            </h2>

            <p className="
              mt-2 text-sm
              leading-6
              text-[#6B7688]
            ">
              This action cannot be undone.
              The selected process step will be
              permanently removed.
            </p>

            <div className="
              mt-6 flex
              justify-end gap-3
            ">

              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="
                  rounded-xl
                  border border-[#E1E4E8]
                  px-4 py-2.5
                  text-sm font-medium
                  text-[#536071]
                  hover:bg-[#F7F8FA]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  rounded-xl
                  bg-[#C0272D]
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  hover:bg-[#A91F24]
                "
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}