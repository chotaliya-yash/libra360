import { Route } from "react-router-dom";
import RootLayout from "../Layout/RootLayout";
import HomePage from "../Layout/HomePage";
import NotFound from "../components/NotFound";
import Log_in from "../Layout/Log_in";
import UserProfile from "../Layout/UserProfile";
import ProtectedRoute from "../components/ProtectedRoute";
import MyBook from "../Layout/MyBook";

export const UserRoutes = (
  <>
    <Route path="/login" element={<Log_in />} />
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="mybook"
        element={
          <ProtectedRoute>
            <MyBook />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  </>
);
