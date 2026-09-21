import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { getUnreadMessageCount } from "../../utils/messageStorage";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: "dashboard",
      },
    ],
  },

  {
    label: "Website",
    items: [
      {
        name: "Products",
        path: "/admin/products",
        icon: "box",
      },
      {
        name: "Machinery",
        path: "/admin/machinery",
        icon: "machine",
      },
      {
        name: "Industries",
        path: "/admin/industries",
        icon: "industry",
      },
      {
        name: "Manufacturing Process",
        path: "/admin/manufacturing-process",
        icon: "process",
      },
      {
        name: "Sustainability",
        path: "/admin/sustainability",
        icon: "leaf",
      },
      {
        name: "Career",
        path: "/admin/career",
        icon: "briefcase",
      },
    ],
  },

  {
    label: "Communication",
    items: [
      {
        name: "Messages",
        path: "/admin/messages",
        icon: "message",
      },
    ],
  },
];

function MenuIcon({ type }: { type: string }) {
  const common = "h-[18px] w-[18px] shrink-0";

  switch (type) {
    case "dashboard":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "box":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m21 8-9 5-9-5" />
          <path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z" />
          <path d="M12 13v8" />
        </svg>
      );

    case "machine":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h5M8 17h3" />
          <circle cx="17" cy="15" r="1" />
        </svg>
      );

    case "industry":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M3 21V8l6 3V6l6 3V4h6v17" />
          <path d="M7 21v-4h3v4M14 21v-4h3v4M19 21v-4" />
        </svg>
      );

    case "process":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3a2 2 0 0 0 2 2h4" />
          <path d="M18 9v3a2 2 0 0 1-2 2h-4" />
        </svg>
      );

    case "leaf":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20 4C11 4 5 7 5 14c0 3 2 5 5 5 7 0 10-6 10-15Z" />
          <path d="M4 21c3-5 7-8 13-11" />
        </svg>
      );

    case "briefcase":
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );

    case "message":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-7.5A7.5 7.5 0 0 1 10.5 7h2A7.5 7.5 0 0 1 20 11.5Z" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Load the current number of new messages.
   */
  const loadUnreadCount = () => {
    setUnreadCount(getUnreadMessageCount());
  };

  useEffect(() => {
    loadUnreadCount();

    /**
     * When localStorage changes from another tab,
     * update the sidebar count.
     */
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "sunraj_admin_messages") {
        loadUnreadCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    /**
     * Custom event for changes made inside
     * the current browser tab.
     */
    const handleMessagesUpdated = () => {
      loadUnreadCount();
    };

    window.addEventListener(
      "sunraj-messages-updated",
      handleMessagesUpdated
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sunraj-messages-updated",
        handleMessagesUpdated
      );
    };
  }, []);

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-[#101E33]/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[230px]
          flex-col
          border-r
          border-[#E5E8ED]
          bg-white
          transition-transform
          duration-300

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =====================================================
            LOGO
        ====================================================== */}

        <div className="flex h-[82px] items-center border-b border-[#EEF0F3] px-5">
          <div className="flex flex-col items-start">
            <div className="flex h-[42px] w-[150px] items-center justify-start overflow-hidden">
              <img
                src={logo}
                alt="Sunraj Logo"
                className="block h-full w-full object-contain object-left"
              />
            </div>

            <p
              className="
                mt-1
                text-[12px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#8994A5]
              "
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.label} className="mb-6 last:mb-0">
              <p
                className="
                  mb-2
                  px-3
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#9AA3B1]
                "
              >
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-[13px]
                        font-medium
                        transition-all

                        ${
                          isActive
                            ? "bg-[#FCEBEC] font-semibold text-[#C0272D]"
                            : "text-[#637086] hover:bg-[#F7F8FA] hover:text-[#101E33]"
                        }
                      `
                    }
                  >
                    {() => (
                      <>
                        {/* Icon */}

                        <MenuIcon type={item.icon} />

                        {/* Name */}

                        <span className="truncate">{item.name}</span>

                        {/* =================================================
                            MESSAGE COUNT
                            Only display when count > 0
                        ================================================== */}

                        {item.name === "Messages" && unreadCount > 0 && (
                          <span
                            className="
                              ml-auto
                              flex
                              h-5
                              min-w-5
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[#C0272D]
                              px-1.5
                              text-[9px]
                              font-bold
                              text-white
                            "
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* =====================================================
            BOTTOM HELP BOX
        ====================================================== */}

        <div className="border-t border-[#EEF0F3] p-3">
          <div className="rounded-xl bg-[#F7F8FA] p-3">
            <p className="text-[11px] font-semibold text-[#101E33]">
              Need help?
            </p>

            <p className="mt-1 text-[10px] leading-4 text-[#8A95A5]">
              Contact the system administrator.
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MOBILE MENU BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className="
          fixed
          left-4
          top-4
          z-30
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-[#E5E8ED]
          bg-white
          text-[#101E33]
          shadow-sm
          lg:hidden
        "
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}