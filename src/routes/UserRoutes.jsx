import { Route } from "react-router-dom";
import RootLayout from "../Layout/RootLayout";
import HomePage from "../Layout/HomePage";
import NotFound from "../components/NotFound";
// import ProtectedRoute from "../components/ProtectedRoute";  

export const UserRoutes = (
  <Route path="/" element={<RootLayout />}>
    <Route index element={<HomePage />} />
    {/* <Route path="login" element={<Log_in />} /> */}
    {/* <Route path="signin" element={<Signin />} /> */}
    <Route path="*" element={<NotFound />} />
    {/* Protected User Routes
    <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<Profile />} />
    </Route> */}
  </Route>
);