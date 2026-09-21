import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiUploadCloud,
  FiX,
  FiLoader,
} from "react-icons/fi";

import {
  createMachinery,
  getMachineryById,
  updateMachinery,
} from "../../services/machinery.api";
import type { MachineryFormData } from "../../types/machinery";

interface SpecificationItem {
  id: string;
  label: string;
  value: string;
}

const EMPTY_FORM: MachineryFormData = {
  machineName: "",
  image: "",
  shortDescription: "",
  function: "",
  qualityAdvantage: "",
  productionCapability: "",
  automationAdvantage: "",
  technicalDetails: "",
  displayOrder: 1,
  enabled: true,
};

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export default function MachineryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<MachineryFormData>(EMPTY_FORM);
  const [specs, setSpecs] = useState<SpecificationItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* LOAD EXISTING MACHINERY FOR EDIT */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadExistingData = async () => {
      try {
        const item = await getMachineryById(id);
        if (!item) {
          navigate("/admin/machinery", { replace: true });
          return;
        }

        setForm({
          machineName: item.name,
          image: item.image,
          shortDescription: item.shortDescription,
          function: item.function,
          qualityAdvantage: item.qualityAdvantage,
          productionCapability: item.productionCapability,
          automationAdvantage: item.automationAdvantage,
          technicalDetails: item.technicalDetails,
          displayOrder: item.displayOrder,
          enabled: item.enabled,
        });

        // Try parsing stringified specs JSON array if present
        if (item.technicalDetails) {
          try {
            const parsed = JSON.parse(item.technicalDetails);
            if (Array.isArray(parsed)) {
              setSpecs(
                parsed.map((s: any, idx: number) => ({
                  id: `spec-${idx}-${Date.now()}`,
                  label: s.label || "",
                  value: s.value || "",
                }))
              );
            }
          } catch {
            // Keep specs empty if it's plain text
          }
        }
      } catch (err) {
        alert("Failed to load machinery details");
        navigate("/admin/machinery", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [id, navigate]);

  /* FORM INPUT HANDLERS */
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, enabled: event.target.checked }));
  };

  /* FILE / IMAGE UPLOAD */
  const readImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please choose a valid image file." }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be smaller than 2MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: String(reader.result ?? "") }));
      setErrors((prev) => ({ ...prev, image: "" }));
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, image: "Could not read the selected image." }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImageFile(file);
    event.target.value = "";
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer.files?.[0];
    if (file) readImageFile(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* SPECIFICATIONS HANDLER */
  const addSpec = () => {
    setSpecs((prev) => [
      ...prev,
      { id: `spec-${Date.now()}`, label: "", value: "" },
    ]);
  };

  const updateSpec = (specId: string, field: "label" | "value", val: string) => {
    setSpecs((prev) =>
      prev.map((item) => (item.id === specId ? { ...item, [field]: val } : item))
    );
  };

  const removeSpec = (specId: string) => {
    setSpecs((prev) => prev.filter((item) => item.id !== specId));
  };

  /* VALIDATION */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.machineName.trim()) newErrors.machineName = "Machine name is required.";
    if (!form.shortDescription.trim()) newErrors.shortDescription = "Short description is required.";
    if (!form.function.trim()) newErrors.function = "Function / purpose is required.";
    if (!form.qualityAdvantage.trim()) newErrors.qualityAdvantage = "Quality advantage is required.";
    if (!form.productionCapability.trim()) newErrors.productionCapability = "Production capability is required.";
    if (!form.automationAdvantage.trim()) newErrors.automationAdvantage = "Automation advantage is required.";

    if (!Number.isInteger(form.displayOrder) || form.displayOrder < 1) {
      newErrors.displayOrder = "Display order must be a whole number greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      // Serialize array specs into structured JSON string for backend
      const formattedSpecs = specs
        .filter((s) => s.label.trim())
        .map((s) => ({ label: s.label, value: s.value }));

      const payload: MachineryFormData = {
        ...form,
        technicalDetails: formattedSpecs.length > 0 ? JSON.stringify(formattedSpecs) : form.technicalDetails,
      };

      if (isEditMode && id) {
        await updateMachinery(id, payload);
      } else {
        await createMachinery(payload);
      }

      navigate("/admin/machinery");
    } catch (err: any) {
      alert(err.message || "Failed to save machinery item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <FiLoader className="animate-spin text-[#1B3A6B]" size={36} />
        <p className="mt-3 text-sm font-medium text-[#101E33]">Loading Machinery Form...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/machinery"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E9EC] bg-white text-[#536071] transition hover:bg-[#F7F8FA] hover:text-[#1B3A6B]"
        >
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#101E33]">
            {isEditMode ? "Edit Machinery" : "Add Machinery"}
          </h1>
          <p className="mt-1 text-sm text-[#6B7688]">
            {isEditMode
              ? "Update machinery details and technical specifications."
              : "Add a new machinery item to your showcase system."}
          </p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC INFORMATION */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B3A6B]">
              <FiSettings size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-[#101E33]">Basic Information</h2>
              <p className="mt-0.5 text-xs text-[#8A94A4]">General information about the machinery.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Machine Name" required error={errors.machineName}>
                <input
                  name="machineName"
                  value={form.machineName}
                  onChange={handleChange}
                  placeholder="e.g. Automatic Corrugation Plant"
                  className={inputClass(errors.machineName)}
                />
              </FormField>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="sm:col-span-2">
              <FormField label="Machinery Image" error={errors.image}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageInputChange}
                  className="hidden"
                />

                {form.image ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E7E9EC] bg-[#FBFBF9]">
                    <img
                      src={form.image}
                      alt="Machinery preview"
                      className="h-48 w-full object-contain p-2"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white/90 px-3 py-2 backdrop-blur">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B3A6B] hover:bg-[#EEF3FA]"
                      >
                        <FiUploadCloud size={14} /> Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#C0272D] hover:bg-[#FFF5F5]"
                      >
                        <FiX size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
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
                    <p className="text-sm font-medium text-[#101E33]">Click to upload or drag & drop</p>
                    <p className="text-xs text-[#8A94A4]">PNG, JPG, or Base64, up to 2MB</p>
                  </div>
                )}
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Short Description" required error={errors.shortDescription}>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Briefly describe this machinery..."
                  className={textareaClass(errors.shortDescription)}
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* MACHINERY DETAILS */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="font-semibold text-[#101E33]">Machinery Features</h2>
            <p className="mt-1 text-xs text-[#8A94A4]">
              Detail the function, quality, production capability, and automation advantages.
            </p>
          </div>

          <div className="space-y-5">
            <FormField label="Function / Purpose" required error={errors.function}>
              <textarea
                name="function"
                value={form.function}
                onChange={handleChange}
                rows={3}
                placeholder="Explain what this machinery does..."
                className={textareaClass(errors.function)}
              />
            </FormField>

            <FormField label="Quality Advantage" required error={errors.qualityAdvantage}>
              <textarea
                name="qualityAdvantage"
                value={form.qualityAdvantage}
                onChange={handleChange}
                rows={3}
                placeholder="Explain how this machinery improves quality..."
                className={textareaClass(errors.qualityAdvantage)}
              />
            </FormField>

            <FormField label="Production Capability" required error={errors.productionCapability}>
              <textarea
                name="productionCapability"
                value={form.productionCapability}
                onChange={handleChange}
                rows={3}
                placeholder="Explain production capacity and capability..."
                className={textareaClass(errors.productionCapability)}
              />
            </FormField>

            <FormField label="Automation Advantage" required error={errors.automationAdvantage}>
              <textarea
                name="automationAdvantage"
                value={form.automationAdvantage}
                onChange={handleChange}
                rows={3}
                placeholder="Explain automation features..."
                className={textareaClass(errors.automationAdvantage)}
              />
            </FormField>
          </div>
        </section>

        {/* TECHNICAL DETAILS */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#101E33]">Technical Specifications</h2>
              <p className="mt-1 text-xs text-[#8A94A4]">
                Add structured specifications like Make, Speed, Capacity, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={addSpec}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E1EF] bg-[#F4F7FB] px-4 py-2.5 text-sm font-semibold text-[#1B3A6B] transition hover:bg-[#EAF0F8]"
            >
              <FiPlus size={17} /> Add Specification
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {specs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8DDE5] bg-[#FBFBF9] px-5 py-8 text-center">
                <FiSettings className="mx-auto text-[#B1B8C3]" size={28} />
                <p className="mt-3 text-sm font-medium text-[#536071]">
                  No structured specifications added.
                </p>
                <button
                  type="button"
                  onClick={addSpec}
                  className="mt-3 text-sm font-semibold text-[#1B3A6B]"
                >
                  Add your first specification
                </button>
              </div>
            ) : (
              specs.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#536071]">
                      Specification #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSpec(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C0272D] hover:bg-[#FFF0F0]"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#101E33]">
                        Label
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateSpec(item.id, "label", e.target.value)}
                        placeholder="e.g. Speed / Capacity"
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#101E33]">
                        Value
                      </label>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateSpec(item.id, "value", e.target.value)}
                        placeholder="e.g. 150 meters/min"
                        className={inputClass()}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* DISPLAY SETTINGS */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="font-semibold text-[#101E33]">Display Settings</h2>
            <p className="mt-1 text-xs text-[#8A94A4]">Manage visibility and sorting order.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Display Order" required error={errors.displayOrder}>
              <input
                type="number"
                name="displayOrder"
                min={1}
                value={form.displayOrder}
                onChange={handleChange}
                className={inputClass(errors.displayOrder)}
              />
            </FormField>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#101E33]">Status</label>
              <label className="flex min-h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] px-4">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={handleEnabledChange}
                  className="h-4 w-4 rounded border-[#CBD1D9] accent-[#1B3A6B]"
                />
                <div>
                  <p className="text-sm font-medium text-[#101E33]">
                    {form.enabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-xs text-[#8A94A4]">
                    {form.enabled ? "Visible on public showcase." : "Hidden from public view."}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/machinery"
            className="inline-flex items-center justify-center rounded-xl border border-[#E1E4E8] bg-white px-5 py-3 text-sm font-semibold text-[#536071] hover:bg-[#F7F8FA]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#153056] disabled:opacity-60"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" size={17} /> Saving...
              </>
            ) : (
              <>
                <FiCheck size={17} /> {isEditMode ? "Update Machinery" : "Create Machinery"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* HELPER COMPONENTS AND CLASSES */
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#101E33]">
        {label} {required && <span className="text-[#C0272D]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#C0272D]">{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return `h-11 w-full rounded-xl border ${
    error ? "border-[#C0272D]" : "border-[#E7E9EC]"
  } bg-[#FBFBF9] px-4 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B]`;
}

function textareaClass(error?: string) {
  return `w-full rounded-xl border ${
    error ? "border-[#C0272D]" : "border-[#E7E9EC]"
  } bg-[#FBFBF9] px-4 py-3 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B]`;
}