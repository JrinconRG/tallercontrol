import './styles/variables.css'
import './styles/globals.css'
import './styles/layout.css'
import './styles/buttons.css'
import './styles/forms.css'

import React from "react";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

