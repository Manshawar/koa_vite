import React from "react";
import App from "./App"
import { createRoot } from "react-dom/client";
import "./index.css";


const root = createRoot(document.getElementById("root"));
root.render(<App />);
// @ts-ignore
// import.meta.hot.accept(() => {
//   ReactDOM.render(<App />, document.getElementById("root"));
// });
