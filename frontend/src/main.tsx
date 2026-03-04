import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import MyFilesPage from "./pages/MyFilesPage.tsx";
import TrashPage from "./pages/TrashPage.tsx";
import StoragePage from "./pages/StoragePage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import PublicOnlyRoute from "./routes/PublicOnlyRoute.tsx";

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
          { path: "trash", element: <TrashPage /> },
          { path: "storage", element: <StoragePage /> },
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
