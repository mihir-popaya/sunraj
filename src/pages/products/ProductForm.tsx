import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  FiArrowLeft,
  FiPower,
  FiSave,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../services/product.api";

interface FormState {
  name: string;
  category: string;
  image: string;
  shortDescription: string;
  application: string;
  material: string;
  dimensions: string;
  displayOrder: number;
  enabled: boolean;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  image: "",
  shortDescription: "",
  application: "",
  material: "",
  dimensions: "",
  displayOrder: 1,
  enabled: true,
};

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // FIX 1: Fetch async product data properly using await
useEffect(() => {
  // Guard clause ensures `id` is non-undefined string
  if (!id) return;

  async function loadProductData() {
    try {
      // Non-null assertion or local check guarantees string type
      const product = await getProductById(id as string);

      if (!product) {
        navigate("/admin/products");
        return;
      }

      setForm({
        name: product.name ?? "",
        category: product.category ?? "",
        image: product.image ?? "",
        shortDescription: product.shortDescription ?? "",
        application: product.application ?? "",
        material: product.material ?? "",
        dimensions: product.dimensions ?? "",
        displayOrder: product.displayOrder ?? 1,
        enabled: product.enabled ?? true,
      });
    } catch (err) {
      console.error("Failed to load product", err);
      navigate("/admin/products");
    }
  }

  loadProductData();
}, [id, navigate]);

  function updateField(
    field: keyof FormState,
    value: string | number | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }

  function readImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image: "Please choose a valid image file.",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((previous) => ({
        ...previous,
        image: "Image must be smaller than 2MB.",
      }));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("image", String(reader.result ?? ""));
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        image: "Could not read the selected image. Please try again.",
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      readImageFile(file);
    }
    event.target.value = "";
  }

  function handleImageDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      readImageFile(file);
    }
  }

  function handleRemoveImage() {
    updateField("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Product name is required.";
    if (!form.category.trim()) newErrors.category = "Category is required.";
    if (!form.shortDescription.trim())
      newErrors.shortDescription = "Short description is required.";
    if (!form.application.trim())
      newErrors.application = "Application is required.";
    if (!form.material.trim()) newErrors.material = "Material is required.";
    if (!form.dimensions.trim())
      newErrors.dimensions = "Dimensions are required.";
    if (form.displayOrder < 1)
      newErrors.displayOrder = "Display order must be at least 1.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!validate()) return;

  // Map state to match the required CreateProductRequest interface
  const payload = {
    product_name: form.name.trim(),
    category_name: form.category.trim(),
    image: form.image,
    short_description: form.shortDescription.trim(),
    description: form.shortDescription.trim(), // Supply description if required
    application: form.application.trim(),
    material: form.material.trim(),
    dimensions: form.dimensions.trim(),
    display_order: Number(form.displayOrder),
    enabled: form.enabled,
  };

  try {
    if (isEdit) {
      if (!id) return; // Ensures id is defined as a string
      await updateProduct(id, payload);
    } else {
      await createProduct(payload);
    }
    navigate("/admin/products");
  } catch (err) {
    console.error("Failed to save product", err);
  }
}

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-[#E7E9EC] pb-5">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E7E9EC] bg-white text-[#6B7688] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[#101E33]">
              {isEdit ? "Edit Product" : "Add Product"}
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7688]">
              {isEdit
                ? "Update product information."
                : "Add a new product to the website."}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            form="product-management-form"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142d54] shadow-sm"
          >
            <FiSave size={17} />
            {isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      <form
        id="product-management-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">
          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Basic Information
            </h2>
            <p className="mt-1 text-sm text-[#6B7688]">
              Basic product details shown on the website.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Product Name <span className="text-[#C0272D]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter product name"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.name
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-[#C0272D]">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Category <span className="text-[#C0272D]">*</span>
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g. Corrugated Boxes"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                  errors.category
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />
              {errors.category && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Product Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                className="hidden"
              />

              {form.image ? (
                <div className="relative overflow-hidden rounded-xl border border-[#E7E9EC] bg-[#F8F9FA]">
                  <img
                    src={form.image}
                    alt="Product"
                    className="h-40 w-full object-contain p-2"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-white/90 px-3 py-2 backdrop-blur">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B3A6B] hover:bg-[#EEF3FA]"
                    >
                      <FiUploadCloud size={14} />
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#C0272D] hover:bg-[#FFF5F5]"
                    >
                      <FiX size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition ${
                    isDraggingImage
                      ? "border-[#1B3A6B] bg-[#EEF3FA]"
                      : errors.image
                      ? "border-[#C0272D] bg-[#FFF7F7]"
                      : "border-[#D8DDE5] bg-[#FBFBF9] hover:border-[#1B3A6B] hover:bg-[#F5F8FC]"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF3FA] text-[#1B3A6B]">
                    <FiUploadCloud size={19} />
                  </div>
                  <p className="text-sm font-medium text-[#101E33]">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-[#8A94A4]">
                    PNG, JPG or WEBP, up to 2MB
                  </p>
                </div>
              )}

              {errors.image && (
                <p className="mt-1.5 text-xs text-[#C0272D]">{errors.image}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Short Description <span className="text-[#C0272D]">*</span>
              </label>
              <textarea
                rows={4}
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                placeholder="Write a short product description..."
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                  errors.shortDescription
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />
              {errors.shortDescription && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.shortDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E9EC] bg-white">
          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Product Details
            </h2>
            <p className="mt-1 text-sm text-[#6B7688]">
              Add information that helps customers understand the product.
            </p>
          </div>

          <div className="grid gap-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Application <span className="text-[#C0272D]">*</span>
              </label>
              <textarea
                rows={3}
                value={form.application}
                onChange={(e) => updateField("application", e.target.value)}
                placeholder="Where is this product used?"
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                  errors.application
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />
              {errors.application && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.application}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                  Material <span className="text-[#C0272D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => updateField("material", e.target.value)}
                  placeholder="e.g. 5 Ply Corrugated Board"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                    errors.material
                      ? "border-[#C0272D]"
                      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                  }`}
                />
                {errors.material && (
                  <p className="mt-1.5 text-xs text-[#C0272D]">
                    {errors.material}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                  Dimensions <span className="text-[#C0272D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => updateField("dimensions", e.target.value)}
                  placeholder="e.g. Custom dimensions"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                    errors.dimensions
                      ? "border-[#C0272D]"
                      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                  }`}
                />
                {errors.dimensions && (
                  <p className="mt-1.5 text-xs text-[#C0272D]">
                    {errors.dimensions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E9EC] bg-white">
          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Publishing Settings
            </h2>
            <p className="mt-1 text-sm text-[#6B7688]">
              Control product visibility and ordering.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={form.displayOrder}
                onChange={(e) =>
                  updateField("displayOrder", Number(e.target.value))
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                  errors.displayOrder
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />
              {errors.displayOrder && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.displayOrder}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Visibility
              </label>
              <button
                type="button"
                onClick={() => updateField("enabled", !form.enabled)}
                className="flex w-full items-center justify-between rounded-xl border border-[#E7E9EC] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      form.enabled
                        ? "bg-[#EAF5EE] text-[#1E7A4C]"
                        : "bg-[#F1F3F6] text-[#6B7688]"
                    }`}
                  >
                    <FiPower size={17} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#101E33]">
                      {form.enabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-xs text-[#6B7688]">
                      {form.enabled
                        ? "Visible on website"
                        : "Hidden from website"}
                    </p>
                  </div>
                </div>

                <div
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.enabled ? "bg-[#1E7A4C]" : "bg-[#CBD0D6]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      form.enabled ? "left-6" : "left-1"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center rounded-xl border border-[#E7E9EC] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] hover:bg-[#F6F7F9]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#142d54]"
          >
            <FiSave size={17} />
            {isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}