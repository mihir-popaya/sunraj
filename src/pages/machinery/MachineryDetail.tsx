import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiSettings,
  FiCalendar,
  FiHash,
  FiActivity,
  FiBox,
  FiCpu,
  FiLoader,
} from "react-icons/fi";

import {
  getMachineryById,
  getPublicMachinery,
} from "../../services/machinery.api";
import type { MachineryItem } from "../../types/machinery";

export default function MachineryDetail() {
  const { id, slug } = useParams<{
    id?: string;
    slug?: string;
  }>();

  const [machinery, setMachinery] = useState<MachineryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAdminView = Boolean(id);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (id) {
          const item = await getMachineryById(id);
          if (isMounted) setMachinery(item || null);
        } else if (slug) {
          // Find matching item from public list
          const publicItems = await getPublicMachinery();
          const item = publicItems.find(
            (m) => m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
          );
          if (isMounted) setMachinery(item || null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load machinery details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, slug]);

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <FiLoader className="animate-spin text-[#1B3A6B]" size={36} />
        <p className="mt-3 text-sm font-medium text-[#101E33]">Loading Machinery Details...</p>
      </div>
    );
  }

  // Not Found / Error State
  if (error || !machinery) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiSettings size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-[#101E33]">
            Machinery Not Found
          </h1>

          <p className="mt-2 text-sm text-[#6B7688]">
            {error || "The machinery you are looking for does not exist or has been removed."}
          </p>

          <Link
            to={isAdminView ? "/admin/machinery" : "/"}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#153056]"
          >
            <FiArrowLeft size={17} />
            {isAdminView ? "Back to Machinery" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // Derive slug for UI if backend slug isn't stored explicitly
  const computedSlug = machinery.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Parse technical details dynamically if standard JSON format string is returned
  let parsedTechnicalDetails: Array<{ label: string; value: string }> = [];
  if (machinery.technicalDetails) {
    try {
      if (typeof machinery.technicalDetails === "string" && machinery.technicalDetails.startsWith("[")) {
        parsedTechnicalDetails = JSON.parse(machinery.technicalDetails);
      }
    } catch {
      parsedTechnicalDetails = [];
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={isAdminView ? "/admin/machinery" : "/"}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7688] hover:text-[#1B3A6B]"
        >
          <FiArrowLeft size={17} />
          {isAdminView ? "Back to Machinery" : "Back to Home"}
        </Link>

        {isAdminView && (
          <Link
            to={`/admin/machinery/${machinery.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#153056]"
          >
            <FiEdit2 size={17} />
            Edit Machinery
          </Link>
        )}
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E9EC] bg-white">
        <div className="grid lg:grid-cols-[420px_1fr]">

          {/* IMAGE */}
          <div className="flex min-h-[320px] items-center justify-center bg-[#F5F7FA] p-8 lg:min-h-[460px]">
            {machinery.image ? (
              <img
                src={machinery.image}
                alt={machinery.name}
                className="max-h-[380px] w-full rounded-2xl object-contain"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-[#EEF3FA] text-[#1B3A6B]">
                <FiSettings size={55} />
              </div>
            )}
          </div>

          {/* BASIC INFORMATION */}
          <div className="p-6 md:p-10">
            <span className="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1.5 text-xs font-semibold text-[#1B3A6B]">
              Display Order: #{machinery.displayOrder}
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#101E33] md:text-4xl">
              {machinery.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B7688]">
              {machinery.shortDescription}
            </p>

            <div className="mt-6">
              {machinery.enabled ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF7EE] px-4 py-2 text-sm font-semibold text-[#267044]">
                  <FiCheckCircle size={17} /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#F2F3F5] px-4 py-2 text-sm font-semibold text-[#6B7688]">
                  <FiXCircle size={17} /> Disabled
                </span>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-[#E7E9EC] bg-[#FBFBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">
                Machinery URL Slug
              </p>
              <p className="mt-2 break-all text-sm text-[#1B3A6B]">
                /machinery/{computedSlug}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MACHINERY DETAILS */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiActivity size={19} />
          </div>
          <h2 className="text-xl font-semibold text-[#101E33]">
            Machinery Features & Performance
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* FUNCTION */}
          <div className="rounded-xl border border-[#E7E9EC] p-5">
            <div className="flex items-center gap-2">
              <FiSettings className="text-[#1B3A6B]" size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">
                Function / Purpose
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#536071]">
              {machinery.function || "—"}
            </p>
          </div>

          {/* QUALITY ADVANTAGE */}
          <div className="rounded-xl border border-[#E7E9EC] p-5">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[#267044]" size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">
                Quality Advantage
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#536071]">
              {machinery.qualityAdvantage || "—"}
            </p>
          </div>

          {/* PRODUCTION */}
          <div className="rounded-xl border border-[#E7E9EC] p-5">
            <div className="flex items-center gap-2">
              <FiBox className="text-[#1B3A6B]" size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">
                Production Capability
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#536071]">
              {machinery.productionCapability || "—"}
            </p>
          </div>

          {/* AUTOMATION */}
          <div className="rounded-xl border border-[#E7E9EC] p-5">
            <div className="flex items-center gap-2">
              <FiCpu className="text-[#1B3A6B]" size={17} />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">
                Automation Advantage
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#536071]">
              {machinery.automationAdvantage || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* TECHNICAL DETAILS */}
      <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
            <FiSettings size={19} />
          </div>
          <h2 className="text-xl font-semibold text-[#101E33]">
            Technical Details & Specifications
          </h2>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#E7E9EC]">
          {parsedTechnicalDetails.length > 0 ? (
            <div className="divide-y divide-[#E7E9EC]">
              {parsedTechnicalDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[220px_1fr]">
                  <p className="text-sm font-semibold text-[#536071]">{detail.label}</p>
                  <p className="text-sm text-[#101E33]">{detail.value || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-[#536071]">
              {machinery.technicalDetails || "No additional technical details specified."}
            </div>
          )}
        </div>
      </div>

      {/* SYSTEM INFORMATION (ADMIN ONLY) */}
      {isAdminView && (
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[#101E33]">System Information</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-[#FBFBF9] p-4">
              <div className="flex items-center gap-2">
                <FiHash className="text-[#1B3A6B]" size={17} />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">ID</p>
              </div>
              <p className="mt-2 break-all text-sm text-[#101E33]">{machinery.id}</p>
            </div>

            <div className="rounded-xl bg-[#FBFBF9] p-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-[#1B3A6B]" size={17} />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A94A4]">Created At</p>
              </div>
              <p className="mt-2 text-sm text-[#101E33]">
                {machinery.createdAt ? new Date(machinery.createdAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTIONS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link
          to={isAdminView ? "/admin/machinery" : "/"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E1E4E8] bg-white px-5 py-3 text-sm font-medium text-[#536071] hover:bg-[#F7F8FA]"
        >
          <FiArrowLeft size={17} />
          {isAdminView ? "Back to Machinery" : "Back to Home"}
        </Link>

        {isAdminView && (
          <Link
            to={`/admin/machinery/${machinery.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#153056]"
          >
            <FiEdit2 size={17} />
            Edit Machinery
          </Link>
        )}
      </div>
    </div>
  );
}