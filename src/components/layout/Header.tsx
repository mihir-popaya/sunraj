import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { getUnreadMessageCount } from "../../utils/messageStorage";
import { logout as logoutApi } from "../../services/auth.api";

export default function Header() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const user = useAuthStore((state) => state.user);

  const clearAuth = useAuthStore(
    (state) => state.clearAuth
  );

  /**
   * =========================================================
   * LOAD UNREAD MESSAGE COUNT
   * =========================================================
   */
  const loadUnreadCount = () => {
    setUnreadCount(getUnreadMessageCount());
  };

  /**
   * =========================================================
   * MESSAGE NOTIFICATION LISTENERS
   * =========================================================
   */
  useEffect(() => {
    loadUnreadCount();

    /**
     * Changes made from another browser tab.
     */
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "sunraj_admin_messages") {
        loadUnreadCount();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    /**
     * Changes made inside the current browser tab.
     */
    const handleMessagesUpdated = () => {
      loadUnreadCount();
    };

    window.addEventListener(
      "sunraj-messages-updated",
      handleMessagesUpdated
    );

    /**
     * Cleanup listeners.
     */
    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "sunraj-messages-updated",
        handleMessagesUpdated
      );
    };
  }, []);

  /**
   * =========================================================
   * CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
   * =========================================================
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    /**
     * Cleanup listener.
     */
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /**
   * =========================================================
   * LOGOUT
   *
   * 1. Call backend logout API
   * 2. Clear Zustand authentication state
   * 3. Redirect to login page
   * =========================================================
   */
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuth();

      navigate("/login", {
        replace: true,
      });
    }
  };

  /**
   * =========================================================
   * NOTIFICATION CLICK
   * =========================================================
   */
  const handleNotificationClick = () => {
    navigate("/admin/messages");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-20
        flex
        h-[82px]
        items-center
        justify-between
        border-b
        border-[#E5E8ED]
        bg-white/95
        px-4
        backdrop-blur
        sm:px-6
        lg:px-8
      "
    >
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="pl-14 lg:pl-0">
        <p
          className="
            hidden
            text-base
            font-extrabold
            uppercase
            tracking-[0.14em]
            text-[#101E33]
            sm:block
          "
        >
          Sunraj Corrugators
        </p>

        <p className="text-sm font-semibold text-[#9AA3B1] sm:mt-0.5">
          Administration
        </p>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex items-center gap-3">

        {/* =================================================
            NOTIFICATION BELL
        ================================================== */}

        <button
          type="button"
          onClick={handleNotificationClick}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} new messages`
              : "No new messages"
          }
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-[#E5E8ED]
            text-[#647086]
            transition
            hover:bg-[#F7F8FA]
            hover:text-[#101E33]
          "
        >
          {/* Bell icon */}

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {/* Notification badge */}

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                h-[18px]
                min-w-[18px]
                items-center
                justify-center
                rounded-full
                border-2
                border-white
                bg-[#C0272D]
                px-1
                text-[9px]
                font-bold
                leading-none
                text-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        {/* =================================================
            VERTICAL SEPARATOR
        ================================================== */}

        <div className="hidden h-8 w-px bg-[#E5E8ED] sm:block" />

        {/* =================================================
            USER CONTEXT
        ================================================== */}

        <div
          className="relative"
          ref={dropdownRef}
        >
          <button
            type="button"
            onClick={() =>
              setIsDropdownOpen(!isDropdownOpen)
            }
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              p-1.5
              pr-2
              transition
              hover:bg-[#F7F8FA]
              ${
                isDropdownOpen
                  ? "bg-[#F7F8FA]"
                  : ""
              }
            `}
          >
            {/* Avatar */}

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#EAF0F8]
                text-sm
                font-bold
                text-[#1B3A6B]
              "
            >
              {user?.full_name
                ?.charAt(0)
                .toUpperCase() || "A"}
            </div>

            {/* User information */}

            <div className="hidden text-left sm:block">
              <p className="text-[17px] font-semibold text-[#101E33]">
                {user?.full_name || "Administrator"}
              </p>

              <p className="mt-0.5 text-[13px] text-[#8A95A5]">
                {user?.role?.role_name || "Administrator"}
              </p>
            </div>

            {/* Chevron */}

            <svg
              className={`
                hidden
                h-3.5
                w-3.5
                text-[#8A95A5]
                transition-transform
                duration-200
                sm:block
                ${
                  isDropdownOpen
                    ? "rotate-180"
                    : ""
                }
              `}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* =================================================
              LOGOUT DROPDOWN
          ================================================== */}

          {isDropdownOpen && (
            <div
              className="
                absolute
                right-0
                mt-2
                w-48
                origin-top-right
                rounded-xl
                border
                border-[#E5E8ED]
                bg-white
                p-1.5
                shadow-lg
                ring-1
                ring-black/5
                focus:outline-none
              "
            >
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-lg
                  px-3
                  py-2
                  text-left
                  text-xs
                  font-medium
                  text-[#C0272D]
                  transition
                  hover:bg-[#FFF5F5]
                "
              >
                {/* Logout icon */}

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

                  <polyline points="16 17 21 12 16 7" />

                  <line
                    x1="21"
                    y1="12"
                    x2="9"
                    y2="12"
                  />
                </svg>

                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}