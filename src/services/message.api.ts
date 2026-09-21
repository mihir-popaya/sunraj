import type {
  InternalNote,
  Message,
  MessageStatus,
  MessageType,
} from "../types/message";

const STORAGE_KEY = "sunraj_messages";

/* =========================================================
   ID GENERATOR
========================================================= */

function generateId(): string {
  return `MSG-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

/* =========================================================
   SEED DATA
   ---------------------------------------------------------
   Shown only the very first time the admin panel loads (no
   messages saved yet), so the Messages screen and Dashboard
   aren't empty during setup/demo. Safe to delete anytime —
   once real enquiries come in, this seed data is just
   regular rows the admin can remove.
========================================================= */

function createSeedMessages(): Message[] {
  const now = Date.now();

  const daysAgo = (days: number) =>
    new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: generateId(),
      name: "Rohan Mehta",
      designation: "Procurement Manager",
      email: "rohan.mehta@example.com",
      phone: "+91 98765 43210",
      company: "Vertex Textiles Pvt. Ltd.",
      industry: "Textiles",
      type: "product",
      subject: "Bulk enquiry for heavy-duty corrugated boxes",
      product: "5-Ply Heavy Duty Corrugated Boxes",
      quantity: "10,000 units / month",
      requirements:
        "Need boxes rated for 25kg load, moisture-resistant coating, custom branding print.",
      message:
        "We are looking for a reliable long-term supplier for our export packaging. Please share pricing and lead time for the above specification.",
      status: "new",
      createdAt: daysAgo(0.2),
      notes: [],
    },
    {
      id: generateId(),
      name: "Ayesha Khan",
      designation: "",
      email: "ayesha.khan@example.com",
      phone: "+91 90000 11223",
      company: "",
      industry: "",
      type: "callback",
      subject: "Request a callback regarding custom packaging",
      message:
        "Could someone from your sales team call me back tomorrow morning to discuss custom box sizes?",
      status: "in_progress",
      createdAt: daysAgo(1.4),
      updatedAt: daysAgo(1.1),
      notes: [
        {
          id: `NOTE-${now - 1000}`,
          text: "Left a voicemail, will retry tomorrow.",
          createdAt: daysAgo(1.1),
          createdBy: "Admin",
        },
      ],
    },
    {
      id: generateId(),
      name: "Suresh Nair",
      designation: "Plant Head",
      email: "suresh.nair@example.com",
      phone: "+91 98111 22334",
      company: "Coastal Foods Ltd.",
      industry: "Food & Beverage",
      type: "general",
      subject: "General enquiry — factory visit",
      message:
        "We'd like to schedule a visit to your Sunraj facility next month to evaluate quality processes before finalizing an order.",
      status: "resolved",
      createdAt: daysAgo(6),
      updatedAt: daysAgo(5),
      notes: [
        {
          id: `NOTE-${now - 2000}`,
          text: "Visit scheduled for the 24th, confirmed with plant manager.",
          createdAt: daysAgo(5),
          createdBy: "Admin",
        },
      ],
    },
    {
      id: generateId(),
      name: "Unknown Sender",
      email: "promo@randommarketing.example",
      phone: "0000000000",
      type: "general",
      subject: "!!! Get 10000 followers now !!!",
      message: "Click here to boost your business instantly.",
      status: "spam",
      createdAt: daysAgo(9),
      notes: [],
    },
  ];
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readAll(): Message[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seeded = createSeedMessages();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

    return seeded;
  }

  try {
    const parsed = JSON.parse(stored) as Message[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/* =========================================================
   GET ALL MESSAGES
   (newest first)
========================================================= */

export function getMessages(): Message[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* =========================================================
   GET SINGLE MESSAGE
========================================================= */

export function getMessageById(
  id: string
): Message | undefined {
  return readAll().find((item) => item.id === id);
}

/* =========================================================
   SUBMIT MESSAGE (public contact / enquiry form)
========================================================= */

export type MessageFormData = Omit<
  Message,
  "id" | "status" | "createdAt" | "updatedAt" | "notes"
>;

export function submitMessage(
  data: MessageFormData
): Message {
  const now = new Date().toISOString();

  const newMessage: Message = {
    ...data,
    id: generateId(),
    status: "new",
    createdAt: now,
    notes: [],
  };

  const messages = readAll();

  writeAll([...messages, newMessage]);

  return newMessage;
}

/* =========================================================
   UPDATE MESSAGE (full replace — used by the detail/edit
   screen, e.g. status change + adding a note in one save)
========================================================= */

export function updateMessage(
  message: Message
): Message[] {
  const messages = readAll().map((item) =>
    item.id === message.id
      ? {
          ...message,
          updatedAt:
            message.updatedAt ?? new Date().toISOString(),
        }
      : item
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   UPDATE STATUS ONLY
========================================================= */

export function updateMessageStatus(
  id: string,
  status: MessageStatus
): Message[] {
  const now = new Date().toISOString();

  const messages = readAll().map((item) =>
    item.id === id
      ? { ...item, status, updatedAt: now }
      : item
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   BULK STATUS UPDATE
========================================================= */

export function updateMessagesStatus(
  ids: string[],
  status: MessageStatus
): Message[] {
  const now = new Date().toISOString();

  const messages = readAll().map((item) =>
    ids.includes(item.id)
      ? { ...item, status, updatedAt: now }
      : item
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   ADD INTERNAL NOTE
========================================================= */

export function addMessageNote(
  id: string,
  text: string,
  createdBy = "Admin"
): Message[] {
  const trimmed = text.trim();

  if (!trimmed) {
    return readAll();
  }

  const now = new Date().toISOString();

  const newNote: InternalNote = {
    id: `NOTE-${Date.now()}`,
    text: trimmed,
    createdAt: now,
    createdBy,
  };

  const messages = readAll().map((item) =>
    item.id === id
      ? {
          ...item,
          notes: [...item.notes, newNote],
          updatedAt: now,
        }
      : item
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   DELETE MESSAGE
========================================================= */

export function deleteMessage(id: string): Message[] {
  const messages = readAll().filter(
    (item) => item.id !== id
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   BULK DELETE
========================================================= */

export function deleteMessages(ids: string[]): Message[] {
  const messages = readAll().filter(
    (item) => !ids.includes(item.id)
  );

  writeAll(messages);

  return messages;
}

/* =========================================================
   FILTER HELPERS (optional convenience exports)
========================================================= */

export function getMessagesByStatus(
  status: MessageStatus
): Message[] {
  return getMessages().filter(
    (item) => item.status === status
  );
}

export function getMessagesByType(
  type: MessageType
): Message[] {
  return getMessages().filter((item) => item.type === type);
}