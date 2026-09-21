// src/services/product.api.ts
import api from "./api";
import type { ProductItem } from "../types/product";
import { createSlug } from "../utils/slug";

// ============================================================
// BACKEND PRODUCT TYPE
// ============================================================

interface BackendProduct {
  _id: string;
  product_name: string;
  category_name: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  application_areas?: string[];
  enquiry_enabled?: boolean;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  slug?: string;
}

// ============================================================
// CREATE PRODUCT REQUEST
// ============================================================

// Example: src/types/product.ts or product.api.ts
export interface CreateProductRequest {
  product_name: string;
  category_name: string;
  image: string;
  short_description: string;
  description: string;
  application: string;
  material: string;
  dimensions: string;
  display_order?: number;
  enabled?: boolean;
}

// ============================================================
// UPDATE PRODUCT REQUEST
// ============================================================

export type UpdateProductRequest = Partial<CreateProductRequest>;

// ============================================================
// TYPE GUARDS
// ============================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBackendProduct(value: unknown): value is BackendProduct {
  if (!isRecord(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.product_name === "string" &&
    typeof value.category_name === "string"
  );
}

// ============================================================
// EXTRACT SINGLE PRODUCT
// ============================================================

function extractProduct(data: unknown): BackendProduct | null {
  if (!isRecord(data)) return null;

  const responseData = data.data;

  if (isRecord(responseData)) {
    if (isBackendProduct(responseData.product)) {
      return responseData.product;
    }
    if (isBackendProduct(responseData)) {
      return responseData;
    }
  }

  if (isBackendProduct(data)) {
    return data;
  }

  return null;
}

// ============================================================
// EXTRACT PRODUCT LIST
// ============================================================

function extractProducts(data: unknown): BackendProduct[] {
  if (Array.isArray(data)) {
    return data.filter(isBackendProduct);
  }

  if (!isRecord(data)) return [];

  const responseData = data.data;

  if (Array.isArray(responseData)) {
    return responseData.filter(isBackendProduct);
  }

  if (isRecord(responseData)) {
    if (Array.isArray(responseData.products)) {
      return responseData.products.filter(isBackendProduct);
    }
    if (Array.isArray(responseData.items)) {
      return responseData.items.filter(isBackendProduct);
    }
    if (Array.isArray(responseData.data)) {
      return responseData.data.filter(isBackendProduct);
    }
  }

  if (Array.isArray(data.products)) {
    return data.products.filter(isBackendProduct);
  }

  if (Array.isArray(data.items)) {
    return data.items.filter(isBackendProduct);
  }

  return [];
}

// ============================================================
// BACKEND → FRONTEND
// ============================================================

function mapBackendProduct(product: BackendProduct): ProductItem {
  return {
    id: product._id,
    name: product.product_name,
    slug: product.slug || createSlug(product.product_name || ""),
    category: product.category_name,
    image: product.image_url || "",
    shortDescription: product.short_description || "",
    description: product.description || "",
    application: product.application_areas?.join(", ") || "",
    material: "",
    dimensions: "",
    displayOrder: product.display_order ?? 0,
    enabled: product.is_active !== false,
    enquiryEnabled: product.enquiry_enabled ?? false,
    createdAt: product.created_at || "",
    updatedAt: product.updated_at || "",
  };
}

// ============================================================
// FRONTEND → BACKEND
// ============================================================

function mapFrontendProduct(product: Partial<ProductItem>): UpdateProductRequest {
  const payload: UpdateProductRequest = {};

  if (product.name !== undefined) payload.product_name = product.name;
  if (product.category !== undefined) payload.category_name = product.category;
  if (product.shortDescription !== undefined) payload.short_description = product.shortDescription;
  if (product.description !== undefined) payload.description = product.description;
  
  // FIX: Map to 'image' instead of 'image_url'
  if (product.image !== undefined) payload.image = product.image;

  // FIX: Map to 'application' instead of 'application_areas'
  if (product.application !== undefined) {
    payload.application = product.application;
  }

  if (product.displayOrder !== undefined) payload.display_order = product.displayOrder;
  
  // FIX: Map to 'enabled' instead of 'is_active'
  if (product.enabled !== undefined) payload.enabled = product.enabled;

  return payload;
}
// ============================================================
// API METHODS WITH ERROR HANDLERS
// ============================================================

export const getProducts = async (): Promise<ProductItem[]> => {
  try {
    const response = await api.get("/product");
    const products = extractProducts(response.data);
    return products.map(mapBackendProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export const getPublicProducts = async (): Promise<ProductItem[]> => {
  try {
    const response = await api.get("/product/public");
    const products = extractProducts(response.data);
    return products.map(mapBackendProduct);
  } catch (error) {
    console.error("Failed to fetch public products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<ProductItem | undefined> => {
  try {
    const response = await api.get(`/product/${id}`);
    const product = extractProduct(response.data);
    return product ? mapBackendProduct(product) : undefined;
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    return undefined;
  }
};

export const getProductBySlug = async (slug: string): Promise<ProductItem | undefined> => {
  try {
    const products = await getPublicProducts();
    return products.find(
      (product) => product.slug.toLowerCase() === slug.toLowerCase()
    );
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return undefined;
  }
};

export const createProduct = async (data: CreateProductRequest): Promise<ProductItem> => {
  const response = await api.post("/product", data);
  const product = extractProduct(response.data);

  if (!product) {
    throw new Error("Product was created but no product data was returned.");
  }

  return mapBackendProduct(product);
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductItem>
): Promise<ProductItem> => {
  const payload = mapFrontendProduct(data);
  const response = await api.patch(`/product/${id}`, payload);
  const product = extractProduct(response.data);

  if (product) {
    return mapBackendProduct(product);
  }

  const updatedProduct = await getProductById(id);
  if (!updatedProduct) {
    throw new Error("Product updated but could not be fetched.");
  }

  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/product/${id}`);
};

export const toggleProduct = async (id: string, enabled: boolean): Promise<ProductItem> => {
  return updateProduct(id, { enabled });
};

export const enableProducts = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => updateProduct(id, { enabled: true })));
};

export const disableProducts = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => updateProduct(id, { enabled: false })));
};