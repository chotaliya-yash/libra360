import React from "react";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
// import { AdminRoutes } from "./routes/AdminRoutes";
import NotFound from "./components/NotFound";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {UserRoutes}
        {/* {AdminRoutes} */}
        <Route path="*" element={<NotFound />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;