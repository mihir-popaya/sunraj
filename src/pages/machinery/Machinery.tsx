import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  FiPlus,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiSettings,
  FiChevronDown,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
  FiLoader,
} from "react-icons/fi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { MachineryItem } from "../../types/machinery";

import {
  getMachinery,
  deleteMachinery,
  toggleMachinery,
  enableMachinery,
  disableMachinery,
} from "../../services/machinery.api";

const ROWS_PER_PAGE = 5;

/* ============================================================
   ACTION MENU
============================================================ */

interface MachineryActionMenuProps {
  machinery: MachineryItem;
  onDelete: (id: string) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
}

function MachineryActionMenu({
  machinery,
  onDelete,
  onToggle,
}: MachineryActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7688] transition hover:bg-[#F3F5F7] hover:text-[#101E33]"
        aria-label="Open machinery actions"
      >
        <FiMoreHorizontal size={19} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-xl">
            <Link
              to={`/admin/machinery/${machinery.id}/edit`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              <FiEdit2 size={16} />
              Edit Machinery
            </Link>

            <Link
              to={`/admin/machinery/${machinery.id}/view`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              <FiExternalLink size={16} />
              View Machinery
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggle(machinery.id, machinery.enabled);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]"
            >
              {machinery.enabled ? (
                <>
                  <FiXCircle size={16} /> Disable
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} /> Enable
                </>
              )}
            </button>

            <div className="my-1 border-t border-[#E7E9EC]" />

            <button
              type="button"
              onClick={() => {
                onDelete(machinery.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#C0272D] hover:bg-[#FFF5F5]"
            >
              <FiTrash2 size={16} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Machinery() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  /* ==========================================================
     LOAD DATA FROM API
  ========================================================== */

  const loadMachinery = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMachinery();
      setMachinery(data);
    } catch (err: any) {
      setError(err.message || "Failed to load machinery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachinery();
  }, []);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredMachinery = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return machinery
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.shortDescription.toLowerCase().includes(normalizedSearch) ||
          item.function.toLowerCase().includes(normalizedSearch) ||
          item.productionCapability.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          status === "all" ||
          (status === "enabled" && item.enabled) ||
          (status === "disabled" && !item.enabled);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [machinery, search, status]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(1, Math.ceil(filteredMachinery.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedMachinery = filteredMachinery.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  /* ==========================================================
     SELECTION & ACTIONS
  ========================================================== */

  const isAllSelected =
    paginatedMachinery.length > 0 &&
    paginatedMachinery.every((item) => selectedIds.includes(item.id));

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedMachinery.some((item) => item.id === id))
      );
    } else {
      const visibleIds = paginatedMachinery.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleMachinery(id, currentStatus);
      await loadMachinery();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMachinery(deleteId);
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      await loadMachinery();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const handleBulkEnable = async () => {
    if (selectedIds.length === 0) return;
    try {
      await enableMachinery(selectedIds);
      setSelectedIds([]);
      await loadMachinery();
    } catch (err) {
      alert("Failed to enable selected items");
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    try {
      await disableMachinery(selectedIds);
      setSelectedIds([]);
      await loadMachinery();
    } catch (err) {
      alert("Failed to disable selected items");
    }
  };

  /* ==========================================================
     EXPORTS
  ========================================================== */

  const getExportData = () => {
    return selectedIds.length > 0
      ? machinery.filter((item) => selectedIds.includes(item.id))
      : filteredMachinery;
  };

  const exportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const headers = [
      "Order",
      "Machinery Name",
      "Function",
      "Quality Advantage",
      "Production Capability",
      "Automation Advantage",
      "Status",
    ];
    const rows = data.map((item) => [
      item.displayOrder,
      item.name,
      item.function,
      item.qualityAdvantage,
      item.productionCapability,
      item.automationAdvantage,
      item.enabled ? "Enabled" : "Disabled",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sunraj-machinery.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const exportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const rows = data.map((item) => ({
      Order: item.displayOrder,
      "Machinery Name": item.name,
      Function: item.function,
      "Quality Advantage": item.qualityAdvantage,
      "Production Capability": item.productionCapability,
      "Automation Advantage": item.automationAdvantage,
      Status: item.enabled ? "Enabled" : "Disabled",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Machinery");
    XLSX.writeFile(workbook, "sunraj-machinery.xlsx");
    setExportOpen(false);
  };

  const exportPDF = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Sunraj Machinery Showcase", 14, 15);
    doc.setFontSize(9);
    doc.text(`Total Records: ${data.length}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["Order", "Machinery", "Function", "Production", "Status"]],
      body: data.map((item) => [
        String(item.displayOrder),
        item.name,
        item.function,
        item.productionCapability,
        item.enabled ? "Enabled" : "Disabled",
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fontSize: 8, fontStyle: "bold" },
    });

    doc.save("sunraj-machinery.pdf");
    setExportOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiSettings size={21} />
          </div>
          <div>
            <h1 className="font-sora text-2xl font-semibold tracking-[-0.03em] text-[#101E33] sm:text-3xl">
              Machinery
            </h1>
            <p className="mt-1 text-sm text-[#6B7688]">
              Manage your machinery showcase collection.
            </p>
          </div>
        </div>

        <Link
          to="/admin/machinery/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153056]"
        >
          <FiPlus size={18} />
          Add Machinery
        </Link>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => updateSearchParam("search", e.target.value)}
              placeholder="Search machinery..."
              className="h-11 w-full rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] pl-10 pr-4 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B]"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => updateSearchParam("status", e.target.value)}
              className="h-11 min-w-[160px] appearance-none rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] px-4 pr-10 text-sm text-[#101E33] outline-none focus:border-[#1B3A6B]"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7688]" size={16} />
          </div>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#D8E1EF] bg-[#F4F7FB] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-[#1B3A6B]">
            {selectedIds.length} {selectedIds.length === 1 ? "machinery" : "machinery items"} selected
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D8DDE5] bg-white px-3 py-2 text-sm font-medium text-[#101E33] hover:bg-[#F8F9FA]"
              >
                <FiDownload size={16} /> Export <FiChevronDown size={14} />
              </button>

              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[#E7E9EC] bg-white py-1 shadow-xl">
                    <button type="button" onClick={exportCSV} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]">
                      <FiFileText size={16} /> Export CSV
                    </button>
                    <button type="button" onClick={exportExcel} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]">
                      <FiGrid size={16} /> Export Excel
                    </button>
                    <button type="button" onClick={exportPDF} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#101E33] hover:bg-[#F7F8FA]">
                      <FiFileText size={16} /> Export PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button type="button" onClick={handleBulkEnable} className="inline-flex items-center gap-2 rounded-lg border border-[#CFE5D7] bg-white px-3 py-2 text-sm font-medium text-[#267044] hover:bg-[#F1FAF4]">
              <FiCheckCircle size={16} /> Enable
            </button>

            <button type="button" onClick={handleBulkDisable} className="inline-flex items-center gap-2 rounded-lg border border-[#F0D1D3] bg-white px-3 py-2 text-sm font-medium text-[#C0272D] hover:bg-[#FFF5F5]">
              <FiXCircle size={16} /> Disable
            </button>

            <button type="button" onClick={() => setSelectedIds([])} className="px-3 py-2 text-sm font-medium text-[#6B7688] hover:text-[#101E33]">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* TABLE DATA */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#E7E9EC] bg-[#FBFBF9]">
                <th className="w-12 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                  />
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Machinery
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Function
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Production Capability
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <FiLoader className="mx-auto mb-3 animate-spin text-[#1B3A6B]" size={32} />
                    <p className="font-medium text-[#101E33]">Loading Machinery Data...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-[#C0272D]">
                    <p className="font-semibold">{error}</p>
                    <button onClick={loadMachinery} className="mt-2 text-sm underline">Retry</button>
                  </td>
                </tr>
              ) : paginatedMachinery.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <FiSettings className="mx-auto mb-3 text-[#B1B8C3]" size={35} />
                    <p className="font-medium text-[#101E33]">No machinery found</p>
                    <p className="mt-1 text-sm text-[#6B7688]">Try changing your search or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedMachinery.map((item) => (
                  <tr key={item.id} className="border-b border-[#EEF0F2] last:border-b-0 hover:bg-[#FCFCFB]">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/machinery/${item.id}/view`} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <FiSettings size={19} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#101E33]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-[#8A94A4]">Order #{item.displayOrder}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="max-w-[260px] px-5 py-4">
                      <p className="line-clamp-2 text-sm text-[#536071]">{item.function}</p>
                    </td>
                    <td className="max-w-[280px] px-5 py-4">
                      <p className="line-clamp-2 text-sm text-[#536071]">{item.productionCapability}</p>
                    </td>
                    <td className="px-5 py-4">
                      {item.enabled ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7EE] px-3 py-1.5 text-xs font-semibold text-[#267044]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#267044]" /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F3F5] px-3 py-1.5 text-xs font-semibold text-[#6B7688]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8A94A4]" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <MachineryActionMenu machinery={item} onDelete={setDeleteId} onToggle={handleToggle} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredMachinery.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-[#E7E9EC] px-5 py-4">
            <p className="text-xs text-[#6B7688]">
              Showing <span className="font-semibold text-[#101E33]">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-[#101E33]">{Math.min(endIndex, filteredMachinery.length)}</span> of{" "}
              <span className="font-semibold text-[#101E33]">{filteredMachinery.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] disabled:opacity-40"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium ${
                    currentPage === page ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-[#E1E4E8] bg-white text-[#536071]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E4E8] bg-white text-[#6B7688] disabled:opacity-40"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#C0272D]">
              <FiTrash2 size={21} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#101E33]">Delete machinery?</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7688]">
              This action cannot be undone. The selected item will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-[#E1E4E8] px-4 py-2.5 text-sm font-medium text-[#536071] hover:bg-[#F7F8FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-[#C0272D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A91F24]"
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