import { Plugin } from "./plugin";
import {
  BARE_IMPORT_RE,
  DEFAULT_EXTERSIONS,
  PRE_BUNDLE_DIR,
} from "../contants";
import { ServerContext } from "../../index";
import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";
import {
  cleanUrl,
  isJSRequest,
  normalizePath
} from "../utils";
import path from "path";

export function importAnalysisPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: "m-vite:import-analysis",
    configureServer(s) {
      serverContext = s
    },
    async transform(code, id) {
      const resolve = async (id: string, importer?: string) => {
        let resolved = await serverContext.PluginContainer.resolveId(id, normalizePath(importer as string));

        if (!resolved) {
          return
        }
        const relPath = resolved.id.startsWith("/") ? resolved.id : normalizePath(
          path.join('/', path.relative(serverContext.root, resolved.id))
        );
        return relPath
      }
      if (!isJSRequest(id)) {
        return null
      }
      await init;
      const [imports] = parse(code);
      const ms = new MagicString(code);

      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo;
        if (!modSource) continue;
        if (BARE_IMPORT_RE.test(modSource as string)) {
          const bundlePath = normalizePath(
            path.join('/', PRE_BUNDLE_DIR, `${modSource}.js`)
          );
          ms.overwrite(modStart, modEnd, bundlePath as string)
        } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
          const resolved = await resolve(modSource, id) as string;
          if (resolved) {
            ms.overwrite(modStart, modEnd, resolved)
          }
        }
      }
      return {
        code: ms.toString(),
        map: ms.generateMap()
      }
    }
  }
}
