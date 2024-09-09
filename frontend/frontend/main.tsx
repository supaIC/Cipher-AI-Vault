// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { Parent } from "./Parent";
import { ActorProvider } from "./actors"; // Import the unified ActorProvider

// Create a root.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Initial render
root.render(
  <React.StrictMode>
    <ActorProvider>
      <Parent />
    </ActorProvider>
  </React.StrictMode>
);
