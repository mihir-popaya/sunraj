import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiRefreshCw,
  FiXCircle,
  FiZap,
} from "react-icons/fi";

import { FaLeaf } from "react-icons/fa";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import type { SustainabilityData } from "../../types/sustainability";

import { getSustainability } from "../../services/sustainability.api";

export default function SustainabilityDetail() {
  const { id } = useParams<{
    id: string;
  }>();

  const location = useLocation();

  const navigate = useNavigate();

  const [data, setData] =
    useState<SustainabilityData | null>(null);

  const isAdminView =
    location.pathname.startsWith("/admin/sustainability");

  useEffect(() => {
    const sustainability = getSustainability();

    if (isAdminView && id && sustainability.id !== id) {
      navigate("/admin/sustainability", {
        replace: true,
      });

      return;
    }

    setData(sustainability);
  }, [id, isAdminView, navigate]);

  function getInitiativeIcon(icon: string) {
    if (icon === "zap") {
      return <FiZap size={22} />;
    }

    if (icon === "recycle") {
      return <FiRefreshCw size={22} />;
    }

    return <FaLeaf size={22} />;
  }

  function formatDate(value: string) {
    if (!value) {
      return "—";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBF9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E7E9EC] border-t-[#1B3A6B]" />
      </div>
    );
  }

  // ============================================================
  // UNAVAILABLE TO PUBLIC (unpublished)
  // ============================================================

  if (!isAdminView && !data.enabled) {
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
              Sustainability Page Unavailable
            </h1>

            <p className="mt-2 text-[#6B7688]">
              This page is currently unpublished.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
            >
              <FiArrowLeft size={17} />
              Back to Home
            </Link>

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#101E33]">

      {/* ========================================================
          ADMIN TOP BAR
      ======================================================== */}

      {isAdminView && (
        <div className="border-b border-[#E7E9EC] bg-white px-4 py-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-[1200px]">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Back */}

              <Link
                to="/admin/sustainability"
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#6B7688] transition hover:text-[#1B3A6B]"
              >
                <FiArrowLeft size={18} />
                Back to Sustainability
              </Link>

              {/* Edit */}

              <Link
                to={`/admin/sustainability/${data.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiEdit2 size={16} />
                Edit Sustainability
              </Link>

            </div>

            {!data.enabled && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#F2D1D3] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#C0272D]">
                <FiXCircle size={16} />
                This sustainability page is currently unpublished.
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#101E33]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <FaLeaf size={15} />
              {data.heroBadge}
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {data.heroTitle}
            </h1>

            <p className="mt-2 text-3xl font-bold leading-tight text-[#C0272D] sm:text-4xl lg:text-5xl">
              {data.heroHighlight}
            </p>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {data.heroDescription}
            </p>
          </div>

          <div>
            {data.heroImage ? (
              <img
                src={data.heroImage}
                alt="Sustainability"
                className="h-[360px] w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                <div className="text-center text-white/50">
                  <FaLeaf size={50} className="mx-auto" />

                  <p className="mt-4 text-sm">
                    Sustainability Image
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          OVERVIEW
      ======================================================== */}

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            {data.overviewImage ? (
              <img
                src={data.overviewImage}
                alt={data.overviewTitle}
                className="h-[420px] w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center rounded-3xl bg-[#EAF5EE]">
                <FaLeaf size={65} className="text-[#1B3A6B]" />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0272D]">
              Our Approach
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#101E33] sm:text-4xl">
              {data.overviewTitle}
            </h2>

            <p className="mt-6 text-base leading-8 text-[#6B7688]">
              {data.overviewDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          INITIATIVES
      ======================================================== */}

      <section className="bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0272D]">
              What We Focus On
            </p>

            <h2 className="mt-4 text-3xl font-bold text-[#101E33] sm:text-4xl">
              Sustainability initiatives
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.initiatives
              .filter((initiative) => initiative.enabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((initiative) => (
                <div
                  key={initiative.id}
                  className="rounded-3xl border border-[#E7E9EC] bg-[#FBFBF9] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5EE] text-[#1B3A6B]">
                    {getInitiativeIcon(initiative.icon)}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#101E33]">
                    {initiative.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#6B7688]">
                    {initiative.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          COMMITMENT
      ======================================================== */}

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-[#101E33] px-7 py-12 text-center sm:px-12 lg:px-20 lg:py-16">
          <FaLeaf size={35} className="mx-auto text-white" />

          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            {data.commitmentTitle}
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/70">
            {data.commitmentDescription}
          </p>
        </div>
      </section>

      {/* ========================================================
          ENVIRONMENT
      ======================================================== */}

      <section className="bg-[#EAF5EE] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0272D]">
              Environment
            </p>

            <h2 className="mt-4 text-3xl font-bold text-[#101E33] sm:text-4xl">
              {data.environmentTitle}
            </h2>

            <p className="mt-6 text-base leading-8 text-[#526071]">
              {data.environmentDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          RESPONSIBLE MANUFACTURING
      ======================================================== */}

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0272D]">
                Manufacturing
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[#101E33] sm:text-4xl">
                {data.responsibleManufacturingTitle}
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-[#6B7688]">
                {data.responsibleManufacturingDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FUTURE
      ======================================================== */}

      <section className="bg-[#101E33] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0272D]">
            Looking Ahead
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {data.futureTitle}
          </h2>

          <p className="mt-6 text-base leading-8 text-white/70">
            {data.futureDescription}
          </p>
        </div>
      </section>

      {/* ========================================================
          ADMIN — PAGE INFORMATION
      ======================================================== */}

      {isAdminView && (
        <section className="bg-[#FBFBF9] px-4 py-10 md:px-8 lg:px-10">
          <div className="mx-auto max-w-[1200px]">

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-bold text-[#101E33]">
                Page Information
              </h2>

              <div className="mt-5 grid gap-5 border-t border-[#E7E9EC] pt-5 sm:grid-cols-2 lg:grid-cols-4">

                {/* Status */}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                    Publishing Status
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm">
                    {data.enabled ? (
                      <>
                        <FiCheckCircle
                          size={15}
                          className="text-[#267044]"
                        />
                        <span className="font-semibold text-[#267044]">
                          Published
                        </span>
                      </>
                    ) : (
                      <>
                        <FiXCircle
                          size={15}
                          className="text-[#C0272D]"
                        />
                        <span className="font-semibold text-[#C0272D]">
                          Unpublished
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Public URL */}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                    Public URL
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-[#1B3A6B]">
                    /sustainability
                  </p>
                </div>

                {/* Created */}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                    Created At
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">
                    <FiCalendar size={15} />
                    {formatDate(data.createdAt)}
                  </div>
                </div>

                {/* Updated */}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                    Last Updated
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">
                    <FiCalendar size={15} />
                    {formatDate(data.updatedAt)}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions */}

            <div className="mt-6 flex flex-col gap-3 pb-4 sm:flex-row">

              <Link
                to="/admin/sustainability"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8DEE7] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] transition hover:bg-[#F4F7FB]"
              >
                <FiArrowLeft size={17} />
                Back to Sustainability
              </Link>

              <Link
                to={`/admin/sustainability/${data.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiEdit2 size={17} />
                Edit Sustainability
              </Link>

            </div>

          </div>
        </section>
      )}

    </div>
  );
}