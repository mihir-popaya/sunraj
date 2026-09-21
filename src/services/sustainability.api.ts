import type {
  SustainabilityData,
  SustainabilityInitiative,
} from "../types/sustainability";

const STORAGE_KEY = "sunraj_sustainability";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createInitialData(): SustainabilityData {
  const now = new Date().toISOString();

  return {
    id: "sustainability-1",

    // Hero
    heroBadge: "Sustainability",
    heroTitle: "Building responsibly for",
    heroHighlight: "a better future.",
    heroDescription:
      "At Sunraj, sustainability is integrated into the way we manufacture, operate and grow. We focus on responsible resource usage, waste reduction and efficient manufacturing practices.",
    heroImage: "",

    // Overview
    overviewTitle: "Responsible manufacturing starts from within.",
    overviewDescription:
      "Our approach to sustainability begins with responsible manufacturing practices, efficient resource utilization and continuous improvement across our operations.",
    overviewImage: "",

    // Initiatives
    initiatives: [
      {
        id: generateId(),
        title: "Responsible Material Usage",
        description:
          "We focus on efficient material utilization and responsible sourcing to reduce unnecessary consumption and support sustainable manufacturing.",
        icon: "leaf",
        displayOrder: 1,
        enabled: true,
      },
      {
        id: generateId(),
        title: "Waste Reduction",
        description:
          "Our manufacturing processes emphasize waste reduction, material recovery and continuous improvement to minimize environmental impact.",
        icon: "recycle",
        displayOrder: 2,
        enabled: true,
      },
      {
        id: generateId(),
        title: "Energy Efficiency",
        description:
          "We continuously work toward efficient use of energy across our manufacturing operations and infrastructure.",
        icon: "zap",
        displayOrder: 3,
        enabled: true,
      },
    ],

    // Commitment
    commitmentTitle: "Our commitment to responsible growth.",
    commitmentDescription:
      "We believe responsible growth means creating value for our customers while maintaining respect for people, resources and the environment.",

    // Environment
    environmentTitle: "Environmental responsibility.",
    environmentDescription:
      "From material utilization to waste management and energy consumption, we continuously evaluate opportunities to reduce our environmental footprint.",

    // Responsible Manufacturing
    responsibleManufacturingTitle: "Responsible manufacturing.",
    responsibleManufacturingDescription:
      "Modern machinery, process discipline and continuous improvement help us maintain consistent quality while using resources responsibly.",

    // Future
    futureTitle: "Building a more sustainable future.",
    futureDescription:
      "Our sustainability journey continues through innovation, operational efficiency and responsible manufacturing practices that support a better future.",

    enabled: true,

    createdAt: now,
    updatedAt: now,
  };
}

function normalizeData(data: SustainabilityData): SustainabilityData {
  return {
    ...data,

    heroBadge: data.heroBadge ?? "",
    heroTitle: data.heroTitle ?? "",
    heroHighlight: data.heroHighlight ?? "",
    heroDescription: data.heroDescription ?? "",
    heroImage: data.heroImage ?? "",

    overviewTitle: data.overviewTitle ?? "",
    overviewDescription: data.overviewDescription ?? "",
    overviewImage: data.overviewImage ?? "",

    initiatives: Array.isArray(data.initiatives)
      ? data.initiatives.map((initiative, index) => ({
          id: initiative.id || generateId(),
          title: initiative.title ?? "",
          description: initiative.description ?? "",
          icon: initiative.icon ?? "leaf",
          displayOrder: initiative.displayOrder ?? index + 1,
          enabled: initiative.enabled ?? true,
        }))
      : [],

    commitmentTitle: data.commitmentTitle ?? "",
    commitmentDescription: data.commitmentDescription ?? "",

    environmentTitle: data.environmentTitle ?? "",
    environmentDescription: data.environmentDescription ?? "",

    responsibleManufacturingTitle:
      data.responsibleManufacturingTitle ?? "",

    responsibleManufacturingDescription:
      data.responsibleManufacturingDescription ?? "",

    futureTitle: data.futureTitle ?? "",
    futureDescription: data.futureDescription ?? "",

    enabled: data.enabled ?? true,

    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}

/* =========================================================
   GET SUSTAINABILITY
========================================================= */

export function getSustainability(): SustainabilityData {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const initialData = createInitialData();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialData)
    );

    return initialData;
  }

  try {
    const parsed = JSON.parse(stored) as SustainabilityData;

    const normalized = normalizeData(parsed);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    );

    return normalized;
  } catch {
    const initialData = createInitialData();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialData)
    );

    return initialData;
  }
}

/* =========================================================
   UPDATE SUSTAINABILITY
========================================================= */

export function updateSustainability(
  data: SustainabilityData
): SustainabilityData {
  const updatedData: SustainabilityData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}

/* =========================================================
   TOGGLE PUBLISHING
========================================================= */

export function toggleSustainability(): SustainabilityData {
  const currentData = getSustainability();

  const updatedData: SustainabilityData = {
    ...currentData,
    enabled: !currentData.enabled,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}

/* =========================================================
   ADD INITIATIVE
========================================================= */

export function addSustainabilityInitiative(
  initiative: Omit<SustainabilityInitiative, "id">
): SustainabilityData {
  const currentData = getSustainability();

  const newInitiative: SustainabilityInitiative = {
    ...initiative,
    id: generateId(),
  };

  const updatedData: SustainabilityData = {
    ...currentData,

    initiatives: [
      ...currentData.initiatives,
      newInitiative,
    ],

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}

/* =========================================================
   UPDATE INITIATIVE
========================================================= */

export function updateSustainabilityInitiative(
  initiative: SustainabilityInitiative
): SustainabilityData {
  const currentData = getSustainability();

  const updatedData: SustainabilityData = {
    ...currentData,

    initiatives: currentData.initiatives.map((item) =>
      item.id === initiative.id
        ? initiative
        : item
    ),

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}

/* =========================================================
   DELETE INITIATIVE
========================================================= */

export function deleteSustainabilityInitiative(
  initiativeId: string
): SustainabilityData {
  const currentData = getSustainability();

  const updatedData: SustainabilityData = {
    ...currentData,

    initiatives: currentData.initiatives.filter(
      (item) => item.id !== initiativeId
    ),

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}

/* =========================================================
   TOGGLE INITIATIVE
========================================================= */

export function toggleSustainabilityInitiative(
  initiativeId: string
): SustainabilityData {
  const currentData = getSustainability();

  const updatedData: SustainabilityData = {
    ...currentData,

    initiatives: currentData.initiatives.map((item) =>
      item.id === initiativeId
        ? {
            ...item,
            enabled: !item.enabled,
          }
        : item
    ),

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedData)
  );

  return updatedData;
}