// import React from "react";
import App from "./App";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// //@ts-ignore
// console.log(import.meta.hot);

// let root;
// function render(App) {
//   const container = document.getElementById("root");
//   const reactContainer = createRoot(container);

//   // 如果还没有创建过根实例，则创建并赋值给全局变量
//   if (!root) {
//     root = reactContainer;
//   }

//   // 使用现有的根实例进行渲染
//   root.render(<App />);
// }
// render(App);
//@ts-ignore
// import.meta.hot.accept(() => {
//   root.render(<App />);
// });
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// const App = () => <div>hello 12fdsaf3sdsfadsaf</div>;
const root = createRoot(document.getElementById("root"));
root.render(<App></App>);
// @ts-ignore
import.meta.hot.accept(() => {
  const root = createRoot(document.getElementById("root"));
  root.render(<App></App>);
});
