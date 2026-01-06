import { Route } from "react-router-dom";
import AdminRootlayout from "../Layout/AdminRootlayout";
import NotFound from "../components/NotFound";
import AdminDashboard from "../Layout/AdminDashboard";
import Admin_Login from "../Layout/Admin_Login";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
export const AdminRoutes = (
  <>
    <Route path="/admin/login" element={<Admin_Login />} />
    <Route path="/admin" element={
      <AdminProtectedRoute>
        <AdminRootlayout />
      </AdminProtectedRoute>
    }>
      <Route index element={<AdminDashboard />} />
      <Route path="*" element={<NotFound value="admin" />} />
    </Route>
  </>
);
