import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
const container = document.getElementById("root");
import ErrorBoundary from "./ErrorBoundary.jsx";

const app = createRoot(container);

app.render(
  <StrictMode>
    <ErrorBoundary fallback={<div>Sorry! Something went wrong.</div>}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
