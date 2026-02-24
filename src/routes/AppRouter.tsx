import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import SuperAdminPanel from "../pages/SuperAdminPanel";
import InteriorDesigner from "../pages/InteriorDesigner";

import Unauthorized from "../pages/Unauthorized";
import HomeOwner from "../pages/HomeOwner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute allowedRoles={["admin", "superadmin"]} />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
        ],
      },
      {
        element: <AdminRoute allowedRoles={["admin", "superadmin"]} />,
        children: [
          {
            path: "/interior-designers",
            element: <InteriorDesigner />,
          },
        ],
      },
      {
        element: <AdminRoute allowedRoles={["admin", "superadmin"]} />,
        children: [
          {
            path: "/home-owners",
            element: <HomeOwner />,
          },
        ],
      },
      {
        element: <AdminRoute allowedRoles={["superadmin"]} />,
        children: [
          {
            path: "/super-admin",
            element: <SuperAdminPanel />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
