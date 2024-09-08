// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { Parent } from "./Parent";
import { AuthActorProvider, DataActorProvider, BackendActorProvider, DistroActorProvider } from "./context"; // Import all the providers

// Create a root.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Initial render
root.render(
  <React.StrictMode>
    <AuthActorProvider>
      <DataActorProvider>
        <BackendActorProvider>
          <DistroActorProvider>
            <Parent />
          </DistroActorProvider>
        </BackendActorProvider>
      </DataActorProvider>
    </AuthActorProvider>
  </React.StrictMode>
);