import { Plugin } from "./plugin";
import fs from "fs-extra";
export function cssPlugin(): Plugin {
  return {
    name: "css-plugin",
    async load(id) {
      if (id.endsWith(".css")) {
        let cssCode = await fs.readFile(id, "utf-8");
        return {
          code: cssCode,
        };
      }
    },
    async transform(code, id) {
      if (id.endsWith(".css")) {
        code = code.trim().replace(/\n|\s+/g, "");
        const jsContent = `
const css = "${code}";
const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = css;
document.head.appendChild(style);
export default css;
`.trim();

        return {
          code: jsContent,
        };
      }
      return null
    }
  };
}
