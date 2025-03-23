import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./Component/Layout";
import Login from "./Pages/Login"; // Trang đăng nhập
import Profile from "./Pages/Profile";
import Explore from "./Pages/Explore";
import Reels from "./Pages/Reels";
import Message from "./Pages/Messages";
import { JSX } from "@emotion/react/jsx-runtime";
import Register from "./Pages/register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const PrivateRoute = ({ element }: { element: JSX.Element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />, // Trang login
    },
    {
      path: "/register",
      element: <Register />, // Trang login
    },
    {
      path: "/",
      element: <PrivateRoute element={<Layout />} />,
      children: [
        {
          path: "/explore",
          element: <PrivateRoute element={<Explore />} />,
        },
        {
          path: "/profile",
          element: <PrivateRoute element={<Profile />} />,
        },
        {
          path: "/reels",
          element: <PrivateRoute element={<Reels />} />,
        },
        {
          path: "/message",
          element: <PrivateRoute element={<Message />} />,
        },
      ],
    },
  ]);
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
