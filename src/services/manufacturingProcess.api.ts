import type { ManufacturingProcessItem } from "../types/manufacturingProcess";
import { createSlug } from "../utils/slug";

const STORAGE_KEY = "sunraj_manufacturing_process";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

const initialProcesses: ManufacturingProcessItem[] = [
  {
    id: "process-1",
    stepNumber: 1,
    title: "Raw Material Selection",
    slug: "raw-material-selection",
    shortDescription:
      "Selection of quality paper and raw materials according to the required packaging specifications.",
    image: "",
    displayOrder: 1,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-2",
    stepNumber: 2,
    title: "Paper Roll Handling",
    slug: "paper-roll-handling",
    shortDescription:
      "Careful handling and preparation of paper rolls before the corrugation process.",
    image: "",
    displayOrder: 2,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-3",
    stepNumber: 3,
    title: "Corrugation Process",
    slug: "corrugation-process",
    shortDescription:
      "Paper layers are combined through the corrugation process to create strong corrugated sheets.",
    image: "",
    displayOrder: 3,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-4",
    stepNumber: 4,
    title: "Sheet Cutting & Sizing",
    slug: "sheet-cutting-sizing",
    shortDescription:
      "Corrugated sheets are accurately cut and sized according to the required box dimensions.",
    image: "",
    displayOrder: 4,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-5",
    stepNumber: 5,
    title: "Printing",
    slug: "printing",
    shortDescription:
      "Customer branding, product information and required graphics are printed on the packaging.",
    image: "",
    displayOrder: 5,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-6",
    stepNumber: 6,
    title: "Slotting & Die Cutting",
    slug: "slotting-die-cutting",
    shortDescription:
      "Sheets are processed using precision slotting and die cutting according to the approved design.",
    image: "",
    displayOrder: 6,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-7",
    stepNumber: 7,
    title: "Stitching & Pasting",
    slug: "stitching-pasting",
    shortDescription:
      "The processed sheets are stitched, pasted or finished according to the box construction requirements.",
    image: "",
    displayOrder: 7,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-8",
    stepNumber: 8,
    title: "Quality Inspection",
    slug: "quality-inspection",
    shortDescription:
      "Finished packaging is inspected to ensure dimensional accuracy, strength and quality requirements.",
    image: "",
    displayOrder: 8,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-9",
    stepNumber: 9,
    title: "Bundling & Packing",
    slug: "bundling-packing",
    shortDescription:
      "Approved boxes are bundled and packed carefully for safe handling and dispatch.",
    image: "",
    displayOrder: 9,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "process-10",
    stepNumber: 10,
    title: "Dispatch",
    slug: "dispatch",
    shortDescription:
      "Finished packaging is prepared for dispatch and delivered according to customer requirements.",
    image: "",
    displayOrder: 10,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

function normalizeProcesses(
  processes: ManufacturingProcessItem[],
): ManufacturingProcessItem[] {
  return processes.map((process, index) => ({
    ...process,
    stepNumber: process.stepNumber || index + 1,
    slug: process.slug || createSlug(process.title),
    displayOrder: process.displayOrder || index + 1,
    enabled: process.enabled ?? true,
  }));
}

function readProcesses(): ManufacturingProcessItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProcesses));
    return initialProcesses;
  }

  try {
    const parsed = JSON.parse(stored) as ManufacturingProcessItem[];

    const normalized = normalizeProcesses(parsed);

    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProcesses));
    return initialProcesses;
  }
}

function saveProcesses(processes: ManufacturingProcessItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
}

export function getManufacturingProcesses(): ManufacturingProcessItem[] {
  return [...readProcesses()].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function getManufacturingProcessById(
  id: string,
): ManufacturingProcessItem | undefined {
  return readProcesses().find((process) => process.id === id);
}

export function getManufacturingProcessBySlug(
  slug: string,
): ManufacturingProcessItem | undefined {
  return readProcesses().find((process) => process.slug === slug);
}

export function createManufacturingProcess(
  data: Omit<
    ManufacturingProcessItem,
    "id" | "createdAt" | "updatedAt"
  >,
): ManufacturingProcessItem {
  const processes = readProcesses();
  const timestamp = now();

  const newProcess: ManufacturingProcessItem = {
    ...data,
    id: generateId(),
    slug: data.slug || createSlug(data.title),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const updated = [...processes, newProcess];

  saveProcesses(updated);

  return newProcess;
}

export function updateManufacturingProcess(
  id: string,
  data: Omit<
    ManufacturingProcessItem,
    "id" | "createdAt" | "updatedAt"
  >,
): ManufacturingProcessItem | undefined {
  const processes = readProcesses();

  const existing = processes.find((process) => process.id === id);

  if (!existing) {
    return undefined;
  }

  const updatedProcess: ManufacturingProcessItem = {
    ...existing,
    ...data,
    id: existing.id,
    slug: data.slug || createSlug(data.title),
    createdAt: existing.createdAt,
    updatedAt: now(),
  };

  const updated = processes.map((process) =>
    process.id === id ? updatedProcess : process,
  );

  saveProcesses(updated);

  return updatedProcess;
}

export function deleteManufacturingProcess(id: string): void {
  const processes = readProcesses();

  const updated = processes.filter((process) => process.id !== id);

  saveProcesses(updated);
}

export function toggleManufacturingProcess(id: string): void {
  const processes = readProcesses();

  const updated = processes.map((process) =>
    process.id === id
      ? {
          ...process,
          enabled: !process.enabled,
          updatedAt: now(),
        }
      : process,
  );

  saveProcesses(updated);
}

export function enableManufacturingProcesses(ids: string[]): void {
  const processes = readProcesses();

  const updated = processes.map((process) =>
    ids.includes(process.id)
      ? {
          ...process,
          enabled: true,
          updatedAt: now(),
        }
      : process,
  );

  saveProcesses(updated);
}

export function disableManufacturingProcesses(ids: string[]): void {
  const processes = readProcesses();

  const updated = processes.map((process) =>
    ids.includes(process.id)
      ? {
          ...process,
          enabled: false,
          updatedAt: now(),
        }
      : process,
  );

  saveProcesses(updated);
}