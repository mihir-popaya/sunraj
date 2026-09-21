export interface ManufacturingProcessItem {
  id: string;
  stepNumber: number;
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
  displayOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturingProcessFormData {
  title: string;
  shortDescription: string;
  image: string;
  displayOrder: number;
  enabled: boolean;
}