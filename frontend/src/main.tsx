import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import MyFilesPage from "./pages/MyFilesPage.tsx";
import StoragePage from "./pages/StoragePage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import PublicOnlyRoute from "./routes/PublicOnlyRoute.tsx";
import StarredPage from "./pages/StarredPage.tsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "files", element: <MyFilesPage /> },
          { path: "files/folder/:folderId", element: <MyFilesPage /> },
          { path: "storage", element: <StoragePage /> },
          { path: "favorites", element: <StarredPage /> },
          { path: "admin", element: <AdminDashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
