import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { FaLeaf } from "react-icons/fa";

import { Link, useNavigate, useParams } from "react-router-dom";

import type {
  SustainabilityData,
  SustainabilityInitiative,
} from "../../types/sustainability";

import {
  getSustainability,
  updateSustainability,
} from "../../services/sustainability.api";

// Maximum image size accepted for upload (2 MB).
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type TextField = Exclude<
  keyof SustainabilityData,
  "id" | "initiatives" | "enabled" | "createdAt" | "updatedAt"
>;

export default function SustainabilityForm() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [data, setData] =
    useState<SustainabilityData | null>(null);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [saving, setSaving] = useState(false);

  const [deleteInitiativeId, setDeleteInitiativeId] =
    useState<string | null>(null);

  const [isDraggingHero, setIsDraggingHero] =
    useState(false);

  const [isDraggingOverview, setIsDraggingOverview] =
    useState(false);

  const heroFileInputRef =
    useRef<HTMLInputElement | null>(null);

  const overviewFileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const sustainability = getSustainability();

    if (id && sustainability.id !== id) {
      navigate("/admin/sustainability", {
        replace: true,
      });

      return;
    }

    setData(sustainability);
  }, [id, navigate]);

  function updateField(
    field: TextField,
    value: string
  ) {
    setData((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous
    );

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }

  function updateInitiative(
    initiativeId: string,
    field: keyof SustainabilityInitiative,
    value: string | number | boolean
  ) {
    setData((previous) =>
      previous
        ? {
            ...previous,

            initiatives: previous.initiatives.map(
              (initiative) =>
                initiative.id === initiativeId
                  ? {
                      ...initiative,
                      [field]: value,
                    }
                  : initiative
            ),
          }
        : previous
    );

    setErrors((previous) => ({
      ...previous,
      [`initiative-${initiativeId}-${field}`]: "",
    }));
  }

  // ============================================================
  // IMAGE UPLOAD (choose file -> base64 data URL)
  // ============================================================

  function readImageFile(
    file: File,
    field: "heroImage" | "overviewImage"
  ) {
    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        [field]: "Please choose a valid image file.",
      }));

      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((previous) => ({
        ...previous,
        [field]: "Image must be smaller than 2MB.",
      }));

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField(field, String(reader.result ?? ""));
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        [field]:
          "Could not read the selected image. Please try again.",
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleHeroImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      readImageFile(file, "heroImage");
    }

    event.target.value = "";
  }

  function handleOverviewImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      readImageFile(file, "overviewImage");
    }

    event.target.value = "";
  }

  function handleHeroImageDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDraggingHero(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      readImageFile(file, "heroImage");
    }
  }

  function handleOverviewImageDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDraggingOverview(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      readImageFile(file, "overviewImage");
    }
  }

  function handleRemoveHeroImage() {
    updateField("heroImage", "");

    if (heroFileInputRef.current) {
      heroFileInputRef.current.value = "";
    }
  }

  function handleRemoveOverviewImage() {
    updateField("overviewImage", "");

    if (overviewFileInputRef.current) {
      overviewFileInputRef.current.value = "";
    }
  }

  // ============================================================
  // INITIATIVES
  // ============================================================

  function addInitiative() {
    setData((previous) => {
      if (!previous) return previous;

      const newInitiative: SustainabilityInitiative = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,

        title: "",
        description: "",
        icon: "leaf",
        displayOrder: previous.initiatives.length + 1,
        enabled: true,
      };

      return {
        ...previous,
        initiatives: [...previous.initiatives, newInitiative],
      };
    });
  }

  function removeInitiative(initiativeId: string) {
    setData((previous) => {
      if (!previous) return previous;

      const remaining = previous.initiatives.filter(
        (initiative) => initiative.id !== initiativeId
      );

      const reordered = remaining.map((initiative, index) => ({
        ...initiative,
        displayOrder: index + 1,
      }));

      return {
        ...previous,
        initiatives: reordered,
      };
    });

    setDeleteInitiativeId(null);
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  function validate(current: SustainabilityData) {
    const newErrors: Record<string, string> = {};

    if (!current.heroTitle.trim()) {
      newErrors.heroTitle = "Hero title is required.";
    }

    if (!current.heroDescription.trim()) {
      newErrors.heroDescription =
        "Hero description is required.";
    }

    if (!current.overviewTitle.trim()) {
      newErrors.overviewTitle =
        "Overview title is required.";
    }

    if (!current.overviewDescription.trim()) {
      newErrors.overviewDescription =
        "Overview description is required.";
    }

    if (!current.commitmentTitle.trim()) {
      newErrors.commitmentTitle =
        "Commitment title is required.";
    }

    if (!current.commitmentDescription.trim()) {
      newErrors.commitmentDescription =
        "Commitment description is required.";
    }

    if (!current.environmentTitle.trim()) {
      newErrors.environmentTitle =
        "Environment title is required.";
    }

    if (!current.environmentDescription.trim()) {
      newErrors.environmentDescription =
        "Environment description is required.";
    }

    if (!current.responsibleManufacturingTitle.trim()) {
      newErrors.responsibleManufacturingTitle =
        "Section title is required.";
    }

    if (!current.responsibleManufacturingDescription.trim()) {
      newErrors.responsibleManufacturingDescription =
        "Description is required.";
    }

    if (!current.futureTitle.trim()) {
      newErrors.futureTitle = "Future title is required.";
    }

    if (!current.futureDescription.trim()) {
      newErrors.futureDescription =
        "Future description is required.";
    }

    current.initiatives.forEach((initiative) => {
      if (!initiative.title.trim()) {
        newErrors[`initiative-${initiative.id}-title`] =
          "Title is required.";
      }

      if (!initiative.description.trim()) {
        newErrors[`initiative-${initiative.id}-description`] =
          "Description is required.";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!data) return;

    if (!validate(data)) {
      return;
    }

    setSaving(true);

    try {
      updateSustainability(data);
      navigate("/admin/sustainability");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!data) {
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
            to="/admin/sustainability"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E7E9EC] bg-white text-[#6B7688] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5EE] text-[#1B3A6B] sm:flex">
              <FaLeaf size={19} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#101E33]">
                Edit Sustainability
              </h1>
              <p className="mt-0.5 text-sm text-[#6B7688]">
                Update sustainability page content and initiatives.
              </p>
            </div>

          </div>
        </div>

        {/* Right Side: Positioned Save Action Button */}
        <div className="flex items-center gap-3">

          <Link
            to="/admin/sustainability"
            className="inline-flex items-center justify-center rounded-xl border border-[#E7E9EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#101E33] hover:bg-[#F7F8FA]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="sustainability-management-form"
            disabled={saving}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142d54] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>

      <form
        id="sustainability-management-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Hero Section */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Hero Section
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Content displayed at the top of the sustainability page.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            <Field label="Hero Badge">
              <input
                value={data.heroBadge}
                onChange={(e) =>
                  updateField("heroBadge", e.target.value)
                }
                placeholder="Sustainability"
                className={inputClass()}
              />
            </Field>

            <Field
              label="Hero Title"
              required
              error={errors.heroTitle}
            >
              <input
                value={data.heroTitle}
                onChange={(e) =>
                  updateField("heroTitle", e.target.value)
                }
                placeholder="Building responsibly for"
                className={inputClass(errors.heroTitle)}
              />
            </Field>

            <Field label="Highlight Text">
              <input
                value={data.heroHighlight}
                onChange={(e) =>
                  updateField("heroHighlight", e.target.value)
                }
                placeholder="a better future."
                className={inputClass()}
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Hero Image"
                error={errors.heroImage}
              >
                <ImageUploadField
                  image={data.heroImage}
                  fileInputRef={heroFileInputRef}
                  onChange={handleHeroImageChange}
                  onDrop={handleHeroImageDrop}
                  isDragging={isDraggingHero}
                  setIsDragging={setIsDraggingHero}
                  onRemove={handleRemoveHeroImage}
                  hasError={Boolean(errors.heroImage)}
                  alt="Hero"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Hero Description"
                required
                error={errors.heroDescription}
              >
                <textarea
                  rows={5}
                  value={data.heroDescription}
                  onChange={(e) =>
                    updateField(
                      "heroDescription",
                      e.target.value
                    )
                  }
                  placeholder="Enter hero description..."
                  className={textareaClass(
                    errors.heroDescription
                  )}
                />
              </Field>
            </div>

          </div>
        </section>

        {/* Overview Section */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Overview Section
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            <Field
              label="Overview Title"
              required
              error={errors.overviewTitle}
            >
              <input
                value={data.overviewTitle}
                onChange={(e) =>
                  updateField("overviewTitle", e.target.value)
                }
                className={inputClass(errors.overviewTitle)}
              />
            </Field>

            <div />

            <div className="md:col-span-2">
              <Field
                label="Overview Image"
                error={errors.overviewImage}
              >
                <ImageUploadField
                  image={data.overviewImage}
                  fileInputRef={overviewFileInputRef}
                  onChange={handleOverviewImageChange}
                  onDrop={handleOverviewImageDrop}
                  isDragging={isDraggingOverview}
                  setIsDragging={setIsDraggingOverview}
                  onRemove={handleRemoveOverviewImage}
                  hasError={Boolean(errors.overviewImage)}
                  alt="Overview"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Overview Description"
                required
                error={errors.overviewDescription}
              >
                <textarea
                  rows={5}
                  value={data.overviewDescription}
                  onChange={(e) =>
                    updateField(
                      "overviewDescription",
                      e.target.value
                    )
                  }
                  className={textareaClass(
                    errors.overviewDescription
                  )}
                />
              </Field>
            </div>

          </div>
        </section>

        {/* Initiatives */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="flex flex-col gap-4 border-b border-[#E7E9EC] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#101E33]">
                Sustainability Initiatives
              </h2>

              <p className="mt-1 text-sm text-[#6B7688]">
                Add, edit or remove sustainability initiatives.
              </p>
            </div>

            <button
              type="button"
              onClick={addInitiative}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E1EF] bg-[#F4F7FB] px-4 py-2.5 text-sm font-semibold text-[#1B3A6B] transition hover:bg-[#EAF0F8]"
            >
              <FiPlus size={17} />
              Add Initiative
            </button>
          </div>

          <div className="space-y-4 p-6">

            {data.initiatives.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8DDE5] bg-[#FBFBF9] px-5 py-8 text-center">
                <FaLeaf
                  className="mx-auto text-[#B1B8C3]"
                  size={28}
                />

                <p className="mt-3 text-sm font-medium text-[#536071]">
                  No initiatives added.
                </p>

                <button
                  type="button"
                  onClick={addInitiative}
                  className="mt-3 text-sm font-semibold text-[#1B3A6B]"
                >
                  Add your first initiative
                </button>
              </div>
            ) : (
              data.initiatives.map((initiative, index) => (
                <div
                  key={initiative.id}
                  className="rounded-xl border border-[#E7E9EC] bg-[#FBFBF9] p-4"
                >

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#536071]">
                      Initiative #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteInitiativeId(initiative.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C0272D] transition hover:bg-[#FFF0F0]"
                      aria-label="Remove initiative"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#101E33]">
                        Title
                        <span className="ml-1 text-[#C0272D]">*</span>
                      </label>

                      <input
                        value={initiative.title}
                        onChange={(e) =>
                          updateInitiative(
                            initiative.id,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Waste Reduction"
                        className={inputClass(
                          errors[
                            `initiative-${initiative.id}-title`
                          ]
                        )}
                      />

                      {errors[
                        `initiative-${initiative.id}-title`
                      ] && (
                        <p className="mt-1.5 text-xs text-[#C0272D]">
                          {
                            errors[
                              `initiative-${initiative.id}-title`
                            ]
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#101E33]">
                        Icon
                      </label>

                      <select
                        value={initiative.icon}
                        onChange={(e) =>
                          updateInitiative(
                            initiative.id,
                            "icon",
                            e.target.value
                          )
                        }
                        className={inputClass()}
                      >
                        <option value="leaf">Leaf</option>
                        <option value="recycle">Recycle</option>
                        <option value="zap">Energy</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#101E33]">
                        Display Order
                      </label>

                      <input
                        type="number"
                        min={1}
                        value={initiative.displayOrder}
                        onChange={(e) =>
                          updateInitiative(
                            initiative.id,
                            "displayOrder",
                            Number(e.target.value)
                          )
                        }
                        className={inputClass()}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#101E33]">
                        Status
                      </label>

                      <select
                        value={
                          initiative.enabled
                            ? "enabled"
                            : "disabled"
                        }
                        onChange={(e) =>
                          updateInitiative(
                            initiative.id,
                            "enabled",
                            e.target.value === "enabled"
                          )
                        }
                        className={inputClass()}
                      >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-[#101E33]">
                        Description
                        <span className="ml-1 text-[#C0272D]">*</span>
                      </label>

                      <textarea
                        rows={3}
                        value={initiative.description}
                        onChange={(e) =>
                          updateInitiative(
                            initiative.id,
                            "description",
                            e.target.value
                          )
                        }
                        className={textareaClass(
                          errors[
                            `initiative-${initiative.id}-description`
                          ]
                        )}
                      />

                      {errors[
                        `initiative-${initiative.id}-description`
                      ] && (
                        <p className="mt-1.5 text-xs text-[#C0272D]">
                          {
                            errors[
                              `initiative-${initiative.id}-description`
                            ]
                          }
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              ))
            )}

          </div>
        </section>

        {/* Commitment */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Commitment
            </h2>
          </div>

          <div className="grid gap-6 p-6">

            <Field
              label="Commitment Title"
              required
              error={errors.commitmentTitle}
            >
              <input
                value={data.commitmentTitle}
                onChange={(e) =>
                  updateField(
                    "commitmentTitle",
                    e.target.value
                  )
                }
                className={inputClass(errors.commitmentTitle)}
              />
            </Field>

            <Field
              label="Commitment Description"
              required
              error={errors.commitmentDescription}
            >
              <textarea
                rows={4}
                value={data.commitmentDescription}
                onChange={(e) =>
                  updateField(
                    "commitmentDescription",
                    e.target.value
                  )
                }
                className={textareaClass(
                  errors.commitmentDescription
                )}
              />
            </Field>

          </div>
        </section>

        {/* Environment */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Environmental Responsibility
            </h2>
          </div>

          <div className="grid gap-6 p-6">

            <Field
              label="Section Title"
              required
              error={errors.environmentTitle}
            >
              <input
                value={data.environmentTitle}
                onChange={(e) =>
                  updateField(
                    "environmentTitle",
                    e.target.value
                  )
                }
                className={inputClass(errors.environmentTitle)}
              />
            </Field>

            <Field
              label="Description"
              required
              error={errors.environmentDescription}
            >
              <textarea
                rows={4}
                value={data.environmentDescription}
                onChange={(e) =>
                  updateField(
                    "environmentDescription",
                    e.target.value
                  )
                }
                className={textareaClass(
                  errors.environmentDescription
                )}
              />
            </Field>

          </div>
        </section>

        {/* Responsible Manufacturing */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Responsible Manufacturing
            </h2>
          </div>

          <div className="grid gap-6 p-6">

            <Field
              label="Section Title"
              required
              error={errors.responsibleManufacturingTitle}
            >
              <input
                value={data.responsibleManufacturingTitle}
                onChange={(e) =>
                  updateField(
                    "responsibleManufacturingTitle",
                    e.target.value
                  )
                }
                className={inputClass(
                  errors.responsibleManufacturingTitle
                )}
              />
            </Field>

            <Field
              label="Description"
              required
              error={errors.responsibleManufacturingDescription}
            >
              <textarea
                rows={4}
                value={
                  data.responsibleManufacturingDescription
                }
                onChange={(e) =>
                  updateField(
                    "responsibleManufacturingDescription",
                    e.target.value
                  )
                }
                className={textareaClass(
                  errors.responsibleManufacturingDescription
                )}
              />
            </Field>

          </div>
        </section>

        {/* Future */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Future
            </h2>
          </div>

          <div className="grid gap-6 p-6">

            <Field
              label="Future Title"
              required
              error={errors.futureTitle}
            >
              <input
                value={data.futureTitle}
                onChange={(e) =>
                  updateField("futureTitle", e.target.value)
                }
                className={inputClass(errors.futureTitle)}
              />
            </Field>

            <Field
              label="Future Description"
              required
              error={errors.futureDescription}
            >
              <textarea
                rows={4}
                value={data.futureDescription}
                onChange={(e) =>
                  updateField(
                    "futureDescription",
                    e.target.value
                  )
                }
                className={textareaClass(
                  errors.futureDescription
                )}
              />
            </Field>

          </div>
        </section>

        {/* Publishing */}
        <section className="rounded-2xl border border-[#E7E9EC] bg-white">

          <div className="border-b border-[#E7E9EC] p-6">
            <h2 className="text-base font-semibold text-[#101E33]">
              Publishing Settings
            </h2>

            <p className="mt-1 text-sm text-[#6B7688]">
              Control whether visitors can see the public
              sustainability page.
            </p>
          </div>

          <div className="p-6">

            <button
              type="button"
              onClick={() =>
                setData((previous) =>
                  previous
                    ? { ...previous, enabled: !previous.enabled }
                    : previous
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-[#E7E9EC] px-4 py-3 sm:max-w-md"
            >

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    data.enabled
                      ? "bg-[#EAF5EE] text-[#1E7A4C]"
                      : "bg-[#F1F3F6] text-[#6B7688]"
                  }`}
                >
                  <FaLeaf size={16} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-[#101E33]">
                    {data.enabled ? "Published" : "Unpublished"}
                  </p>

                  <p className="text-xs text-[#6B7688]">
                    {data.enabled
                      ? "Visible on website"
                      : "Hidden from website"}
                  </p>
                </div>

              </div>

              <div
                className={`relative h-6 w-11 rounded-full transition ${
                  data.enabled ? "bg-[#1E7A4C]" : "bg-[#CBD0D6]"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    data.enabled ? "left-6" : "left-1"
                  }`}
                />
              </div>

            </button>

          </div>
        </section>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Link
            to="/admin/sustainability"
            className="inline-flex items-center justify-center rounded-xl border border-[#E7E9EC] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] hover:bg-[#F6F7F9]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#142d54] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

      {/* ======================================================
          DELETE INITIATIVE MODAL
      ======================================================= */}

      {deleteInitiativeId && (
        <div className="
          fixed inset-0 z-50
          flex items-center
          justify-center
          bg-black/40 px-4
        ">

          <div className="
            w-full max-w-md
            rounded-2xl
            bg-white p-6
            shadow-2xl
          ">

            <div className="
              flex h-12 w-12
              items-center
              justify-center
              rounded-xl
              bg-[#FFF0F0]
              text-[#C0272D]
            ">
              <FiTrash2 size={21} />
            </div>

            <h2 className="
              mt-4 text-lg
              font-semibold
              text-[#101E33]
            ">
              Delete initiative?
            </h2>

            <p className="
              mt-2 text-sm
              leading-6
              text-[#6B7688]
            ">
              This action cannot be undone. The initiative
              will be removed once you save your changes.
            </p>

            <div className="
              mt-6 flex
              justify-end gap-3
            ">

              <button
                type="button"
                onClick={() => setDeleteInitiativeId(null)}
                className="
                  rounded-xl
                  border border-[#E1E4E8]
                  px-4 py-2.5
                  text-sm font-medium
                  text-[#536071]
                  hover:bg-[#F7F8FA]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  removeInitiative(deleteInitiativeId)
                }
                className="
                  rounded-xl
                  bg-[#C0272D]
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  hover:bg-[#A91F24]
                "
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// FIELD
// ============================================================

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#101E33]">
        {label}
        {required && (
          <span className="text-[#C0272D]">{" "}*</span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-[#C0272D]">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// IMAGE UPLOAD FIELD
// ============================================================

interface ImageUploadFieldProps {
  image: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  onRemove: () => void;
  hasError: boolean;
  alt: string;
}

function ImageUploadField({
  image,
  fileInputRef,
  onChange,
  onDrop,
  isDragging,
  setIsDragging,
  onRemove,
  hasError,
  alt,
}: ImageUploadFieldProps) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />

      {image ? (
        <div className="relative overflow-hidden rounded-xl border border-[#E7E9EC] bg-[#F8F9FA]">

          <img
            src={image}
            alt={alt}
            className="h-40 w-full object-contain p-2"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
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
              onClick={onRemove}
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
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition ${
            isDragging
              ? "border-[#1B3A6B] bg-[#EEF3FA]"
              : hasError
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
    </>
  );
}

// ============================================================
// INPUT / TEXTAREA CLASS HELPERS
// ============================================================

function inputClass(error?: string) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
    error
      ? "border-[#C0272D]"
      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
  }`;
}

function textareaClass(error?: string) {
  return `w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${
    error
      ? "border-[#C0272D]"
      : "border-[#E7E9EC] focus:border-[#1B3A6B]"
  }`;
}