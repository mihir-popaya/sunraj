export interface MachineryItem {
  id: string; // Maps to _id
  name: string; // Maps to machine_name
  image: string; // Maps to image_url
  shortDescription: string; // Maps to short_description
  function: string; // Maps to function_purpose
  qualityAdvantage: string; // Maps to quality_advantage
  productionCapability: string; // Maps to production_capability
  automationAdvantage: string; // Maps to automation_advantage
  technicalDetails: string; // Maps to technical_details
  displayOrder: number; // Maps to display_order
  enabled: boolean; // Maps to is_active
  createdAt?: string; // Maps to created_at
  updatedAt?: string; // Maps to updated_at
}

export interface MachineryFormData {
  machineName: string;
  image: string;
  shortDescription: string;
  function: string;
  qualityAdvantage: string;
  productionCapability: string;
  automationAdvantage: string;
  technicalDetails: string;
  displayOrder: number;
  enabled: boolean;
}