import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";
import React from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./Redux/store.ts";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    <ToastContainer />
  </React.StrictMode>
);
