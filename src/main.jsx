import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { NoticeProvider } from "./context/NoticeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NoticeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NoticeProvider>
  </React.StrictMode>
);
