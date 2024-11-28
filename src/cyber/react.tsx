import a from "./a.ts";
import React from "react";
import { createRoot } from "react-dom/client";
console.log(React, a);

const App = () => <div>react</div>;

const root = createRoot(document.getElementById("react"));
root.render(<App />);