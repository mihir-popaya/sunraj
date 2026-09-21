import api from "./api";
import type { MachineryFormData, MachineryItem } from "../types/machinery";

const ENDPOINT = "/machinery_showcase";

/* Helper mapper to convert backend snake_case to frontend camelCase */
function mapBackendToFrontend(item: any): MachineryItem {
  return {
    id: item._id,
    name: item.machine_name || "",
    image: item.image_url || "",
    shortDescription: item.short_description || "",
    function: item.function_purpose || "",
    qualityAdvantage: item.quality_advantage || "",
    productionCapability: item.production_capability || "",
    automationAdvantage: item.automation_advantage || "",
    technicalDetails:
      typeof item.technical_details === "string"
        ? item.technical_details
        : JSON.stringify(item.technical_details || ""),
    displayOrder: Number(item.display_order) || 0,
    enabled: Boolean(item.is_active),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

/* Helper mapper to convert frontend camelCase to backend snake_case */
function mapFrontendToBackend(formData: Partial<MachineryFormData>) {
  const payload: Record<string, any> = {};
  if (formData.machineName !== undefined) payload.machine_name = formData.machineName;
  if (formData.image !== undefined) payload.image_url = formData.image;
  if (formData.shortDescription !== undefined) payload.short_description = formData.shortDescription;
  if (formData.function !== undefined) payload.function_purpose = formData.function;
  if (formData.qualityAdvantage !== undefined) payload.quality_advantage = formData.qualityAdvantage;
  if (formData.productionCapability !== undefined) payload.production_capability = formData.productionCapability;
  if (formData.automationAdvantage !== undefined) payload.automation_advantage = formData.automationAdvantage;
  if (formData.technicalDetails !== undefined) payload.technical_details = formData.technicalDetails;
  if (formData.displayOrder !== undefined) payload.display_order = Number(formData.displayOrder);
  if (formData.enabled !== undefined) payload.is_active = formData.enabled;
  return payload;
}

/* GET ALL (Admin) */
export async function getMachinery(): Promise<MachineryItem[]> {
  try {
    const response = await api.get(ENDPOINT);
    const resData = response.data;
    return (resData?.data || []).map(mapBackendToFrontend);
  } catch (error) {
    console.error("Failed to fetch machinery items:", error);
    return [];
  }
}

/* GET ALL (Public) */
export async function getPublicMachinery(): Promise<MachineryItem[]> {
  try {
    const response = await api.get(`${ENDPOINT}/public`);
    const resData = response.data;
    return (resData?.data || []).map(mapBackendToFrontend);
  } catch (error) {
    console.error("Failed to fetch public machinery items:", error);
    return [];
  }
}

/* GET BY ID */
export async function getMachineryById(id: string): Promise<MachineryItem | undefined> {
  try {
    const response = await api.get(`${ENDPOINT}/${id}`);
    const resData = response.data;
    return resData?.data ? mapBackendToFrontend(resData.data) : undefined;
  } catch (error) {
    console.error(`Failed to fetch machinery item with id ${id}:`, error);
    return undefined;
  }
}

/* CREATE */
export async function createMachinery(formData: MachineryFormData): Promise<MachineryItem> {
  const response = await api.post(ENDPOINT, mapFrontendToBackend(formData));
  const resData = response.data;
  return mapBackendToFrontend(resData?.data);
}

/* UPDATE (PATCH) */
export async function updateMachinery(
  id: string,
  formData: Partial<MachineryFormData>
): Promise<MachineryItem> {
  const response = await api.patch(`${ENDPOINT}/${id}`, mapFrontendToBackend(formData));
  const resData = response.data;
  return mapBackendToFrontend(resData?.data);
}

/* DELETE */
export async function deleteMachinery(id: string): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}

/* TOGGLE STATUS */
export async function toggleMachinery(id: string, currentStatus: boolean): Promise<MachineryItem> {
  return updateMachinery(id, { enabled: !currentStatus });
}

/* BULK ENABLE */
export async function enableMachinery(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => updateMachinery(id, { enabled: true })));
}

/* BULK DISABLE */
export async function disableMachinery(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => updateMachinery(id, { enabled: false })));
}