import App from "./App";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(() => {
    root.render(<App />);
  });
}
