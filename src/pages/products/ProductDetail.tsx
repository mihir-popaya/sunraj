import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiPackage,
  FiLayers,
  FiBox,
  FiMaximize,
  FiCalendar,
  FiHash,
} from "react-icons/fi";

import {
  getProductById,
  getProductBySlug,
} from "../../services/product.api";

import type { ProductItem } from "../../types/product";

export default function ProductDetail() {
  // ============================================================
  // URL PARAMS
  // ============================================================

  const {
    id,
    slug,
  } = useParams<{
    id?: string;
    slug?: string;
  }>();

  // ============================================================
  // STATE
  // ============================================================

  const [product, setProduct] =
    useState<ProductItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // DETERMINE VIEW
  // ============================================================

  const isAdminView = Boolean(id);

  // ============================================================
  // FETCH PRODUCT
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        let result:
          | ProductItem
          | undefined;

        if (id) {
          // Admin:
          // /admin/products/:id/view

          result =
            await getProductById(id);
        } else if (slug) {
          // Public:
          // /products/:slug

          result =
            await getProductBySlug(slug);
        }

        if (cancelled) {
          return;
        }

        if (!result) {
          setProduct(null);
          setError(
            "Product not found."
          );
          return;
        }

        setProduct(result);
      } catch (err) {
        console.error(
          "Failed to load product:",
          err
        );

        if (!cancelled) {
          setProduct(null);
          setError(
            "Unable to load product. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] px-4 py-10">
        <div className="mx-auto flex min-h-[400px] max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7E9EC] border-t-[#1B3A6B]" />

            <p className="text-sm font-medium text-[#6B7688]">
              Loading product...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PRODUCT NOT FOUND / ERROR
  // ============================================================

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[#E7E9EC] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FiXCircle
                size={30}
                className="text-[#C0272D]"
              />
            </div>

            <h1 className="text-2xl font-bold text-[#101E33]">
              Product Not Found
            </h1>

            <p className="mt-2 text-[#6B7688]">
              {error ||
                "The product you are looking for does not exist or may have been removed."}
            </p>

            {isAdminView ? (
              <Link
                to="/admin/products"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiArrowLeft size={17} />
                Back to Products
              </Link>
            ) : (
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
              >
                <FiArrowLeft size={17} />
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FBFBF9] px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">

        {/* ========================================================
            TOP BAR
        ======================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            to={
              isAdminView
                ? "/admin/products"
                : "/"
            }
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#6B7688] transition hover:text-[#1B3A6B]"
          >
            <FiArrowLeft size={18} />

            {isAdminView
              ? "Back to Products"
              : "Back to Home"}
          </Link>

          {isAdminView && (
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#152f58]"
            >
              <FiEdit2 size={16} />
              Edit Product
            </Link>
          )}
        </div>

        {/* ========================================================
            PRODUCT HEADER
        ======================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">

            {/* IMAGE */}

            <div className="flex min-h-[350px] items-center justify-center bg-[#F4F7FB] p-8 md:min-h-[450px]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-[400px] w-full max-w-[550px] rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                  <div className="text-center text-[#6B7688]">
                    <FiPackage
                      size={60}
                      className="mx-auto mb-3 opacity-40"
                    />

                    <p>
                      No product image
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* BASIC INFORMATION */}

            <div className="p-6 md:p-10">

              <div className="mb-4">
                <span className="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[#1B3A6B]">
                  {product.category ||
                    "Uncategorized"}
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight text-[#101E33] md:text-4xl">
                {product.name}
              </h1>

              <p className="whitespace-pre-line text-[15px] leading-7 text-[#6B7688]">
                {product.description ||
                  product.shortDescription ||
                  "No detailed description available."}
              </p>

              <div className="mt-6 flex items-center gap-3">
                {product.enabled ? (
                  <>
                    <FiCheckCircle
                      size={20}
                      className="text-green-600"
                    />

                    <span className="font-semibold text-green-700">
                      Enabled
                    </span>
                  </>
                ) : (
                  <>
                    <FiXCircle
                      size={20}
                      className="text-[#C0272D]"
                    />

                    <span className="font-semibold text-[#C0272D]">
                      Disabled
                    </span>
                  </>
                )}
              </div>

              <div className="mt-8 border-t border-[#E7E9EC] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                  Product URL
                </p>

                <p className="mt-2 break-all rounded-lg bg-[#F4F7FB] px-3 py-2 font-mono text-sm text-[#1B3A6B]">
                  /products/{product.slug}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            PRODUCT SPECIFICATIONS
        ======================================================== */}

        <div className="mt-6">

          <h2 className="mb-4 text-xl font-bold text-[#101E33]">
            Product Specifications
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* APPLICATION */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">
                <FiBox
                  size={20}
                  className="text-[#1B3A6B]"
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Application
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {product.application ||
                  "Not specified"}
              </p>
            </div>

            {/* MATERIAL */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">
                <FiLayers
                  size={20}
                  className="text-[#1B3A6B]"
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Material
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {product.material ||
                  "Not specified"}
              </p>
            </div>

            {/* DIMENSIONS */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">
                <FiMaximize
                  size={20}
                  className="text-[#1B3A6B]"
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Dimensions
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {product.dimensions ||
                  "Not specified"}
              </p>
            </div>

            {/* DISPLAY ORDER */}

            <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF3FA]">
                <FiHash
                  size={20}
                  className="text-[#1B3A6B]"
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Display Order
              </p>

              <p className="mt-2 font-semibold text-[#101E33]">
                {product.displayOrder}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            DESCRIPTION
        ======================================================== */}

        <div className="mt-6 rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-xl font-bold text-[#101E33]">
            Product Description
          </h2>

          <div className="mt-4 border-t border-[#E7E9EC] pt-5">
            <p className="whitespace-pre-line text-[15px] leading-7 text-[#6B7688]">
              {product.shortDescription ||
                "No detailed description available."}
            </p>
          </div>
        </div>

        {/* ========================================================
            PRODUCT INFORMATION
        ======================================================== */}

        <div className="mt-6 rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-xl font-bold text-[#101E33]">
            Product Information
          </h2>

          <div className="mt-5 grid gap-5 border-t border-[#E7E9EC] pt-5 sm:grid-cols-2">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Product ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-[#101E33]">
                {product.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Slug
              </p>

              <p className="mt-1 break-all font-mono text-sm text-[#101E33]">
                {product.slug}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Created At
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">
                <FiCalendar size={15} />
                {formatDate(product.createdAt)}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7688]">
                Last Updated
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-[#101E33]">
                <FiCalendar size={15} />
                {formatDate(product.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BOTTOM ACTIONS
        ======================================================== */}

        <div className="mt-6 flex flex-col gap-3 pb-10 sm:flex-row">

          <Link
            to={
              isAdminView
                ? "/admin/products"
                : "/"
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8DEE7] bg-white px-5 py-3 text-sm font-semibold text-[#101E33] transition hover:bg-[#F4F7FB]"
          >
            <FiArrowLeft size={17} />

            {isAdminView
              ? "Back to Products"
              : "Back to Home"}
          </Link>

          {isAdminView && (
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152f58]"
            >
              <FiEdit2 size={17} />
              Edit Product
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}