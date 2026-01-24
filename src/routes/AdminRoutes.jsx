import { Route } from "react-router-dom";
import AdminRootlayout from "../Layout/AdminRootlayout";
import AdminNotFound from "../components/AdminNotFound";
import AdminDashboard from "../Layout/AdminDashboard";
import Admin_Login from "../Layout/Admin_Login";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import BookManagement from "../Layout/BookManagement";
import AddBook from "../components/AddBook";
import Register from "../components/Register";
import IssueBook from "../components/IssueBook";
import CategoryManagement from "../components/CategoryManagement";
import AuthorManagement from "../components/AuthorManagement";
import MemberManagement from "../Layout/MemberManagement";
import Return_Renew from "../Layout/Return-Renew";
import TransactionPage from "../Layout/TransactionPage";
import IssueHistory from "../Layout/IssueHistory";
export const AdminRoutes = (
  <>
    <Route path="/admin/login" element={<Admin_Login />} />
    <Route
      path="/admin/"
      element={
        <AdminProtectedRoute>
          <AdminRootlayout />
        </AdminProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="add-book" element={<AddBook />} />
      <Route path="register" element={<Register />} />
      <Route path="Transaction" element={<TransactionPage />} />
      <Route path="bookmanagement" element={<BookManagement />} />
      <Route path="issue-book" element={<IssueBook />} />
      <Route path="issue-history" element={<IssueHistory />} />
      <Route path="Genre" element={<CategoryManagement />} />
      <Route path="Author" element={<AuthorManagement />} />
      <Route path="return-renew" element={<Return_Renew />} />
      <Route path="membermanagement" element={<MemberManagement />} />
      <Route path="*" element={<AdminNotFound />} />
    </Route>
  </>
);
