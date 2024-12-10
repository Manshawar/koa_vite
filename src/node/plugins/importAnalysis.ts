import { Plugin } from "./plugin";
import {
  BARE_IMPORT_RE,
  DEFAULT_EXTERSIONS,
  PRE_BUNDLE_DIR,
  CLIENT_PUBLIC_PATH
} from "../contants";
import { getboundaries } from "./hmr/boundaries"
import { ServerContext } from "../../index";
import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";
import {
  cleanUrl,
  isJSRequest,
  normalizePath,
  relativeUrl,
  getShortName,
  isInternalRequest
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
   
      const { moduleGraph } = serverContext;
      const curmod = moduleGraph.getModuleById(id)!;
      const importedModules = new Set<string>();
      const resolve = async (id: string, importer?: string) => {
  
        let resolved = await serverContext.PluginContainer.resolveId(id, normalizePath(importer as string));

        if (!resolved) {
          return
        }

  
        let cleanedId = cleanUrl(resolved.id);

        const mod = moduleGraph.getModuleById(path.resolve(cleanedId));
     
        let resolvedId = `/${getShortName(resolved.id, serverContext.root)}`;

        // console.log(cleanedId, moduleGraph);

        if (mod && mod.lastHMRTimetamp > 0) {
          // console.log(mod.lastHMRTimetamp)
          resolvedId += `?t=${mod.lastHMRTimetamp}`;

        }
        return resolvedId
      }
      if (!isJSRequest(id) || isInternalRequest(id)) {
        return null
      }
      await init;
      const [imports] = parse(code);
      const ms = new MagicString(code);

      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo;
        if (!modSource) continue;
        if (modSource.endsWith(".svg")) {
          const resolveUrl = path.join(path.dirname(id), modSource);
          ms.overwrite(modStart, modEnd, `${relativeUrl(resolveUrl)}?import`);
          continue

        }
        if (BARE_IMPORT_RE.test(modSource as string)) {
          const bundlePath = normalizePath(
            path.join('/', PRE_BUNDLE_DIR, `${modSource}.js`)
          );
          importedModules.add(bundlePath);

          ms.overwrite(modStart, modEnd, bundlePath as string)
        } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
          const resolved = await resolve(modSource, id) as string;

          if (resolved) {
            ms.overwrite(modStart, modEnd, resolved);

            importedModules.add(resolved);

          }
        }
      };
      if (!id.includes("node_modules")) {
        let res = Array.from(getboundaries(curmod, new Set()));
        ms.prepend(`import { createHotContext as __vite__createHotContext } from "${CLIENT_PUBLIC_PATH}";` + `import.meta.hot = __vite__createHotContext(${JSON.stringify(cleanUrl(curmod.url))},${JSON.stringify(res)});`)
      }

      moduleGraph.updataModuleInfo(curmod, importedModules);
    
      return {
        code: ms.toString(),
        map: ms.generateMap()
      }
    }
  }
}
