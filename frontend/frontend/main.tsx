import React from "react";
import ReactDOM from "react-dom/client"; // Updated import
import "./styles/index.css";
import { Parent } from "./Parent";

// Create a root.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Initial render
root.render(
  <React.StrictMode>
    <Parent />
  </React.StrictMode>
)