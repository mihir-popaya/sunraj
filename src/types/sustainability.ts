export interface SustainabilityInitiative {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  enabled: boolean;
}

export interface SustainabilityData {
  id: string;

  // Hero
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroImage: string;

  // Overview
  overviewTitle: string;
  overviewDescription: string;
  overviewImage: string;

  // Initiatives
  initiatives: SustainabilityInitiative[];

  // Commitment
  commitmentTitle: string;
  commitmentDescription: string;

  // Environment
  environmentTitle: string;
  environmentDescription: string;

  // Responsible Manufacturing
  responsibleManufacturingTitle: string;
  responsibleManufacturingDescription: string;

  // Future
  futureTitle: string;
  futureDescription: string;

  enabled: boolean;

  createdAt: string;
  updatedAt: string;
}