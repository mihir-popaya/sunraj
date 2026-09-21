export interface ProductItem {
  id: string;

  name: string;
  slug: string;

  category: string;
  image: string;

  description?: string;
  shortDescription: string;
  application: string;
  material: string;
  dimensions: string;

  displayOrder: number;
  enabled: boolean;
  enquiryEnabled?: boolean;

  createdAt: string;
  updatedAt: string;
}