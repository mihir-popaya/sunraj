import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  FiArrowLeft,
  FiPower,
  FiSave,
  FiCheck,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { IndustryFormData } from "../../types/industry";

import {
  createIndustry,
  getIndustryById,
  updateIndustry,
} from "../../services/industry.api";

const emptyForm: IndustryFormData = {
  name: "",
  image: "",
  shortDescription: "",
  description: "",
  applications: "",
  packagingRequirements: "",
  displayOrder: 1,
  enabled: true,
};

// Maximum image size accepted for upload (2 MB).
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function IndustryForm() {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] =
    useState<IndustryFormData>(emptyForm);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] =
    useState(isEdit);

  const [notFound, setNotFound] =
    useState(false);

  const [isDraggingImage, setIsDraggingImage] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const industry = getIndustryById(id);

    if (!industry) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setForm({
      name: industry.name,
      image: industry.image,
      shortDescription:
        industry.shortDescription,
      description: industry.description,
      applications: industry.applications,
      packagingRequirements:
        industry.packagingRequirements,
      displayOrder: industry.displayOrder,
      enabled: industry.enabled,
    });

    setLoading(false);
  }, [id]);

  function updateField(
    field: keyof IndustryFormData,
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

  // ============================================================
  // IMAGE UPLOAD (choose file -> base64 data URL)
  // ============================================================

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
      updateField(
        "image",
        String(reader.result ?? "")
      );
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        image: "Could not read the selected image. Please try again.",
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleImageInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      readImageFile(file);
    }

    // Allow re-selecting the same file later.
    event.target.value = "";
  }

  function handleImageDrop(
    event: DragEvent<HTMLDivElement>
  ) {
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
    const newErrors: Record<
      string,
      string
    > = {};

    if (!form.name.trim()) {
      newErrors.name =
        "Industry name is required.";
    }

    if (!form.shortDescription.trim()) {
      newErrors.shortDescription =
        "Short description is required.";
    }

    if (!form.description.trim()) {
      newErrors.description =
        "Full description is required.";
    }

    if (!form.applications.trim()) {
      newErrors.applications =
        "Applications are required.";
    }

    if (!form.packagingRequirements.trim()) {
      newErrors.packagingRequirements =
        "Packaging requirements are required.";
    }

    if (form.displayOrder < 1) {
      newErrors.displayOrder =
        "Display order must be at least 1.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const data: IndustryFormData = {
      name: form.name.trim(),
      image: form.image,
      shortDescription:
        form.shortDescription.trim(),
      description: form.description.trim(),
      applications: form.applications.trim(),
      packagingRequirements:
        form.packagingRequirements.trim(),
      displayOrder: Number(form.displayOrder),
      enabled: form.enabled,
    };

    if (isEdit && id) {
      updateIndustry(id, data);
    } else {
      createIndustry(data);
    }

    navigate("/admin/industries");
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E7E9EC] border-t-[#1B3A6B]" />
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#101E33]">
            Industry not found
          </h2>

          <p className="mt-2 text-sm text-[#6B7688]">
            The industry you are trying to edit does not exist.
          </p>

          <Link
            to="/admin/industries"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white"
          >
            <FiArrowLeft size={16} />
            Back to Industries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header Area Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-[#E7E9EC] pb-5">

        {/* Left Side: Navigation Back Arrow & Title Labels */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/industries"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E7E9EC] bg-white text-[#6B7688] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[#101E33]">
              {isEdit ? "Edit Industry" : "Add Industry"}
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7688]">
              {isEdit
                ? "Update industry information."
                : "Create a new industry page for the website."}
            </p>
          </div>
        </div>

        {/* Right Side: Positioned Save / Update Action Button */}
        <div className="flex items-center">
          <button
            type="submit"
            form="industry-management-form"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142d54] shadow-sm"
          >
            {isEdit ? (
              <>
                <FiCheck size={17} />
                Update Industry
              </>
            ) : (
              <>
                <FiSave size={17} />
                Create Industry
              </>
            )}
          </button>
        </div>

      </div>

      <form
        id="industry-management-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Basic Information */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Basic industry details shown on the website.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* Industry Name */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Industry Name
                <span className="text-[#C0272D]">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="e.g. Food & Beverage"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.name
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />

              {errors.name && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.name}
                </p>
              )}

            </div>

            {/* Industry Image — choose file */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Industry Image
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
                    alt="Industry"
                    className="h-40 w-full object-contain p-2"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-white/90 px-3 py-2 backdrop-blur">

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
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
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
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
                  onDragLeave={() =>
                    setIsDraggingImage(false)
                  }
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
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.image}
                </p>
              )}

            </div>

            {/* Short Description */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Short Description
                <span className="text-[#C0272D]">
                  {" "}*
                </span>
              </label>

              <textarea
                rows={4}
                value={form.shortDescription}
                onChange={(e) =>
                  updateField(
                    "shortDescription",
                    e.target.value
                  )
                }
                placeholder="Short description shown on industry cards..."
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

        {/* Industry Details */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">

            <h2 className="text-base font-semibold text-[#101E33]">
              Industry Details
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Add information that helps visitors understand
              this industry.
            </p>

          </div>

          <div className="grid gap-6 p-6">

            {/* Full Description */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Full Description
                <span className="text-[#C0272D]">
                  {" "}*
                </span>
              </label>

              <textarea
                rows={6}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Write the complete industry description..."
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                  errors.description
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />

              {errors.description && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.description}
                </p>
              )}

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              {/* Applications */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                  Applications
                  <span className="text-[#C0272D]">
                    {" "}*
                  </span>
                </label>

                <textarea
                  rows={4}
                  value={form.applications}
                  onChange={(e) =>
                    updateField(
                      "applications",
                      e.target.value
                    )
                  }
                  placeholder="Food boxes, beverage packaging, retail cartons..."
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                    errors.applications
                      ? "border-[#C0272D]"
                      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                  }`}
                />

                {errors.applications && (
                  <p className="mt-1.5 text-xs text-[#C0272D]">
                    {errors.applications}
                  </p>
                )}

              </div>

              {/* Packaging Requirements */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                  Packaging Requirements
                  <span className="text-[#C0272D]">
                    {" "}*
                  </span>
                </label>

                <textarea
                  rows={4}
                  value={form.packagingRequirements}
                  onChange={(e) =>
                    updateField(
                      "packagingRequirements",
                      e.target.value
                    )
                  }
                  placeholder="Strength, durability, protection, easy handling..."
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                    errors.packagingRequirements
                      ? "border-[#C0272D]"
                      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                  }`}
                />

                {errors.packagingRequirements && (
                  <p className="mt-1.5 text-xs text-[#C0272D]">
                    {errors.packagingRequirements}
                  </p>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* Publishing */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">

            <h2 className="text-base font-semibold text-[#101E33]">
              Publishing Settings
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Control industry visibility and ordering.
            </p>

          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* Display Order */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Display Order
              </label>

              <input
                type="number"
                min="1"
                value={form.displayOrder}
                onChange={(e) =>
                  updateField(
                    "displayOrder",
                    Number(e.target.value)
                  )
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

            {/* Enabled */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Visibility
              </label>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "enabled",
                    !form.enabled
                  )
                }
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
                      {form.enabled
                        ? "Enabled"
                        : "Disabled"}
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
                    form.enabled
                      ? "bg-[#1E7A4C]"
                      : "bg-[#CBD0D6]"
                  }`}
                >

                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      form.enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />

                </div>

              </button>

            </div>

          </div>
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Link
            to="/admin/industries"
            className="inline-flex items-center justify-center rounded-xl border border-[#E7E9EC] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] hover:bg-[#F6F7F9]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#142d54]"
          >
            <FiSave size={17} />

            {isEdit
              ? "Update Industry"
              : "Create Industry"}
          </button>

        </div>

      </form>
    </div>
  );
}