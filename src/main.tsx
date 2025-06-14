import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <StagewiseToolbar
      config={{
        plugins: [ReactPlugin],
      }}
    />
  </StrictMode>
);
