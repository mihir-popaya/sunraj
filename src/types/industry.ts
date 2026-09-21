export interface IndustryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  shortDescription: string;
  description: string;
  applications: string;
  packagingRequirements: string;
  displayOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryFormData {
  name: string;
  image: string;
  shortDescription: string;
  description: string;
  applications: string;
  packagingRequirements: string;
  displayOrder: number;
  enabled: boolean;
}