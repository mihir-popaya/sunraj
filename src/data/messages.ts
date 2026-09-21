import type { Message } from "../types/message";

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "MSG-001",
    name: "Rajesh Kumar",
    designation: "Purchase Manager",
    email: "rajesh@abctextiles.com",
    phone: "+91 98765 43210",
    company: "ABC Textiles",
    industry: "Textiles",
    type: "product",
    subject: "Packaging requirement",
    product: "5 Ply Corrugated Boxes",
    quantity: "10,000 boxes/month",
    requirements:
      "Looking for durable corrugated boxes for textile product packaging.",
    message:
      "We are looking for a long-term packaging supplier for our textile division.",
    status: "new",
    createdAt: "2026-09-11T09:40:00",
    notes: [],
  },

  {
    id: "MSG-002",
    name: "Anita Desai",
    designation: "Procurement Head",
    email: "anita@sunpharma.example",
    phone: "+91 98200 12345",
    company: "Sun Pharma",
    industry: "Pharmaceuticals",
    type: "callback",
    subject: "Request for callback",
    message:
      "Please arrange a callback to discuss our pharmaceutical packaging requirements.",
    status: "in_progress",
    createdAt: "2026-09-10T15:20:00",
    notes: [
      {
        id: "NOTE-001",
        text: "Contacted the customer. Awaiting packaging specifications.",
        createdAt: "2026-09-11T10:00:00",
        createdBy: "Admin",
      },
    ],
  },

  {
    id: "MSG-003",
    name: "Vikram Shah",
    designation: "Operations Manager",
    email: "vikram@logistics.example",
    phone: "+91 99887 66554",
    company: "Global Logistics Corp",
    industry: "Logistics",
    type: "general",
    subject: "General business enquiry",
    message:
      "We would like to understand your manufacturing capabilities and delivery coverage.",
    status: "resolved",
    createdAt: "2026-09-08T11:10:00",
    notes: [],
  },

  {
    id: "MSG-004",
    name: "Priya Mehta",
    designation: "Purchase Executive",
    email: "priya@freshfoods.example",
    phone: "+91 98700 11223",
    company: "Fresh Foods Pvt. Ltd.",
    industry: "Food",
    type: "product",
    subject: "Corrugated box enquiry",
    product: "Printed Corrugated Boxes",
    quantity: "5,000 boxes",
    requirements:
      "Need printed boxes suitable for food product packaging.",
    message:
      "Please share product specifications and approximate pricing.",
    status: "new",
    createdAt: "2026-09-07T13:45:00",
    notes: [],
  },

  {
    id: "MSG-005",
    name: "Amit Joshi",
    designation: "Manager",
    email: "amit@example.com",
    phone: "+91 90000 11111",
    company: "Demo Industries",
    industry: "Engineering",
    type: "general",
    subject: "Website enquiry",
    message:
      "Interested in discussing your packaging solutions.",
    status: "spam",
    createdAt: "2026-09-05T16:30:00",
    notes: [],
  },

  {
    id: "MSG-006",
    name: "Neha Patel",
    designation: "Purchase Manager",
    email: "neha@chemicals.example",
    phone: "+91 98765 22110",
    company: "Prime Chemicals",
    industry: "Chemicals",
    type: "product",
    subject: "Industrial packaging requirement",
    product: "Heavy Duty Corrugated Boxes",
    quantity: "8,000 boxes",
    requirements:
      "Need heavy-duty packaging for chemical equipment.",
    message:
      "Please share available box sizes and specifications.",
    status: "new",
    createdAt: "2026-09-04T12:20:00",
    notes: [],
  },

  {
    id: "MSG-007",
    name: "Suresh Mehta",
    designation: "Director",
    email: "suresh@engineering.example",
    phone: "+91 99880 33221",
    company: "Mehta Engineering",
    industry: "Engineering",
    type: "callback",
    subject: "Request for callback",
    message:
      "We would like to discuss a regular packaging supply requirement.",
    status: "in_progress",
    createdAt: "2026-09-03T14:15:00",
    notes: [],
  },

  {
    id: "MSG-008",
    name: "Karan Shah",
    designation: "Operations Head",
    email: "karan@automotive.example",
    phone: "+91 98201 44332",
    company: "Shah Automotive",
    industry: "Automotive",
    type: "general",
    subject: "Packaging solutions enquiry",
    message:
      "Interested in your packaging capabilities for automotive components.",
    status: "resolved",
    createdAt: "2026-09-02T10:30:00",
    notes: [],
  },

  {
    id: "MSG-009",
    name: "Rohit Desai",
    designation: "Procurement Executive",
    email: "rohit@appliances.example",
    phone: "+91 98190 55443",
    company: "Desai Appliances",
    industry: "Appliances",
    type: "product",
    subject: "Product packaging enquiry",
    product: "5 Ply Printed Boxes",
    quantity: "12,000 boxes",
    requirements:
      "Looking for printed packaging for appliance components.",
    message:
      "Please provide product catalogue and pricing information.",
    status: "new",
    createdAt: "2026-09-01T09:20:00",
    notes: [],
  },

  {
    id: "MSG-010",
    name: "Mehul Joshi",
    designation: "Manager",
    email: "mehul@food.example",
    phone: "+91 90011 66554",
    company: "Fresh Food Industries",
    industry: "Food",
    type: "callback",
    subject: "Callback request",
    message:
      "Please call us regarding our monthly packaging requirement.",
    status: "new",
    createdAt: "2026-08-30T15:10:00",
    notes: [],
  },

  {
    id: "MSG-011",
    name: "Pooja Shah",
    designation: "Purchase Executive",
    email: "pooja@pharma.example",
    phone: "+91 90022 77665",
    company: "Shah Pharmaceuticals",
    industry: "Pharmaceuticals",
    type: "product",
    subject: "Pharmaceutical packaging",
    product: "Corrugated Cartons",
    quantity: "15,000 boxes",
    message:
      "We need a reliable supplier for pharmaceutical cartons.",
    status: "in_progress",
    createdAt: "2026-08-29T11:25:00",
    notes: [],
  },

  {
    id: "MSG-012",
    name: "Nilesh Patil",
    designation: "Business Head",
    email: "nilesh@logistics.example",
    phone: "+91 90033 88776",
    company: "Patil Logistics",
    industry: "Logistics",
    type: "general",
    subject: "Business enquiry",
    message:
      "Interested in your manufacturing and delivery capabilities.",
    status: "resolved",
    createdAt: "2026-08-28T13:40:00",
    notes: [],
  },
];

/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEY = "sunraj_messages";

export function getMessages(): Message[] {
  if (typeof window === "undefined") {
    return INITIAL_MESSAGES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(INITIAL_MESSAGES)
      );

      return INITIAL_MESSAGES;
    }

    return JSON.parse(stored) as Message[];
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function saveMessages(
  messages: Message[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages)
  );
}

export function updateMessage(
  updatedMessage: Message
) {
  const messages = getMessages();

  const updated = messages.map(
    (message) =>
      message.id === updatedMessage.id
        ? updatedMessage
        : message
  );

  saveMessages(updated);

  return updatedMessage;
}