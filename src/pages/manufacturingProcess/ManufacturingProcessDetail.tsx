import { Link, useLocation, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiHash,
  FiXCircle,
} from "react-icons/fi";

import {
  getManufacturingProcessById,
  getManufacturingProcessBySlug,
} from "../../services/manufacturingProcess.api";

export default function ManufacturingProcessDetail() {
  // ============================================================
  // URL PARAMS
  // ============================================================

  const { id, slug } = useParams<{
    id?: string;
    slug?: string;
  }>();

  const location = useLocation();

  // ============================================================
  // DETERMINE WHICH URL IS BEING USED
  // ============================================================

  /*
    Public:
      /manufacturing-process/:slug

    Admin:
      /admin/manufacturing-process/:id/view
  */

  const isAdminView = location.pathname.startsWith(
    "/admin/manufacturing-process"
  );

  // ============================================================
  // GET PROCESS
  // ============================================================

  let process;

  if (id) {
    // Admin URL
    process = getManufacturingProcessById(id);
  } else if (slug) {
    // Public URL
    process = getManufacturingProcessBySlug(slug);
  }

  // ============================================================
  // PROCESS NOT FOUND
  // ============================================================

  if (!process) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] px-4 py-10">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-[#E7E9EC] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FiXCircle
                size={30}
                className="text-[#C0272D]"
              />
            </div>

            <h1 className="text-2xl font-bold text-[#101E33]">
              Process Not Found
            </h1>

            <p className="mt-2 text-[#6B7688]">
              The manufacturing process step you are looking for
              does not exist or may have been removed.
            </p>

            {isAdminView ? (
              <Link
                to="/admin/manufacturing-process"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiArrowLeft size={17} />
                Back to Manufacturing Process
              </Link>
            ) : (
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiArrowLeft size={17} />
                Back to Home
              </Link>
            )}

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FBFBF9] px-4 py-6 md:px-8 lg:px-10">

      <div className="mx-auto max-w-[1200px]">

        {/* ========================================================
            TOP BAR
        ======================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Back */}

          <Link
            to={
              isAdminView
                ? "/admin/manufacturing-process"
                : "/"
            }
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#6B7688] transition hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />

            {isAdminView
              ? "Back to Manufacturing Process"
              : "Back to Home"}
          </Link>

          {/* Edit - Admin only */}

          {isAdminView && (
            <Link
              to={`/admin/manufacturing-process/${process.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#152f58]"
            >
              <FiEdit2 size={16} />
              Edit Process
            </Link>
          )}

        </div>

        {/* ========================================================
            PROCESS HEADER
        ======================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white shadow-sm">

          <div className="grid lg:grid-cols-2">

            {/* ====================================================
                PROCESS IMAGE
            ==================================================== */}

            <div className="flex min-h-[350px] items-center justify-center bg-[#F4F7FB] p-8 md:min-h-[450px]">

              {process.image ? (
                <img
                  src={process.image}
                  alt={process.title}
                  className="max-h-[400px] w-full max-w-[550px] rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-full min-h-[300px] w-full items-center justify-center">

                  <div className="text-center text-[#6B7688]">

                    <FiFileText
                      size={60}
                      className="mx-auto mb-3 opacity-40"
                    />

                    <p>
                      No process image
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* ====================================================
                BASIC INFORMATION
            ==================================================== */}

            <div className="p-6 md:p-10">

              {/* Step Badge */}

              <div className="mb-4">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[#1B3A6B]">
                  <FiFileText size={12} />
                  Step {String(process.stepNumber).padStart(2, "0")}
                </span>

              </div>

              {/* Name */}

              <h1 className="text-3xl font-bold leading-tight text-[#101E33] md:text-4xl">
                {process.title}
              </h1>

              {/* Description */}

              <p className="mt-5 text-base leading-7 text-[#6B7688]">
                {process.shortDescription ||
                  "No process description available."}
              </p>

              {/* Status */}

              <div className="mt-6 flex items-center gap-3">

                {process.enabled ? (
                  <>
                    <FiCheckCircle
                      size={20}
                      className="text-green-600"
                    />

                    <span className="font-semibold text-green-700">
                      Enabled
                    </span>
                  </>
                ) : (
                  <>
                    <FiXCircle
                      size={20}
                      className="text-[#C0272D]"
                    />

                    <span className="font-semibold text-[#C0272D]">
                      Disabled
                    </span>
                  </>
                )}

              </div>

              {/* Slug */}

              <div className="mt-8 border-t border-[#E7E9EC] pt-6">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Process URL
                </p>

                <p className="mt-2 break-all rounded-lg bg-[#F4F7FB] px-3 py-2 font-mono text-sm text-[#1B3A6B]">
                  /manufacturing-process/{process.slug}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            PROCESS SPECIFICATIONS
        ======================================================== */}

        <div className="mt-6">

          <h2 className="mb-4 text-xl font-bold text-[#101E33]">
            Process Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Step Number */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">

                <FiFileText
                  size={20}
                  className="text-[#1B3A6B]"
                />

              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Step Number
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {String(process.stepNumber).padStart(2, "0")}
              </p>

            </div>

            {/* Display Order */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">

                <FiHash
                  size={20}
                  className="text-[#1B3A6B]"
                />

              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Display Order
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {process.displayOrder}
              </p>

            </div>

            {/* Status */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">

              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${
                  process.enabled
                    ? "bg-[#EAF7EE]"
                    : "bg-[#F2F3F5]"
                }`}
              >

                {process.enabled ? (
                  <FiCheckCircle
                    size={20}
                    className="text-[#267044]"
                  />
                ) : (
                  <FiXCircle
                    size={20}
                    className="text-[#6B7688]"
                  />
                )}

              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Status
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {process.enabled ? "Enabled" : "Disabled"}
              </p>

            </div>

          </div>

        </div>

        {/* ========================================================
            DESCRIPTION
        ======================================================== */}

        <div className="mt-6 rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-xl font-bold text-[#101E33]">
            Process Overview
          </h2>

          <div className="mt-4 border-t border-[#E7E9EC] pt-5">

            <p className="whitespace-pre-line text-[15px] leading-7 text-[#6B7688]">
              {process.shortDescription ||
                "No detailed description available."}
            </p>

          </div>

        </div>

        {/* ========================================================
            PROCESS INFORMATION
        ======================================================== */}

        {isAdminView && (
          <div className="mt-6 rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-xl font-bold text-[#101E33]">
              Page Information
            </h2>

            <div className="mt-5 grid gap-5 border-t border-[#E7E9EC] pt-5 sm:grid-cols-2">

              {/* Process ID */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Process ID
                </p>

                <p className="mt-1 break-all font-mono text-sm text-[#101E33]">
                  {process.id}
                </p>

              </div>

              {/* Slug */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Slug
                </p>

                <p className="mt-1 break-all font-mono text-sm text-[#101E33]">
                  {process.slug}
                </p>

              </div>

              {/* Created */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Created At
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">

                  <FiCalendar size={15} />

                  {formatDate(process.createdAt)}

                </div>

              </div>

              {/* Updated */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Last Updated
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">

                  <FiCalendar size={15} />

                  {formatDate(process.updatedAt)}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            BOTTOM ACTIONS
        ======================================================== */}

        <div className="mt-6 flex flex-col gap-3 pb-10 sm:flex-row">

          <Link
            to={
              isAdminView
                ? "/admin/manufacturing-process"
                : "/"
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8DEE7] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] transition hover:bg-[#F4F7FB]"
          >
            <FiArrowLeft size={17} />

            {isAdminView
              ? "Back to Manufacturing Process"
              : "Back to Home"}
          </Link>

          {isAdminView && (
            <Link
              to={`/admin/manufacturing-process/${process.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
            >
              <FiEdit2 size={17} />
              Edit Process
            </Link>
          )}

        </div>

      </div>

    </div>
  );
}