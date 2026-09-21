import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  MessageStatus,
} from "../../types/message";

import {
  getMessages,
  updateMessage,
} from "../../data/messages";

/* =========================================================
   STATUS LABEL
========================================================= */

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
   TYPE LABEL
========================================================= */

function getTypeLabel(
  type: string
) {
  switch (type) {
    case "product":
      return "Product Enquiry";

    case "callback":
      return "Request Callback";

    default:
      return "General Contact";
  }
}

/* =========================================================
   MAIN
========================================================= */

export default function MessageDetail() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [message, setMessage] =
    useState<
      ReturnType<typeof getMessages>[number] | null
    >(null);

  const [status, setStatus] =
    useState<MessageStatus>("new");

  const [note, setNote] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  /* =======================================================
     LOAD MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!id) return;

    const messages =
      getMessages();

    const found =
      messages.find(
        (item) =>
          item.id === id
      );

    if (found) {
      setMessage(found);
      setStatus(found.status);
    }
  }, [id]);

  /* =======================================================
     SAVE
  ======================================================= */

  function saveChanges() {
    if (!message) return;

    const updatedMessage = {
      ...message,

      status,

      updatedAt:
        new Date().toISOString(),

      notes: note.trim()
        ? [
            ...message.notes,
            {
              id: `NOTE-${Date.now()}`,
              text: note.trim(),
              createdAt:
                new Date().toISOString(),
              createdBy: "Admin",
            },
          ]
        : message.notes,
    };

    updateMessage(
      updatedMessage
    );

    setMessage(
      updatedMessage
    );

    setNote("");

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!message) {
    return (
      <div className="mx-auto max-w-[1500px]">

        <div
          className="
            rounded-2xl
            border
            border-[#E5E8ED]
            bg-white
            p-10
            text-center
          "
        >

          <h2 className="font-sora text-lg font-semibold text-[#101E33]">
            Enquiry not found
          </h2>

          <p className="mt-2 text-sm text-[#8994A5]">
            The enquiry you are looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/messages"
              )
            }
            className="
              mt-5
              rounded-lg
              bg-[#C0272D]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              hover:bg-[#A91F25]
            "
          >
            Back to Messages
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px]">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-7">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/messages"
            )
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-[#7B8798]
            hover:text-[#C0272D]
          "
        >
          ← Back to Messages
        </button>

        <div
          className="
            flex
            flex-col
            justify-between
            gap-4
            sm:flex-row
            sm:items-end
          "
        >

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
              {getTypeLabel(
                message.type
              )}
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
              {message.subject}
            </h1>

            <p className="mt-2 text-sm text-[#7A8698]">
              {message.id} · Received{" "}
              {new Date(
                message.createdAt
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>

          </div>

          <span
            className={`
              inline-flex
              self-start
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-semibold
              sm:self-auto
              ${
                status === "new"
                  ? "bg-[#FCEBEC] text-[#C0272D]"
                  : status ===
                    "in_progress"
                  ? "bg-[#FFF5E8] text-[#B76A00]"
                  : status ===
                    "resolved"
                  ? "bg-[#EDF8F1] text-[#1E7A4C]"
                  : "bg-[#F1F3F6] text-[#7B8798]"
              }
            `}
          >
            {getStatusLabel(
              status
            )}
          </span>

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-[1.5fr_1fr]
        "
      >

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="space-y-6">

          {/* SENDER */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Sender details
            </h2>

            <p className="mt-1 text-xs text-[#8994A5]">
              Contact information provided by the customer.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Full name
                </p>

                <p className="mt-1.5 text-sm font-semibold text-[#101E33]">
                  {message.name}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Designation
                </p>

                <p className="mt-1.5 text-sm text-[#526075]">
                  {message.designation ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Email
                </p>

                <a
                  href={`mailto:${message.email}`}
                  className="mt-1.5 block text-sm font-medium text-[#1B3A6B] hover:underline"
                >
                  {message.email}
                </a>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Phone
                </p>

                <a
                  href={`tel:${message.phone}`}
                  className="mt-1.5 block text-sm font-medium text-[#1B3A6B] hover:underline"
                >
                  {message.phone}
                </a>
              </div>

            </div>

          </section>

          {/* COMPANY */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Company information
            </h2>

            <p className="mt-1 text-xs text-[#8994A5]">
              Business context associated with this enquiry.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Company
                </p>

                <p className="mt-1.5 text-sm font-semibold text-[#101E33]">
                  {message.company ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Industry
                </p>

                <p className="mt-1.5 text-sm text-[#526075]">
                  {message.industry ||
                    "—"}
                </p>
              </div>

            </div>

          </section>

          {/* ENQUIRY */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Enquiry details
            </h2>

            <p className="mt-1 text-xs text-[#8994A5]">
              Complete requirements submitted by the customer.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              {message.product && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                    Product
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-[#101E33]">
                    {message.product}
                  </p>
                </div>
              )}

              {message.quantity && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                    Approximate quantity
                  </p>

                  <p className="mt-1.5 text-sm text-[#526075]">
                    {message.quantity}
                  </p>
                </div>
              )}

            </div>

            {message.requirements && (
              <div className="mt-6">

                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                  Requirements
                </p>

                <div className="mt-2 rounded-xl bg-[#F7F8FA] p-4 text-sm leading-7 text-[#526075]">
                  {message.requirements}
                </div>

              </div>
            )}

            <div className="mt-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA3B1]">
                Message
              </p>

              <div className="mt-2 rounded-xl bg-[#F7F8FA] p-4 text-sm leading-7 text-[#526075]">
                {message.message}
              </div>

            </div>

          </section>

        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="space-y-6">

          {/* STATUS */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Workflow status
            </h2>

            <p className="mt-1 text-xs text-[#8994A5]">
              Update the current state of this enquiry.
            </p>

            <label
              htmlFor="message-status"
              className="mt-5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8994A5]"
            >
              Current status
            </label>

            <select
              id="message-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as MessageStatus
                )
              }
              className="
                mt-2
                h-11
                w-full
                rounded-lg
                border
                border-[#E4E8ED]
                bg-[#FBFCFD]
                px-3
                text-xs
                font-medium
                text-[#526075]
                outline-none
                focus:border-[#C0272D]
              "
            >

              <option value="new">
                New / Unread
              </option>

              <option value="in_progress">
                In Progress / Contacted
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="spam">
                Spam / Archive
              </option>

            </select>

          </section>

          {/* INTERNAL NOTES */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Internal notes
            </h2>

            <p className="mt-1 text-xs text-[#8994A5]">
              Notes are visible only to administrators.
            </p>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              placeholder="Add an internal note..."
              rows={5}
              className="
                mt-5
                w-full
                resize-none
                rounded-xl
                border
                border-[#E4E8ED]
                bg-[#FBFCFD]
                p-3
                text-xs
                leading-6
                text-[#526075]
                outline-none
                placeholder:text-[#A0A8B5]
                focus:border-[#C0272D]
                focus:bg-white
              "
            />

            {message.notes.length >
              0 && (
              <div className="mt-5 space-y-3">

                {message.notes.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#F7F8FA] p-3"
                    >

                      <p className="text-xs leading-5 text-[#526075]">
                        {item.text}
                      </p>

                      <p className="mt-2 text-[9px] text-[#9AA3B1]">
                        {item.createdBy} ·{" "}
                        {new Date(
                          item.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

            <button
              type="button"
              onClick={saveChanges}
              className="
                mt-4
                w-full
                rounded-lg
                bg-[#C0272D]
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition-all
                hover:bg-[#A91F25]
              "
            >
              Save Changes
            </button>

            {saved && (
              <p className="mt-3 text-center text-[10px] font-medium text-[#1E7A4C]">
                Changes saved successfully.
              </p>
            )}

          </section>

          {/* ACTIVITY */}

          <section
            className="
              rounded-2xl
              border
              border-[#E5E8ED]
              bg-white
              p-5
              sm:p-6
            "
          >

            <h2 className="font-sora text-base font-semibold text-[#101E33]">
              Activity
            </h2>

            <div className="mt-5 space-y-5">

              <div className="flex gap-3">

                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C0272D]" />

                <div>

                  <p className="text-xs font-medium text-[#526075]">
                    Enquiry received
                  </p>

                  <p className="mt-1 text-[10px] text-[#9AA3B1]">
                    {new Date(
                      message.createdAt
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>

              {message.updatedAt && (
                <div className="flex gap-3">

                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#B76A00]" />

                  <div>

                    <p className="text-xs font-medium text-[#526075]">
                      Enquiry updated
                    </p>

                    <p className="mt-1 text-[10px] text-[#9AA3B1]">
                      {new Date(
                        message.updatedAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </div>
              )}

              {message.notes.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >

                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1E7A4C]" />

                    <div>

                      <p className="text-xs font-medium text-[#526075]">
                        Internal note added
                      </p>

                      <p className="mt-1 text-[10px] text-[#9AA3B1]">
                        {item.createdBy} ·{" "}
                        {new Date(
                          item.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}