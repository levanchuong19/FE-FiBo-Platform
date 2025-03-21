import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Component/Layout";
// import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import Explore from "./Pages/Explore";
import Reels from "./Pages/Reels";
import Message from "./Pages/Messages";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/explore",
          element: <Explore />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/reels",
          element: <Reels />,
        },
        {
          path: "/message",
          element: <Message />,
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
