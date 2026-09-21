import type { Message, MessageStatus, InternalNote } from "../types/message";
import { INITIAL_MESSAGES } from "../data/messages";

const MESSAGE_STORAGE_KEY = "sunraj_admin_messages";

export function getMessages(): Message[] {
  const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      MESSAGE_STORAGE_KEY,
      JSON.stringify(INITIAL_MESSAGES)
    );

    return INITIAL_MESSAGES;
  }

  try {
    return JSON.parse(stored) as Message[];
  } catch {
    localStorage.setItem(
      MESSAGE_STORAGE_KEY,
      JSON.stringify(INITIAL_MESSAGES)
    );

    return INITIAL_MESSAGES;
  }
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(
    MESSAGE_STORAGE_KEY,
    JSON.stringify(messages)
  );

  window.dispatchEvent(
    new Event("sunraj-messages-updated")
  );
}

export function getMessageById(id: string): Message | undefined {
  return getMessages().find((message) => message.id === id);
}

/**
 * Only messages with "new" status are treated
 * as unread/new notifications.
 */
export function getUnreadMessageCount(): number {
  return getMessages().filter(
    (message) => message.status === "new" // Fixed: Matches "new" from MessageStatus type literal
  ).length;
}

export function updateMessageStatus(
  id: string,
  newStatus: MessageStatus,
  noteText?: string
): Message | undefined {
  const messages = getMessages();

  const index = messages.findIndex(
    (message) => message.id === id
  );

  if (index === -1) {
    return undefined;
  }

  const currentMessage = messages[index];
  const adminName = localStorage.getItem("adminName") || "Administrator";
  const timestamp = new Date().toISOString();

  // Create an internal note entry to document the status workflow change
  const systemNote: InternalNote = {
    id: `note-status-${Date.now()}`,
    text: `Status updated from "${currentMessage.status}" to "${newStatus}".${
      noteText ? ` Reason/Note: ${noteText}` : ""
    }`,
    createdAt: timestamp,
    createdBy: adminName,
  };

  /**
   * IMPORTANT:
   * Keep ALL existing message information.
   * Logs status changes safely into the correct valid notes array schema.
   */
  const updatedMessage: Message = {
    ...currentMessage,
    status: newStatus,
    updatedAt: timestamp,
    notes: [...(currentMessage.notes || []), systemNote], // Fixed: Appends correctly to note schema array
  };

  const updatedMessages = [...messages];
  updatedMessages[index] = updatedMessage;

  saveMessages(updatedMessages);

  return updatedMessage;
}

export function updateMessageNotes(
  id: string,
  noteContent: string
): Message | undefined {
  const messages = getMessages();

  const index = messages.findIndex(
    (message) => message.id === id
  );

  if (index === -1) {
    return undefined;
  }

  const currentMessage = messages[index];
  const adminName = localStorage.getItem("adminName") || "Administrator";

  // Create a brand new internal user-submitted text note entry
  const newNote: InternalNote = {
    id: `note-user-${Date.now()}`,
    text: noteContent,
    createdAt: new Date().toISOString(),
    createdBy: adminName,
  };

  /**
   * Preserve all original message data.
   * Appends the text object directly to the structured notes schema array.
   */
  const updatedMessage: Message = {
    ...currentMessage,
    updatedAt: new Date().toISOString(),
    notes: [...(currentMessage.notes || []), newNote], // Fixed: Changed internalNotes string to appends array
  };

  const updatedMessages = [...messages];
  updatedMessages[index] = updatedMessage;

  saveMessages(updatedMessages);

  return updatedMessage;
}
