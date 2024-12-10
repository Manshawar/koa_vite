import { CLIENT_PUBLIC_PATH, HMR_PORT } from "../contants";
import { Plugin } from "./plugin";
import fs from "fs-extra";
import esbuild from "esbuild"
import path from "path";
import { ServerContext } from "../../index";
function clientInjectPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: "m-vite:client-inject",
    configureServer(s) {
      serverContext = s
    },
    resolveId(id) {
      if (id === CLIENT_PUBLIC_PATH) {
        return { id }
      }
      return null
    },
    async load(id) {
      if (id === CLIENT_PUBLIC_PATH) {

        let realpath = path.join(import.meta.dirname, "hmr", "client.ts");
        let { code } = await esbuild.transform(await fs.readFile(realpath, "utf-8"), {
          loader: "ts",
          target: "esnext"
        })
        code = code.replace("__HMR_PORT__", JSON.stringify(HMR_PORT));
        return code
      }

    },
    transformIndexHtml(raw) {
      return raw.replace(/(<head[^>]*>)/i, `$1<script type="module" src="${CLIENT_PUBLIC_PATH}"></script>`)
    }
  }
}
export { clientInjectPlugin }