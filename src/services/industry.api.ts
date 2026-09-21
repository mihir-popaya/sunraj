import type { IndustryFormData, IndustryItem } from "../types/industry";
import { createSlug } from "../utils/slug";

const STORAGE_KEY = "sunraj_industries";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

const initialIndustries: IndustryItem[] = [
  {
    id: "industry-1",
    name: "Food & Beverage",
    slug: "food-beverage",
    image: "",
    shortDescription:
      "Reliable corrugated packaging solutions for food and beverage products.",
    description:
      "Sunraj provides strong and reliable corrugated packaging solutions designed for the food and beverage industry.",
    applications:
      "Food boxes, beverage packaging, retail cartons, transport packaging",
    packagingRequirements:
      "Strength, hygiene, product protection, easy handling and transportation",
    displayOrder: 1,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "industry-2",
    name: "Pharmaceuticals",
    slug: "pharmaceuticals",
    image: "",
    shortDescription:
      "Protective packaging solutions for pharmaceutical products and supplies.",
    description:
      "Our packaging solutions help pharmaceutical manufacturers safely handle, store and transport their products.",
    applications:
      "Medicine cartons, secondary packaging, transport boxes and storage packaging",
    packagingRequirements:
      "Protection, durability, dimensional accuracy and reliable handling",
    displayOrder: 2,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "industry-3",
    name: "Automotive",
    slug: "automotive",
    image: "",
    shortDescription:
      "Heavy-duty corrugated packaging for automotive components and parts.",
    description:
      "Sunraj offers durable packaging solutions for automotive components requiring protection during storage and transportation.",
    applications:
      "Component boxes, spare parts packaging, transport cartons and protective packaging",
    packagingRequirements:
      "High strength, impact protection, stacking performance and durability",
    displayOrder: 3,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "industry-4",
    name: "Engineering",
    slug: "engineering",
    image: "",
    shortDescription:
      "Custom corrugated packaging for engineering products and components.",
    description:
      "Engineering products often require strong and customizable packaging. Sunraj develops packaging solutions according to product requirements.",
    applications:
      "Industrial components, machinery parts, equipment packaging and transport boxes",
    packagingRequirements:
      "Load-bearing strength, protection, customization and dimensional accuracy",
    displayOrder: 4,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "industry-5",
    name: "Electronics",
    slug: "electronics",
    image: "",
    shortDescription:
      "Protective corrugated packaging for electronic products and components.",
    description:
      "Sunraj provides packaging solutions designed to protect electronic products and components throughout transportation and handling.",
    applications:
      "Electronic devices, components, accessories and retail packaging",
    packagingRequirements:
      "Product protection, fit, strength and safe transportation",
    displayOrder: 5,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "industry-6",
    name: "Consumer Goods",
    slug: "consumer-goods",
    image: "",
    shortDescription:
      "Versatile packaging solutions for consumer and retail products.",
    description:
      "Sunraj manufactures corrugated packaging suitable for a wide range of consumer goods and retail applications.",
    applications:
      "Retail boxes, shipping cartons, product packaging and display packaging",
    packagingRequirements:
      "Presentation, durability, easy handling and transportation protection",
    displayOrder: 6,
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

function normalizeIndustry(industry: Partial<IndustryItem>): IndustryItem {
  const timestamp = now();

  return {
    id: industry.id || generateId(),
    name: industry.name || "",
    slug: industry.slug || createSlug(industry.name || ""),
    image: industry.image || "",
    shortDescription: industry.shortDescription || "",
    description: industry.description || "",
    applications: industry.applications || "",
    packagingRequirements: industry.packagingRequirements || "",
    displayOrder: Number(industry.displayOrder ?? 0),
    enabled: industry.enabled ?? true,
    createdAt: industry.createdAt || timestamp,
    updatedAt: industry.updatedAt || timestamp,
  };
}

function readIndustries(): IndustryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialIndustries)
    );

    return initialIndustries;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<IndustryItem>[];

    const normalized = parsed.map(normalizeIndustry);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    );

    return normalized;
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialIndustries)
    );

    return initialIndustries;
  }
}

function writeIndustries(industries: IndustryItem[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(industries)
  );
}

export function getIndustries(): IndustryItem[] {
  return readIndustries().sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

export function getIndustryById(
  id: string
): IndustryItem | undefined {
  return getIndustries().find(
    (industry) => industry.id === id
  );
}

export function getIndustryBySlug(
  slug: string
): IndustryItem | undefined {
  return getIndustries().find(
    (industry) => industry.slug === slug
  );
}

export function createIndustry(
  data: IndustryFormData
): IndustryItem {
  const industries = readIndustries();

  const timestamp = now();

  const industry: IndustryItem = {
    id: generateId(),
    name: data.name.trim(),
    slug: createSlug(data.name),
    image: data.image.trim(),
    shortDescription: data.shortDescription.trim(),
    description: data.description.trim(),
    applications: data.applications.trim(),
    packagingRequirements:
      data.packagingRequirements.trim(),
    displayOrder: Number(data.displayOrder),
    enabled: data.enabled,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  industries.push(industry);

  writeIndustries(industries);

  return industry;
}

export function updateIndustry(
  id: string,
  data: IndustryFormData
): IndustryItem | undefined {
  const industries = readIndustries();

  const index = industries.findIndex(
    (industry) => industry.id === id
  );

  if (index === -1) {
    return undefined;
  }

  const existing = industries[index];

  const updated: IndustryItem = {
    ...existing,
    name: data.name.trim(),
    slug: createSlug(data.name),
    image: data.image.trim(),
    shortDescription: data.shortDescription.trim(),
    description: data.description.trim(),
    applications: data.applications.trim(),
    packagingRequirements:
      data.packagingRequirements.trim(),
    displayOrder: Number(data.displayOrder),
    enabled: data.enabled,
    updatedAt: now(),
  };

  industries[index] = updated;

  writeIndustries(industries);

  return updated;
}

export function deleteIndustry(id: string): boolean {
  const industries = readIndustries();

  const filtered = industries.filter(
    (industry) => industry.id !== id
  );

  if (filtered.length === industries.length) {
    return false;
  }

  writeIndustries(filtered);

  return true;
}

export function toggleIndustry(
  id: string
): IndustryItem | undefined {
  const industries = readIndustries();

  const industry = industries.find(
    (item) => item.id === id
  );

  if (!industry) {
    return undefined;
  }

  industry.enabled = !industry.enabled;
  industry.updatedAt = now();

  writeIndustries(industries);

  return industry;
}

export function enableIndustries(
  ids: string[]
): void {
  const industries = readIndustries();

  industries.forEach((industry) => {
    if (ids.includes(industry.id)) {
      industry.enabled = true;
      industry.updatedAt = now();
    }
  });

  writeIndustries(industries);
}

export function disableIndustries(
  ids: string[]
): void {
  const industries = readIndustries();

  industries.forEach((industry) => {
    if (ids.includes(industry.id)) {
      industry.enabled = false;
      industry.updatedAt = now();
    }
  });

  writeIndustries(industries);
}