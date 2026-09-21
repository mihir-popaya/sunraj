import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import Products from "../pages/products/Products";
import ProductForm from "../pages/products/ProductForm";
import ProductDetail from "../pages/products/ProductDetail";

import Machinery from "../pages/machinery/Machinery";
import MachineryForm from "../pages/machinery/MachineryForm";
import MachineryDetail from "../pages/machinery/MachineryDetail";

import Industries from "../pages/industries/Industries";
import IndustryForm from "../pages/industries/IndustryForm";
import IndustryDetail from "../pages/industries/IndustryDetail";

import Sustainability from "../pages/sustainability/Sustainability";
import SustainabilityForm from "../pages/sustainability/SustainabilityForm";
import SustainabilityDetail from "../pages/sustainability/SustainabilityDetail";

import Messages from "../pages/messages/Messages";
import MessageDetail from "../pages/messages/MessageDetail";

import ManufacturingProcess from "../pages/manufacturingProcess/ManufacturingProcess";
import ManufacturingProcessForm from "../pages/manufacturingProcess/ManufacturingProcessForm";
import ManufacturingProcessDetail from "../pages/manufacturingProcess/ManufacturingProcessDetail";

import Career from "../pages/career/Career";

import { useAuthStore } from "../store/authStore";


// ============================================
// PROTECTED ADMIN ROUTES
// ============================================

function ProtectedAdminRoutes() {
  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated
    );

  const isLoading =
    useAuthStore(
      (state) => state.isLoading
    );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBF9]">
        <div className="text-sm text-[#6B7688]">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <AdminLayout />;
}

// ============================================
// APP ROUTES
// ============================================

export default function AppRoutes() {
  return (
    <Routes>

      {/* ROOT */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* AUTH */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* PUBLIC DETAIL PAGES */}

      <Route
        path="/products/:slug"
        element={<ProductDetail />}
      />

      <Route
        path="/machinery/:slug"
        element={<MachineryDetail />}
      />

      <Route
        path="/industries/:slug"
        element={<IndustryDetail />}
      />

      <Route
        path="/sustainability"
        element={<SustainabilityDetail />}
      />

      <Route
        path="/manufacturing-process/:slug"
        element={<ManufacturingProcessDetail />}
      />

      {/* ========================================
          PROTECTED ADMIN ROUTES
      ======================================== */}

      <Route element={<ProtectedAdminRoutes />}>

        {/* Dashboard */}

        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        {/* Products */}

        <Route
          path="/admin/products"
          element={<Products />}
        />

        <Route
          path="/admin/products/new"
          element={<ProductForm />}
        />

        <Route
          path="/admin/products/:id/edit"
          element={<ProductForm />}
        />

        <Route
          path="/admin/products/:id/view"
          element={<ProductDetail />}
        />

        {/* Machinery */}

        <Route
          path="/admin/machinery"
          element={<Machinery />}
        />

        <Route
          path="/admin/machinery/new"
          element={<MachineryForm />}
        />

        <Route
          path="/admin/machinery/:id/edit"
          element={<MachineryForm />}
        />

        <Route
          path="/admin/machinery/:id/view"
          element={<MachineryDetail />}
        />

        {/* Industries */}

        <Route
          path="/admin/industries"
          element={<Industries />}
        />

        <Route
          path="/admin/industries/new"
          element={<IndustryForm />}
        />

        <Route
          path="/admin/industries/:id/edit"
          element={<IndustryForm />}
        />

        <Route
          path="/admin/industries/:id/view"
          element={<IndustryDetail />}
        />

        {/* Sustainability */}

        <Route
          path="/admin/sustainability"
          element={<Sustainability />}
        />

        <Route
          path="/admin/sustainability/:id/edit"
          element={<SustainabilityForm />}
        />

        <Route
          path="/admin/sustainability/:id/view"
          element={<SustainabilityDetail />}
        />

        {/* Messages */}

        <Route
          path="/admin/messages"
          element={<Messages />}
        />

        <Route
          path="/admin/messages/:id"
          element={<MessageDetail />}
        />

        {/* Manufacturing Process */}

        <Route
          path="/admin/manufacturing-process"
          element={<ManufacturingProcess />}
        />

        <Route
          path="/admin/manufacturing-process/new"
          element={<ManufacturingProcessForm />}
        />

        <Route
          path="/admin/manufacturing-process/:id/edit"
          element={<ManufacturingProcessForm />}
        />

        <Route
          path="/admin/manufacturing-process/:id/view"
          element={<ManufacturingProcessDetail />}
        />

        {/* Career */}

        <Route
          path="/admin/career"
          element={<Career />}
        />

      </Route>

      {/* FALLBACK */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}