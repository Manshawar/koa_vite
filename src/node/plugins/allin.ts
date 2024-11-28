import { ServerContext } from './../../index';
import { Plugin } from "./plugin";
import esbuild from "esbuild"
import path from "path";
import fs, { pathExists } from "fs-extra";
import { normalizePath } from "../utils"
import MagicString from "magic-string";
import { init, parse } from "es-module-lexer";
import { BARE_IMPORT_RE, PRE_BUNDLE_DIR, DEFAULT_EXTERSIONS } from "../contants"
export function allin(): Plugin {
  let serverContext: ServerContext
  return {
    name: "allin",
    configureServer(s) {
      serverContext = s
    },
    async resolveId(id, importer) {
      if (path.isAbsolute(id)) {
        if (await pathExists(id)) {
          return {
            id
          }
        }
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return {
            id
          }
        }
      } else if (id.startsWith(".")) {
        if (!importer) {
          throw new Error("`importer` should not be undefined");
        }
      }
      return null
    },
    async load(id) {
      let code = (await fs.readFile(id, "utf-8"));
      return {
        code
      }
    },
    async transform(code, id) {
      const extname = path.extname(id).slice(1);

      const { code: transformedCode, map } = await esbuild.transform(code, {
        target: "esnext",
        format: "esm",
        sourcemap: true,
        loader: extname as "js" | "ts" | "jsx" | "tsx",
      });
      const ms = new MagicString(transformedCode);
      await init;
      const [imports] = parse(transformedCode);
      for (const importInfo of imports) {
        const { n: importedId, s: start, e: end } = importInfo;
        if (!importedId) continue;
        if (BARE_IMPORT_RE.test(importedId)) {
        
          let bundlePath = normalizePath(
            path.join('/', PRE_BUNDLE_DIR, `${importedId}.js`)
          );
          ms.overwrite(start, end, bundlePath);
        }
      }
      return {
        code: ms.toString(),
        // 生成 SourceMap
        map: ms.generateMap(),
      } 
    }
  }
}