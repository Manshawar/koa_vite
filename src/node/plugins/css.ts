import { Plugin } from "./plugin";
import { CLIENT_PUBLIC_PATH } from "../contants";
import { ServerContext } from "../../index";
import { getShortName } from "../utils";
import fs from "fs-extra";
export function cssPlugin(): Plugin {
  let serverContext: ServerContext
  return {
    name: "css-plugin",
    configureServer(s) {
      serverContext = s
    },
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
import { createHotContext as __vite__createHotContext } from "${CLIENT_PUBLIC_PATH}";
import.meta.hot = __vite__createHotContext("/${getShortName(id, serverContext.root)}");

import { updateStyle, removeStyle } from "${CLIENT_PUBLIC_PATH}"
  
const id = '${id}';
const css = '${code.replace(/\s+/g, "")}';

updateStyle(id, css);
import.meta.hot.accept();
export default css;
import.meta.hot.prune(() => removeStyle(id));
`.trim();

        return {
          code: jsContent,
        };
      }
      return null
    }
  };
}
