import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter } from "./AppRouter.jsx";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
