import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  FiArrowLeft,
  FiPower,
  FiSave,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createManufacturingProcess,
  getManufacturingProcessById,
  updateManufacturingProcess,
} from "../../services/manufacturingProcess.api";

import { createSlug } from "../../utils/slug";

interface FormState {
  stepNumber: number;
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
  displayOrder: number;
  enabled: boolean;
}

const emptyForm: FormState = {
  stepNumber: 1,
  title: "",
  slug: "",
  shortDescription: "",
  image: "",
  displayOrder: 1,
  enabled: true,
};

// Maximum image size accepted for upload (2 MB).
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function ManufacturingProcessForm() {
  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [isDraggingImage, setIsDraggingImage] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const process = getManufacturingProcessById(id);

    if (!process) {
      navigate("/admin/manufacturing-process", {
        replace: true,
      });
      return;
    }

    setForm({
      stepNumber: process.stepNumber,
      title: process.title,
      slug: process.slug,
      shortDescription: process.shortDescription,
      image: process.image,
      displayOrder: process.displayOrder,
      enabled: process.enabled,
    });

    setLoading(false);
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

  function handleTitleChange(value: string) {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: createSlug(value),
    }));

    setErrors((previous) => ({
      ...previous,
      title: "",
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
      updateField("image", String(reader.result ?? ""));
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        image:
          "Could not read the selected image. Please try again.",
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
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Process title is required.";
    }

    if (!form.shortDescription.trim()) {
      newErrors.shortDescription =
        "Short description is required.";
    }

    if (!Number.isInteger(form.stepNumber) || form.stepNumber < 1) {
      newErrors.stepNumber =
        "Step number must be a whole number greater than 0.";
    }

    if (
      !Number.isInteger(form.displayOrder) ||
      form.displayOrder < 1
    ) {
      newErrors.displayOrder =
        "Display order must be a whole number greater than 0.";
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

    setSaving(true);

    const payload = {
      stepNumber: Number(form.stepNumber),
      title: form.title.trim(),
      slug: createSlug(form.title),
      shortDescription: form.shortDescription.trim(),
      image: form.image,
      displayOrder: Number(form.displayOrder),
      enabled: form.enabled,
    };

    try {
      if (isEdit && id) {
        updateManufacturingProcess(id, payload);
      } else {
        createManufacturingProcess(payload);
      }

      navigate("/admin/manufacturing-process");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header Area Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-[#E7E9EC] pb-5">

        {/* Left Side: Navigation Back Arrow & Title Labels */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/manufacturing-process"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E7E9EC] bg-white text-[#6B7688] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[#101E33]">
              {isEdit
                ? "Edit Manufacturing Process"
                : "Add Manufacturing Process"}
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7688]">
              {isEdit
                ? "Update this manufacturing process step."
                : "Create a new manufacturing process step."}
            </p>
          </div>
        </div>

        {/* Right Side: Positioned Save / Update Action Button */}
        <div className="flex items-center">
          <button
            type="submit"
            form="process-management-form"
            disabled={saving}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142d54] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave size={17} />
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Process"
              : "Create Process"}
          </button>
        </div>

      </div>

      <form
        id="process-management-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Process Information */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Process Information
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Basic details for this manufacturing process step.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* Step Number */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Step Number
                <span className="text-[#C0272D]">{" "}*</span>
              </label>

              <input
                type="number"
                min="1"
                value={form.stepNumber}
                onChange={(e) =>
                  updateField(
                    "stepNumber",
                    Number(e.target.value)
                  )
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.stepNumber
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />

              {errors.stepNumber && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.stepNumber}
                </p>
              )}

            </div>

            {/* Display Order */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Display Order
                <span className="text-[#C0272D]">{" "}*</span>
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
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
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

            {/* Process Title */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Process Title
                <span className="text-[#C0272D]">{" "}*</span>
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  handleTitleChange(e.target.value)
                }
                placeholder="e.g. Corrugation Process"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                  errors.title
                    ? "border-[#C0272D]"
                    : "border-[#E7E9EC] focus:border-[#1B3A6B]"
                }`}
              />

              {errors.title && (
                <p className="mt-1.5 text-xs text-[#C0272D]">
                  {errors.title}
                </p>
              )}

            </div>

            {/* Slug */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                URL Slug
              </label>

              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  updateField(
                    "slug",
                    createSlug(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] px-4 py-3 text-sm outline-none transition focus:border-[#1B3A6B]"
              />

              <p className="mt-2 text-xs text-[#6B7688]">
                Public URL:
                <span className="ml-1 font-medium text-[#1B3A6B]">
                  /manufacturing-process/{form.slug || "process-name"}
                </span>
              </p>

            </div>

            {/* Process Image — choose file */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-[#101E33]">
                Process Image
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
                    alt="Process"
                    className="h-48 w-full object-contain p-2"
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
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition ${
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
                <span className="text-[#C0272D]">{" "}*</span>
              </label>

              <textarea
                rows={5}
                value={form.shortDescription}
                onChange={(e) =>
                  updateField(
                    "shortDescription",
                    e.target.value
                  )
                }
                placeholder="Describe this manufacturing process step..."
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

        {/* Publishing */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">

            <h2 className="text-base font-semibold text-[#101E33]">
              Publishing Settings
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Control whether this step appears on the public website.
            </p>

          </div>

          <div className="p-6">

            <button
              type="button"
              onClick={() =>
                updateField("enabled", !form.enabled)
              }
              className="flex w-full items-center justify-between rounded-xl border border-[#E7E9EC] px-4 py-3 sm:max-w-md"
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
                  form.enabled
                    ? "bg-[#1E7A4C]"
                    : "bg-[#CBD0D6]"
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
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Link
            to="/admin/manufacturing-process"
            className="inline-flex items-center justify-center rounded-xl border border-[#E7E9EC] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] hover:bg-[#F6F7F9]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#142d54] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave size={17} />

            {saving
              ? "Saving..."
              : isEdit
              ? "Update Process"
              : "Create Process"}
          </button>

        </div>

      </form>
    </div>
  );
}