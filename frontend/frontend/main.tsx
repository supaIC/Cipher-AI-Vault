// index.tsx
import React from "react";
import { createRoot } from "react-dom/client"; // Import from 'react-dom/client'
import "./styles/index.css";
import { Parent } from "./Parent";
import { ActorProvider } from "./actors";

// Select the root element from the DOM
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

// Create a root.
const root = createRoot(container); // Create a root using React 18's createRoot

// Initial render: Render your application
root.render(
  <React.StrictMode>
    <ActorProvider>
      <Parent />
    </ActorProvider>
  </React.StrictMode>
);
