export type MessageStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "spam";

export type MessageType =
  | "general"
  | "product"
  | "callback";

export interface InternalNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface Message {
  id: string;

  // Sender
  name: string;
  designation?: string;
  email: string;
  phone: string;

  // Company
  company?: string;
  industry?: string;

  // Enquiry
  type: MessageType;
  subject: string;
  product?: string;
  quantity?: string;
  requirements?: string;
  message: string;

  // Workflow
  status: MessageStatus;

  // Dates
  createdAt: string;
  updatedAt?: string;

  // Internal notes
  notes: InternalNote[];
}