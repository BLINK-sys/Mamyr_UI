import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminLocations from "@/pages/admin/Locations";
import AdminCategories from "@/pages/admin/Categories";
import AdminDishes from "@/pages/admin/Dishes";
import AdminBanners from "@/pages/admin/Banners";
import AdminStaff from "@/pages/admin/Staff";
import FooterManagement from "@/pages/admin/FooterManagement";

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/locations" replace />} />
        <Route path="/locations" element={<AdminLocations />} />
        <Route path="/categories" element={<AdminCategories />} />
        <Route path="/dishes" element={<AdminDishes />} />
        <Route path="/banners" element={<AdminBanners />} />
        <Route path="/staff" element={<AdminStaff />} />
        <Route path="/footer" element={<FooterManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
