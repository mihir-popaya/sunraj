import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { FiMail,FiAlertTriangle, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import type {
  Message,
  MessageStatus,
  MessageType,
} from "../../types/message";

import {
  getMessages,
} from "../../data/messages";

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 5;

/* =========================================================
   LABELS
========================================================= */

function getTypeLabel(
  type: MessageType
) {
  switch (type) {
    case "product":
      return "Product Enquiry";

    case "callback":
      return "Request Callback";

    case "general":
      return "General Contact";

    default:
      return "General Contact";
  }
}

function getStatusLabel(
  status: MessageStatus
) {
  switch (status) {
    case "new":
      return "New";

    case "in_progress":
      return "In Progress";

    case "resolved":
      return "Resolved";

    case "spam":
      return "Spam";

    default:
      return status;
  }
}

/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: MessageStatus;
}) {
  const styles: Record<
    MessageStatus,
    string
  > = {
    new:
      "bg-[#FCEBEC] text-[#C0272D]",

    in_progress:
      "bg-[#FFF5E8] text-[#B76A00]",

    resolved:
      "bg-[#EDF8F1] text-[#1E7A4C]",

    spam:
      "bg-[#F1F3F6] text-[#7B8798]",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[status]}
      `}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* =========================================================
   TYPE BADGE
========================================================= */

function TypeBadge({
  type,
}: {
  type: MessageType;
}) {
  const styles: Record<
    MessageType,
    string
  > = {
    product:
      "bg-[#EEF3F9] text-[#1B3A6B]",

    callback:
      "bg-[#FFF5E8] text-[#A86200]",

    general:
      "bg-[#F1F4F8] text-[#667085]",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[type]}
      `}
    >
      {getTypeLabel(type)}
    </span>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Messages() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [exportOpen, setExportOpen] =
    useState(false);

  const exportRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    setMessages(getMessages());
  }, []);

  /* =======================================================
     URL STATE
  ======================================================= */

  const search =
    searchParams.get("search") || "";

  const statusFilter =
    (searchParams.get("status") ||
      "all") as "all" | MessageStatus;

  const typeFilter =
    (searchParams.get("type") ||
      "all") as "all" | MessageType;

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page") || "1")
  );

  /* =======================================================
     UPDATE URL
  ======================================================= */

  function updateParams(
    changes: Record<
      string,
      string | null
    >
  ) {
    const params =
      new URLSearchParams(searchParams);

    Object.entries(changes).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    setSearchParams(params);
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMessages =
    useMemo(() => {
      const searchValue =
        search.toLowerCase().trim();

      return messages.filter(
        (message) => {
          const matchesSearch =
            !searchValue ||
            message.name
              .toLowerCase()
              .includes(searchValue) ||
            (message.company || "")
              .toLowerCase()
              .includes(searchValue) ||
            message.email
              .toLowerCase()
              .includes(searchValue) ||
            message.subject
              .toLowerCase()
              .includes(searchValue) ||
            message.id
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter === "all" ||
            message.status ===
              statusFilter;

          const matchesType =
            typeFilter === "all" ||
            message.type === typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      messages,
      search,
      statusFilter,
      typeFilter,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMessages.length /
        PAGE_SIZE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedMessages =
    filteredMessages.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );

  /* =======================================================
     FIX INVALID PAGE
  ======================================================= */

  useEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      updateParams({
        page: String(totalPages),
      });
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     SELECTED DATA
  ======================================================= */

  const selectedMessages =
    filteredMessages.filter(
      (message) =>
        selectedIds.includes(message.id)
    );

  const allCurrentPageSelected =
    paginatedMessages.length > 0 &&
    paginatedMessages.every(
      (message) =>
        selectedIds.includes(message.id)
    );

  /* =======================================================
     SELECT ONE
  ======================================================= */

  function toggleMessage(
    id: string
  ) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  }

  /* =======================================================
     SELECT CURRENT PAGE
  ======================================================= */

  function toggleCurrentPage() {
    const pageIds =
      paginatedMessages.map(
        (message) => message.id
      );

    if (allCurrentPageSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !pageIds.includes(id)
        )
      );

      return;
    }

    setSelectedIds((previous) => [
      ...new Set([
        ...previous,
        ...pageIds,
      ]),
    ]);
  }

  /* =======================================================
     CLOSE EXPORT WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        exportRef.current &&
        !exportRef.current.contains(
          event.target as Node
        )
      ) {
        setExportOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     EXPORT DATA
  ======================================================= */

  function getExportMessages() {
    if (selectedMessages.length > 0) {
      return selectedMessages;
    }

    return filteredMessages;
  }

  /* =======================================================
     CSV
  ======================================================= */

  function exportCSV() {
    const exportMessages =
      getExportMessages();

    const rows =
      exportMessages.map(
        (message) => ({
          "Message ID": message.id,
          Date: new Date(
            message.createdAt
          ).toLocaleDateString("en-IN"),
          Name: message.name,
          Designation:
            message.designation || "",
          Company:
            message.company || "",
          Industry:
            message.industry || "",
          Email: message.email,
          Phone: message.phone,
          "Enquiry Type":
            getTypeLabel(message.type),
          Subject: message.subject,
          Product:
            message.product || "",
          Quantity:
            message.quantity || "",
          Requirements:
            message.requirements || "",
          Message: message.message,
          Status:
            getStatusLabel(
              message.status
            ),
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const csv =
      XLSX.utils.sheet_to_csv(
        worksheet
      );

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "sunraj-messages.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setExportOpen(false);
  }

  /* =======================================================
     EXCEL
  ======================================================= */

  function exportExcel() {
    const exportMessages =
      getExportMessages();

    const rows =
      exportMessages.map(
        (message) => ({
          "Message ID": message.id,
          Date: new Date(
            message.createdAt
          ).toLocaleDateString("en-IN"),
          Name: message.name,
          Designation:
            message.designation || "",
          Company:
            message.company || "",
          Industry:
            message.industry || "",
          Email: message.email,
          Phone: message.phone,
          "Enquiry Type":
            getTypeLabel(message.type),
          Subject: message.subject,
          Product:
            message.product || "",
          Quantity:
            message.quantity || "",
          Requirements:
            message.requirements || "",
          Message: message.message,
          Status:
            getStatusLabel(
              message.status
            ),
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Messages"
    );

    XLSX.writeFile(
      workbook,
      "sunraj-messages.xlsx"
    );

    setExportOpen(false);
  }

  /* =======================================================
     PDF
  ======================================================= */

  function exportPDF() {
    const exportMessages =
      getExportMessages();

    const pdf =
      new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

    pdf.setFontSize(16);

    pdf.text(
      "Sunraj - Messages & Enquiries",
      14,
      15
    );

    pdf.setFontSize(8);

    pdf.text(
      `Generated: ${new Date().toLocaleString(
        "en-IN"
      )}`,
      14,
      21
    );

    let y = 30;

    pdf.setFontSize(8);

    exportMessages.forEach(
      (message, index) => {
        const date =
          new Date(
            message.createdAt
          ).toLocaleDateString(
            "en-IN"
          );

        const line =
          `${index + 1}. ${message.name} | ` +
          `${message.company || "-"} | ` +
          `${getTypeLabel(
            message.type
          )} | ` +
          `${getStatusLabel(
            message.status
          )} | ` +
          `${date}`;

        const wrapped =
          pdf.splitTextToSize(
            line,
            270
          );

        pdf.text(
          wrapped,
          14,
          y
        );

        y +=
          wrapped.length * 5 + 2;

        if (y > 190) {
          pdf.addPage();
          y = 15;
        }
      }
    );

    pdf.save(
      "sunraj-messages.pdf"
    );

    setExportOpen(false);
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  const newCount =
    messages.filter(
      (message) =>
        message.status === "new"
    ).length;

  const progressCount =
    messages.filter(
      (message) =>
        message.status ===
        "in_progress"
    ).length;

  const resolvedCount =
    messages.filter(
      (message) =>
        message.status ===
        "resolved"
    ).length;

const spanCount = messages.filter(
  (message) => message.status === "spam" // or "span", depending on your API/database value
).length;

  /* =======================================================
     PAGINATION BUTTONS
  ======================================================= */

  function goToPage(
    page: number
  ) {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    updateParams({
      page: String(nextPage),
    });
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mx-auto max-w-[1500px]">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-[#C0272D]
            "
          >
            Communication
          </p>

          <h1
            className="
              mt-1.5
              font-sora
              text-2xl
              font-semibold
              tracking-[-0.03em]
              text-[#101E33]
              sm:text-3xl
            "
          >
            Messages & Enquiries
          </h1>

          <p className="mt-2 text-sm text-[#7A8698]">
            Manage incoming customer enquiries
            received through your website.
          </p>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* New Enquiries Card */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#101E33]">
              New Enquiries
            </p>
            <p className="mt-2 text-4xl font-bold text-[#101E33]">
              {newCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiMail size={20} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#8994A5]">
          Awaiting action
        </p>
      </div>

      {/* In Progress Card */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#101E33]">
              In Progress
            </p>
            <p className="mt-2 text-4xl font-bold text-[#101E33]">
              {progressCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF6E5] text-[#D97706]">
            <FiRefreshCw size={20} className="animate-spin-slow" />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#8994A5]">
          Currently being handled
        </p>
      </div>

      {/* Resolved Card */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#101E33]">
              Resolved
            </p>
            <p className="mt-2 text-4xl font-bold text-[#267044]">
              {resolvedCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
            <FiCheckCircle size={20} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#8994A5]">
          Successfully completed
        </p>
      </div>

      {/* Spam Card */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#101E33]">
              Spam
            </p>
            <p className="mt-2 text-4xl font-bold text-[#DC2626]">
              {spanCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626]">
            <FiAlertTriangle size={20} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#8994A5]">
          Flagged messages
        </p>
      </div>
    </div>


      {/* =================================================
          MAIN CARD
      ================================================= */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#E5E8ED]
          bg-white
        "
      >

        {/* =================================================
            CARD HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#EEF0F3]
            p-5
            sm:p-6
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          <div>

            <h2
              className="
                font-sora
                text-xl
                font-bold
                text-[#101E33]
              "
            >
              Contact & Product Enquiries
            </h2>

            <p className="mt-1 text-sm text-[#8994A5]">
              Review and manage incoming customer
              messages.
            </p>

          </div>

          {/* SEARCH + EXPORT */}

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
            "
          >

            {/* SEARCH */}

            <div className="relative">

              <span
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[#9AA3B1]
                "
              >
                <SearchIcon />
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  updateParams({
                    search:
                      event.target.value,
                    page: "1",
                  })
                }
                placeholder="Search name, company..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#E4E8ED]
                  bg-[#FBFCFD]
                  pl-9
                  pr-3
                  text-xs
                  text-[#101E33]
                  outline-none
                  transition-all
                  placeholder:text-[#A0A8B5]
                  focus:border-[#C0272D]
                  focus:bg-white
                  sm:w-[240px]
                "
              />

            </div>

            {/* EXPORT */}

            <div
              ref={exportRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setExportOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="
                  inline-flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#C0272D]
                  px-4
                  text-xs
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-[#A91F25]
                  sm:w-auto
                "
              >
                <DownloadIcon />

                Export

                <span
                  className={`
                    text-[10px]
                    transition-transform
                    ${
                      exportOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                >
                  ▼
                </span>
              </button>

              {exportOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[46px]
                    z-30
                    w-[170px]
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#E5E8ED]
                    bg-white
                    p-1.5
                    shadow-[0_12px_30px_rgba(16,30,51,0.12)]
                  "
                >

                  <button
                    type="button"
                    onClick={exportCSV}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-[#526075]
                      hover:bg-[#F7F8FA]
                      hover:text-[#C0272D]
                    "
                  >
                    Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={exportExcel}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-[#526075]
                      hover:bg-[#F7F8FA]
                      hover:text-[#C0272D]
                    "
                  >
                    Export Excel
                  </button>

                  <button
                    type="button"
                    onClick={exportPDF}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-[#526075]
                      hover:bg-[#F7F8FA]
                      hover:text-[#C0272D]
                    "
                  >
                    Export PDF
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-[#EEF0F3]
            bg-[#FBFCFD]
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:px-6
          "
        >

          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#8994A5]">
            Filters
          </span>

          <select
            value={statusFilter}
            onChange={(event) =>
              updateParams({
                status:
                  event.target.value ===
                  "all"
                    ? null
                    : event.target.value,
                page: "1",
              })
            }
            className="
              h-9
              rounded-lg
              border
              border-[#E4E8ED]
              bg-white
              px-3
              text-xs
              font-medium
              text-[#526075]
              outline-none
              focus:border-[#C0272D]
            "
          >
            <option value="all">
              All Status
            </option>

            <option value="new">
              New
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="spam">
              Spam
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              updateParams({
                type:
                  event.target.value ===
                  "all"
                    ? null
                    : event.target.value,
                page: "1",
              })
            }
            className="
              h-9
              rounded-lg
              border
              border-[#E4E8ED]
              bg-white
              px-3
              text-xs
              font-medium
              text-[#526075]
              outline-none
              focus:border-[#C0272D]
            "
          >
            <option value="all">
              All Types
            </option>

            <option value="general">
              General Contact
            </option>

            <option value="product">
              Product Enquiry
            </option>

            <option value="callback">
              Request Callback
            </option>
          </select>

          {selectedIds.length > 0 && (
            <span className="text-[10px] font-semibold text-[#C0272D]">
              {selectedIds.length} selected
            </span>
          )}

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr
                className="
                  border-b
                  border-[#EEF0F3]
                  bg-[#FAFBFC]
                "
              >

                {/* SELECT ALL */}

                <th className="w-[50px] px-5 py-3 text-left sm:px-6">

                  <input
                    type="checkbox"
                    checked={
                      allCurrentPageSelected
                    }
                    onChange={
                      toggleCurrentPage
                    }
                    aria-label="Select all messages on current page"
                    className="
                      h-4
                      w-4
                      cursor-pointer
                      rounded
                      border-[#D7DCE3]
                      accent-[#C0272D]
                    "
                  />

                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Sender / Company
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Enquiry Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Subject
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#6B7688]">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-[#6B7688] sm:px-6">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#EEF0F3]">

              {paginatedMessages.map(
                (message) => (

                  <tr
                    key={message.id}
                    className="
                      transition-colors
                      hover:bg-[#FAFBFC]
                    "
                  >

                    {/* CHECKBOX */}

                    <td className="px-5 py-4 sm:px-6">

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          message.id
                        )}
                        onChange={() =>
                          toggleMessage(
                            message.id
                          )
                        }
                        aria-label={`Select ${message.name}`}
                        className="
                          h-4
                          w-4
                          cursor-pointer
                          rounded
                          border-[#D7DCE3]
                          accent-[#C0272D]
                        "
                      />

                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-4">

                      <p className=" truncate font-semibold text-[#101E33]">
                        {new Date(
                          message.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <p className=" mt-0.5 text-xs text-[#8A94A4]">
                        {new Date(
                          message.createdAt
                        ).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>

                    </td>

                    {/* SENDER */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F1F4F8]
                            text-xs
                            font-bold
                            text-[#1B3A6B]
                          "
                        >
                          {message.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <p className=" truncate font-semibold text-[#101E33]">
                            {message.name}
                          </p>

                          <p className=" mt-0.5 text-xs text-[#8A94A4]">
                            {message.company || message.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4 text-xl ">
                      <TypeBadge
                        type={message.type}
                      />
                    </td>

                    {/* SUBJECT */}

                    <td className="max-w-[230px] px-5 py-4">

                      <p className=" truncate font-semibold text-[#101E33]">
                        {message.subject}
                      </p>

                      {message.product && (
                        <p className=" mt-0.5 text-xs text-[#8A94A4]">
                          {message.product}
                        </p>
                      )}

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={message.status}
                      />
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right sm:px-6">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/messages/${message.id}`
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          border
                          border-[#E4E8ED]
                          bg-white
                          px-3
                          py-2
                          text-[10px]
                          font-semibold
                          text-[#526075]
                          transition-all
                          hover:border-[#C0272D]
                          hover:text-[#C0272D]
                        "
                      >
                        <EyeIcon />
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredMessages.length === 0 && (
          <div className="px-6 py-16 text-center">

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-[#F1F4F8]
                text-[#7B8798]
              "
            >
              <SearchIcon />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#101E33]">
              No enquiries found
            </h3>

            <p className="mt-1 text-xs text-[#8994A5]">
              Try changing your search or filters.
            </p>

          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-[#EEF0F3]
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >

          <p className="text-[10px] text-[#8994A5]">

            Showing{" "}

            <span className="font-semibold text-[#526075]">
              {filteredMessages.length === 0
                ? 0
                : (safePage - 1) *
                    PAGE_SIZE +
                  1}
            </span>

            {" - "}

            <span className="font-semibold text-[#526075]">
              {Math.min(
                safePage * PAGE_SIZE,
                filteredMessages.length
              )}
            </span>

            {" of "}

            <span className="font-semibold text-[#526075]">
              {filteredMessages.length}
            </span>

          </p>

          <div className="flex items-center gap-1">

            <button
              type="button"
              disabled={safePage === 1}
              onClick={() =>
                goToPage(
                  safePage - 1
                )
              }
              className="
                flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                border
                border-[#E4E8ED]
                bg-white
                px-2
                text-[10px]
                font-semibold
                text-[#526075]
                disabled:cursor-not-allowed
                disabled:opacity-40
                hover:border-[#C0272D]
                hover:text-[#C0272D]
              "
            >
              ←
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map((page) => (

              <button
                key={page}
                type="button"
                onClick={() =>
                  goToPage(page)
                }
                className={`
                  flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  px-2
                  text-[10px]
                  font-semibold
                  transition-colors
                  ${
                    page === safePage
                      ? "border-[#C0272D] bg-[#C0272D] text-white"
                      : "border-[#E4E8ED] bg-white text-[#526075] hover:border-[#C0272D] hover:text-[#C0272D]"
                  }
                `}
              >
                {page}
              </button>

            ))}

            <button
              type="button"
              disabled={
                safePage === totalPages
              }
              onClick={() =>
                goToPage(
                  safePage + 1
                )
              }
              className="
                flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                border
                border-[#E4E8ED]
                bg-white
                px-2
                text-[10px]
                font-semibold
                text-[#526075]
                disabled:cursor-not-allowed
                disabled:opacity-40
                hover:border-[#C0272D]
                hover:text-[#C0272D]
              "
            >
              →
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}