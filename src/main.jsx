import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/buttons.css";
import "./styles/forms.css";
import "react-day-picker/style.css";
import "./styles/drawer.css";
import React from "react";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
