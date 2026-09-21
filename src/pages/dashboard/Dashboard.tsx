// src/pages/dashboard/Dashboard.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiExternalLink,
  FiGitBranch,
  FiGlobe,
  FiMail,
  FiMessageSquare,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { Link, useLocation } from "react-router-dom";

import { getProducts } from "../../services/product.api";
import { getMachinery } from "../../services/machinery.api";
import { getIndustries } from "../../services/industry.api";
import { getManufacturingProcesses } from "../../services/manufacturingProcess.api";
import { getSustainability } from "../../services/sustainability.api";
import { getMessages } from "../../services/message.api";

import type { ProductItem } from "../../types/product";
import type { MachineryItem } from "../../types/machinery";
import type { IndustryItem } from "../../types/industry";
import type { ManufacturingProcessItem } from "../../types/manufacturingProcess";
import type { SustainabilityData } from "../../types/sustainability";
import type { Message } from "../../types/message";

/* =========================================================
   TYPES
========================================================= */

interface DashboardData {
  products: ProductItem[];
  machinery: MachineryItem[];
  industries: IndustryItem[];
  manufacturingProcesses: ManufacturingProcessItem[];
  sustainability: SustainabilityData | null;
  messages: Message[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  href?: string;
}

interface QuickActionProps {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
}

interface ModuleCardProps {
  to: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}

interface ContentHealthItem {
  title: string;
  count: number;
  enabled: number;
  healthy: boolean;
  href: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(dateString: string): string {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(dateString: string): string {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const difference = Date.now() - date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return formatDateTime(dateString);
}

function getMessageTimestamp(message: Message): string {
  return message.updatedAt ?? message.createdAt;
}

/* =========================================================
   STATISTICS CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  valueColor = "#101E33",
  href,
}: StatCardProps) {
  const card = (
    <div
      className="
        group
        h-full
        rounded-2xl
        border
        border-[#E7E9EC]
        bg-white
        p-5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_10px_30px_rgba(16,30,51,0.08)]
      "
    >
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-2">
          <p className="text-lg font-bold leading-6 text-[#101E33]">
            {title}
          </p>

          <p
            className="mt-2 text-3xl font-bold leading-none"
            style={{ color: valueColor }}
          >
            {value}
          </p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
          "
          style={{
            backgroundColor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-sm font-normal leading-5 text-[#8994A5]">
        {subtitle}
      </p>

      {href && (
        <div
          className="
            mt-3
            flex
            items-center
            gap-1
            text-sm
            font-semibold
            leading-5
            text-[#1B3A6B]
            transition
          "
        >
          Manage

          <FiArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      )}
    </div>
  );

  if (!href) {
    return card;
  }

  return (
    <Link to={href} className="block h-full">
      {card}
    </Link>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  actionText,
  actionHref,
}: {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}) {
  return (
    <div
      className="
        mb-5
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <h2 className="text-xl font-bold leading-7 text-[#101E33]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm font-normal leading-5 text-[#6B7688]">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="
            inline-flex
            items-center
            gap-2
            self-start
            rounded-lg
            border
            border-[#E7E9EC]
            bg-white
            px-3
            py-2
            text-sm
            font-semibold
            leading-5
            text-[#1B3A6B]
            transition
            hover:border-[#1B3A6B]
            hover:bg-[#F7F9FC]
          "
        >
          {actionText}

          <FiArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  to,
  title,
  subtitle,
  icon,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-[#E7E9EC]
        bg-white
        p-4
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#1B3A6B]
        hover:shadow-[0_8px_24px_rgba(16,30,51,0.07)]
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#EEF3FA]
            text-[#1B3A6B]
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-5 text-[#101E33]">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-normal leading-5 text-[#6B7688]">
            {subtitle}
          </p>
        </div>
      </div>

      <FiArrowRight
        size={17}
        className="
          shrink-0
          text-[#8994A5]
          transition
          group-hover:translate-x-1
          group-hover:text-[#1B3A6B]
        "
      />
    </Link>
  );
}

/* =========================================================
   MODULE CARD
========================================================= */

function ModuleCard({
  to,
  title,
  value,
  subtitle,
  icon,
}: ModuleCardProps) {
  return (
    <Link
      to={to}
      className="
        group
        rounded-2xl
        border
        border-[#E7E9EC]
        bg-white
        p-5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#1B3A6B]
        hover:shadow-[0_8px_24px_rgba(16,30,51,0.07)]
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-[#EEF3FA]
            text-[#1B3A6B]
          "
        >
          {icon}
        </div>

        <FiArrowRight
          size={17}
          className="
            text-[#8994A5]
            transition
            group-hover:translate-x-1
            group-hover:text-[#1B3A6B]
          "
        />
      </div>

      <p className="mt-4 text-xl font-bold leading-6 text-[#101E33]">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold leading-8 text-[#1B3A6B]">
        {value}
      </p>

      <p className="mt-2 text-sm font-normal leading-5 text-[#6B7688]">
        {subtitle}
      </p>
    </Link>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1.5
        text-xs
        font-bold
        leading-4
        ${
          enabled
            ? "bg-[#EAF7EE] text-[#267044]"
            : "bg-[#FFF0F0] text-[#C0272D]"
        }
      `}
    >
      {enabled ? (
        <FiCheckCircle size={13} />
      ) : (
        <FiXCircle size={13} />
      )}

      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const location = useLocation();

  const [data, setData] = useState<DashboardData>({
    products: [],
    machinery: [],
    industries: [],
    manufacturingProcesses: [],
    sustainability: null,
    messages: [],
  });

  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /* =======================================================
     LOAD DASHBOARD DATA (ASYNC FIX FOR ts(2740))
  ======================================================= */

const loadDashboard = useCallback(async () => {
    setLoading(true);

    // Safe array extraction helper
    const extractArray = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data?.items)) return res.data.items;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.items)) return res.items;
      return [];
    };

    try {
      // Use Promise.resolve() to safely handle both Promises and non-Promise returns
      const [
        productsRes,
        machineryRes,
        industriesRes,
        manufacturingProcessesRes,
        sustainabilityRes,
        messagesRes,
      ] = await Promise.all([
        Promise.resolve(getProducts()).catch(() => []),
        Promise.resolve(getMachinery()).catch(() => []),
        Promise.resolve(getIndustries()).catch(() => []),
        Promise.resolve(getManufacturingProcesses()).catch(() => []),
        Promise.resolve(getSustainability()).catch(() => null),
        Promise.resolve(getMessages()).catch(() => []),
      ]);

      setData({
        products: extractArray(productsRes),
        machinery: extractArray(machineryRes),
        industries: extractArray(industriesRes),
        manufacturingProcesses: extractArray(manufacturingProcessesRes),
        sustainability: sustainabilityRes ?? null,
        messages: extractArray(messagesRes),
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     RELOAD WHEN DASHBOARD ROUTE OPENS
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [location.pathname, loadDashboard]);

  /* =======================================================
     RELOAD WHEN WINDOW GETS FOCUS
  ======================================================= */

  useEffect(() => {
    const handleFocus = () => {
      loadDashboard();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadDashboard]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const productsArr = Array.isArray(data.products) ? data.products : [];
    const machineryArr = Array.isArray(data.machinery) ? data.machinery : [];
    const industriesArr = Array.isArray(data.industries) ? data.industries : [];
    const processesArr = Array.isArray(data.manufacturingProcesses) ? data.manufacturingProcesses : [];
    const messagesArr = Array.isArray(data.messages) ? data.messages : [];

    const totalProducts = productsArr.length;
    const enabledProducts = productsArr.filter((item) => item?.enabled).length;
    const disabledProducts = totalProducts - enabledProducts;

    const totalMachinery = machineryArr.length;
    const enabledMachinery = machineryArr.filter((item) => item?.enabled).length;
    const disabledMachinery = totalMachinery - enabledMachinery;

    const totalIndustries = industriesArr.length;
    const enabledIndustries = industriesArr.filter((item) => item?.enabled).length;
    const disabledIndustries = totalIndustries - enabledIndustries;

    const totalProcesses = processesArr.length;
    const enabledProcesses = processesArr.filter((item) => item?.enabled).length;
    const disabledProcesses = totalProcesses - enabledProcesses;

    const totalMessages = messagesArr.length;
    const newMessages = messagesArr.filter((item) => item?.status === "new").length;
    const inProgressMessages = messagesArr.filter((item) => item?.status === "in_progress").length;
    const resolvedMessages = messagesArr.filter((item) => item?.status === "resolved").length;
    const spamMessages = messagesArr.filter((item) => item?.status === "spam").length;

    return {
      totalProducts,
      enabledProducts,
      disabledProducts,

      totalMachinery,
      enabledMachinery,
      disabledMachinery,

      totalIndustries,
      enabledIndustries,
      disabledIndustries,

      totalProcesses,
      enabledProcesses,
      disabledProcesses,

      totalMessages,
      newMessages,
      inProgressMessages,
      resolvedMessages,
      spamMessages,
    };
  }, [data]);

  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

const recentActivity = useMemo(() => {
  const productsArr = Array.isArray(data?.products) ? data.products : [];
  const machineryArr = Array.isArray(data?.machinery) ? data.machinery : [];
  const industriesArr = Array.isArray(data?.industries) ? data.industries : [];
  const processesArr = Array.isArray(data?.manufacturingProcesses)
    ? data.manufacturingProcesses
    : [];
  const messagesArr = Array.isArray(data?.messages) ? data.messages : [];

  const activities = [
    ...productsArr.map((item) => ({
      id: `product-${item.id}`,
      title: item.name ?? "Untitled Product",
      type: "Product",
      updatedAt: item.updatedAt || new Date().toISOString(),
      href: `/admin/products/${item.id}/view`,
      icon: <FiPackage size={17} />,
    })),

    ...machineryArr.map((item) => ({
      id: `machinery-${item.id}`,
      title: item.name ?? "Untitled Machinery",
      type: "Machinery",
      updatedAt: item.updatedAt || new Date().toISOString(),
      href: `/admin/machinery/${item.id}/view`,
      icon: <FiCpu size={17} />,
    })),

    ...industriesArr.map((item) => ({
      id: `industry-${item.id}`,
      title: item.name ?? "Untitled Industry",
      type: "Industry",
      updatedAt: item.updatedAt || new Date().toISOString(),
      href: `/admin/industries/${item.id}/view`,
      icon: <FiGlobe size={17} />,
    })),

    ...processesArr.map((item) => ({
      id: `process-${item.id}`,
      title: item.title ?? "Untitled Process",
      type: "Manufacturing Process",
      updatedAt: item.updatedAt || new Date().toISOString(),
      href: `/admin/manufacturing-process/${item.id}/view`,
      icon: <FiGitBranch size={17} />,
    })),

    ...messagesArr.map((item) => ({
      id: `message-${item.id}`,
      title: item.subject || item.name || "Untitled Message",
      type: "Message",
      updatedAt: getMessageTimestamp(item) || new Date().toISOString(),
      href: `/admin/messages/${item.id}`,
      icon: <FiMail size={17} />,
    })),

    ...(data?.sustainability
      ? [
          {
            id: `sustainability-${data.sustainability.id}`,
            title: "Sustainability page",
            type: "Sustainability",
            updatedAt: data.sustainability.updatedAt || new Date().toISOString(),
            href: `/admin/sustainability/${data.sustainability.id}/view`,
            icon: <FiTrendingUp size={17} />,
          },
        ]
      : []),
  ];

  return activities
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 8);
}, [data]);

  /* =======================================================
     CONTENT HEALTH
  ======================================================= */

  const contentHealth = useMemo<ContentHealthItem[]>(() => {
    return [
      {
        title: "Products",
        count: statistics.totalProducts,
        enabled: statistics.enabledProducts,
        healthy: statistics.totalProducts > 0,
        href: "/admin/products",
      },

      {
        title: "Machinery",
        count: statistics.totalMachinery,
        enabled: statistics.enabledMachinery,
        healthy: statistics.totalMachinery > 0,
        href: "/admin/machinery",
      },

      {
        title: "Industries",
        count: statistics.totalIndustries,
        enabled: statistics.enabledIndustries,
        healthy: statistics.totalIndustries > 0,
        href: "/admin/industries",
      },

      {
        title: "Manufacturing Process",
        count: statistics.totalProcesses,
        enabled: statistics.enabledProcesses,
        healthy: statistics.totalProcesses > 0,
        href: "/admin/manufacturing-process",
      },

      {
        title: "Sustainability",
        count: data.sustainability ? 1 : 0,
        enabled: data.sustainability?.enabled ? 1 : 0,
        healthy:
          data.sustainability !== null && Boolean(data.sustainability.enabled),
        href: "/admin/sustainability",
      },
    ];
  }, [data, statistics]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    (!data.products || data.products.length === 0) &&
    (!data.machinery || data.machinery.length === 0) &&
    (!data.industries || data.industries.length === 0)
  ) {
    return (
      <div className="min-h-full bg-[#EEF3FA]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div
                className="
                  mx-auto
                  h-10
                  w-10
                  animate-spin
                  rounded-full
                  border-2
                  border-[#E7E9EC]
                  border-t-[#1B3A6B]
                "
              />

              <p className="mt-4 text-sm font-medium text-[#6B7688]">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div
      className="
        -m-6
        min-h-[calc(100vh-72px)]
        bg-[#EEF3FA]
        lg:-m-8
      "
    >
      <div
        className="
          mx-auto
          max-w-[1400px]
          px-4
          py-7
          sm:px-6
          lg:px-8
        "
      >
        {/* PAGE HEADER */}
        <div
          className="
            mb-8
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#EEF3FA]
                text-[#1B3A6B]
              "
            >
              <FiActivity size={22} />
            </div>

            <div>
              <h1
                className="
                  font-sora
                  text-2xl
                  font-bold
                  leading-tight
                  tracking-[-0.02em]
                  text-[#101E33]
                  sm:text-3xl
                "
              >
                Dashboard
              </h1>

              <p className="mt-1.5 text-sm font-normal leading-6 text-[#6B7688]">
                Overview of your website content, publishing status and latest CMS
                activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-[#E7E9EC]
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-[#6B7688]
                  sm:flex
                "
              >
                <FiClock size={14} />

                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-[#E7E9EC]
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                leading-5
                text-[#101E33]
                transition
                hover:border-[#1B3A6B]
                hover:text-[#1B3A6B]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiRefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* MAIN STATISTICS */}
        <section className="mb-9">
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-5
            "
          >
            <StatCard
              title="Total Products"
              value={statistics.totalProducts}
              subtitle="All product records"
              icon={<FiPackage size={20} />}
              iconBg="#EEF3FA"
              iconColor="#1B3A6B"
              href="/admin/products"
            />

            <StatCard
              title="Total Machinery"
              value={statistics.totalMachinery}
              subtitle="All machinery records"
              icon={<FiCpu size={20} />}
              iconBg="#EEF3FA"
              iconColor="#1B3A6B"
              href="/admin/machinery"
            />

            <StatCard
              title="Total Industries"
              value={statistics.totalIndustries}
              subtitle="All industry records"
              icon={<FiGlobe size={20} />}
              iconBg="#EEF3FA"
              iconColor="#1B3A6B"
              href="/admin/industries"
            />

            <StatCard
              title="Process Steps"
              value={statistics.totalProcesses}
              subtitle="Manufacturing process steps"
              icon={<FiGitBranch size={20} />}
              iconBg="#EEF3FA"
              iconColor="#1B3A6B"
              href="/admin/manufacturing-process"
            />

            <StatCard
              title="New Messages"
              value={statistics.newMessages}
              subtitle={`${statistics.totalMessages} total enquiries`}
              icon={<FiMail size={20} />}
              iconBg="#FFF0F0"
              iconColor="#C0272D"
              valueColor="#C0272D"
              href="/admin/messages"
            />
          </div>
        </section>

        {/* PUBLISHING STATUS */}
        <section className="mb-9">
          <SectionHeader
            title="Publishing Status"
            description="Overview of enabled and disabled website content."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    Products
                  </p>

                  <p className="mt-2 text-3xl font-bold leading-8 text-[#1B3A6B]">
                    {statistics.enabledProducts}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
                  <FiCheckCircle size={20} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-normal leading-5 text-[#8994A5]">
                  {statistics.enabledProducts} enabled ·{" "}
                  {statistics.disabledProducts} disabled
                </p>
                <StatusBadge enabled={statistics.enabledProducts > 0} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    Machinery
                  </p>

                  <p className="mt-2 text-3xl font-bold leading-8 text-[#1B3A6B]">
                    {statistics.enabledMachinery}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
                  <FiCheckCircle size={20} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-normal leading-5 text-[#8994A5]">
                  {statistics.enabledMachinery} enabled ·{" "}
                  {statistics.disabledMachinery} disabled
                </p>
                <StatusBadge enabled={statistics.enabledMachinery > 0} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    Industries
                  </p>

                  <p className="mt-2 text-3xl font-bold leading-8 text-[#1B3A6B]">
                    {statistics.enabledIndustries}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
                  <FiCheckCircle size={20} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-normal leading-5 text-[#8994A5]">
                  {statistics.enabledIndustries} enabled ·{" "}
                  {statistics.disabledIndustries} disabled
                </p>
                <StatusBadge enabled={statistics.enabledIndustries > 0} />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-9">
          <SectionHeader
            title="Quick Actions"
            description="Create and manage website content quickly."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <QuickAction
              to="/admin/products/new"
              title="Add Product"
              subtitle="Create new product"
              icon={<FiPlus size={19} />}
            />

            <QuickAction
              to="/admin/machinery/new"
              title="Add Machinery"
              subtitle="Add machine details"
              icon={<FiPlus size={19} />}
            />

            <QuickAction
              to="/admin/manufacturing-process/new"
              title="Add Process Step"
              subtitle="Manage production flow"
              icon={<FiPlus size={19} />}
            />

            <QuickAction
              to="/admin/messages"
              title="View Messages"
              subtitle="Check enquiries"
              icon={<FiMessageSquare size={19} />}
            />
          </div>
        </section>

        {/* RECENT ACTIVITY + CONTENT HEALTH */}
        <div
          className="
            grid
            grid-cols-1
            gap-6
            xl:grid-cols-[1.35fr_1fr]
          "
        >
          {/* RECENT ACTIVITY */}
          <section>
            <SectionHeader
              title="Recent CMS Activity"
              description="Latest updates across your admin panel."
            />

            <div className="overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white">
              {recentActivity.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3FA] text-[#6B7688]">
                    <FiActivity size={20} />
                  </div>

                  <p className="mt-4 text-lg font-bold text-[#101E33]">
                    No recent activity
                  </p>

                  <p className="mt-1 text-sm font-normal text-[#6B7688]">
                    CMS updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E9EC]">
                  {recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      to={activity.href}
                      className="
                        group
                        flex
                        items-center
                        gap-4
                        px-5
                        py-4
                        transition
                        hover:bg-[#FCFCFB]
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#EEF3FA]
                          text-[#1B3A6B]
                        "
                      >
                        {activity.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold leading-5 text-[#101E33]">
                            {activity.title}
                          </p>

                          <span
                            className="
                              rounded-full
                              bg-[#F2F4F7]
                              px-2.5
                              py-1
                              text-xs
                              font-bold
                              leading-4
                              text-[#536071]
                            "
                          >
                            {activity.type}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-normal leading-5 text-[#6B7688]">
                          Updated {getRelativeTime(activity.updatedAt)}
                        </p>
                      </div>

                      <FiExternalLink
                        size={16}
                        className="
                          shrink-0
                          text-[#8994A5]
                          transition
                          group-hover:text-[#1B3A6B]
                        "
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CONTENT HEALTH */}
          <section>
            <SectionHeader
              title="Content Health"
              description="Publishing status of CMS modules."
            />

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="space-y-4">
                {contentHealth.map((item) => {
                  const percentage =
                    item.count > 0
                      ? Math.min(100, (item.enabled / item.count) * 100)
                      : 0;

                  return (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="
                        group
                        block
                        rounded-xl
                        border
                        border-[#E7E9EC]
                        p-4
                        transition
                        hover:border-[#1B3A6B]
                        hover:bg-[#FCFCFB]
                      "
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold leading-5 text-[#101E33]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-sm font-normal leading-5 text-[#6B7688]">
                            {item.enabled} enabled
                            {item.count !== item.enabled &&
                              ` · ${item.count - item.enabled} disabled`}
                          </p>
                        </div>

                        {item.healthy ? (
                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#EAF7EE]
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-[#267044]
                            "
                          >
                            <FiCheckCircle size={13} />
                            Healthy
                          </span>
                        ) : (
                          <span
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#FFF0F0]
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-[#C0272D]
                            "
                          >
                            <FiXCircle size={13} />
                            Needs attention
                          </span>
                        )}
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEF0F3]">
                        <div
                          className="h-full rounded-full bg-[#1B3A6B] transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ENQUIRY STATUS */}
        <section className="mt-9">
          <SectionHeader
            title="Enquiry Overview"
            description="Current status of customer enquiries and messages."
            actionText="View Messages"
            actionHref="/admin/messages"
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    New
                  </p>

                  <p className="mt-2 text-4xl font-bold leading-none text-[#C0272D]">
                    {statistics.newMessages}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#C0272D]">
                  <FiMail size={20} />
                </div>
              </div>

              <p className="mt-3 text-sm font-normal leading-5 text-[#8994A5]">
                Awaiting admin action
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    In Progress
                  </p>

                  <p className="mt-2 text-4xl font-bold leading-none text-[#B76A00]">
                    {statistics.inProgressMessages}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF6E5] text-[#B76A00]">
                  <FiClock size={20} />
                </div>
              </div>

              <p className="mt-3 text-sm font-normal leading-5 text-[#8994A5]">
                Currently being handled
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    Resolved
                  </p>

                  <p className="mt-2 text-4xl font-bold leading-none text-[#267044]">
                    {statistics.resolvedMessages}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#267044]">
                  <FiCheckCircle size={20} />
                </div>
              </div>

              <p className="mt-3 text-sm font-normal leading-5 text-[#8994A5]">
                Successfully completed
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7E9EC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold leading-6 text-[#101E33]">
                    Spam
                  </p>

                  <p className="mt-2 text-4xl font-bold leading-none text-[#6B7688]">
                    {statistics.spamMessages}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2F3F5] text-[#6B7688]">
                  <FiAlertTriangle size={20} />
                </div>
              </div>

              <p className="mt-3 text-sm font-normal leading-5 text-[#8994A5]">
                Filtered messages
              </p>
            </div>
          </div>
        </section>

        {/* WEBSITE CONTENT OVERVIEW */}
        <section className="mt-9">
          <SectionHeader
            title="Website Content Overview"
            description="Quick access to all CMS-managed website modules."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <ModuleCard
              to="/admin/products"
              title="Products"
              value={statistics.totalProducts}
              subtitle={`${statistics.enabledProducts} published`}
              icon={<FiBox size={20} />}
            />

            <ModuleCard
              to="/admin/machinery"
              title="Machinery"
              value={statistics.totalMachinery}
              subtitle={`${statistics.enabledMachinery} published`}
              icon={<FiSettings size={20} />}
            />

            <ModuleCard
              to="/admin/industries"
              title="Industries"
              value={statistics.totalIndustries}
              subtitle={`${statistics.enabledIndustries} published`}
              icon={<FiUsers size={20} />}
            />

            <ModuleCard
              to="/admin/manufacturing-process"
              title="Manufacturing Process"
              value={statistics.totalProcesses}
              subtitle={`${statistics.enabledProcesses} published`}
              icon={<FiGitBranch size={20} />}
            />

            <ModuleCard
              to="/admin/sustainability"
              title="Sustainability"
              value={data.sustainability ? "1" : "0"}
              subtitle={
                data.sustainability?.enabled
                  ? "Published"
                  : "Not published"
              }
              icon={<FiTrendingUp size={20} />}
            />

            <ModuleCard
              to="/admin/messages"
              title="Messages"
              value={statistics.totalMessages}
              subtitle={
                statistics.newMessages > 0
                  ? `${statistics.newMessages} new enquiries`
                  : "No new enquiries"
              }
              icon={<FiMessageSquare size={20} />}
            />
          </div>
        </section>

        {/* FOOTER */}
        <div
          className="
            mt-9
            flex
            flex-col
            gap-2
            border-t
            border-[#E7E9EC]
            py-6
            text-sm
            font-normal
            leading-5
            text-[#6B7688]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="font-medium">Sunraj CMS Dashboard</p>

          <p>Content is currently managed through your CMS services.</p>
        </div>
      </div>
    </div>
  );
}