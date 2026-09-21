import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">

      <Sidebar />

      <div className="lg:pl-[220px]">

        <Header />

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8 bg-[#EEF3FA]">
          <Outlet />
        </main>

      </div>

    </div>
  );
}