import { Plugin } from "./plugin";
import { isJSRequest } from "../utils";
import path from "path";
import fs from "fs-extra";
import esbuild from "esbuild";
export function esbuildTransformPlugin(): Plugin {
  return {
    name: "esbuild-transform",
    async load(id) {
      if (isJSRequest(id)) {
        try {
          let code = await fs.readFile(id, "utf-8");
          return code
        } catch (error) {
          return null
        }
      }
    },
    async transform(code, id) {
      if (isJSRequest(id)) {
        const extname = path.extname(id).slice(1);
        const { code: resCode, map } = await esbuild.transform(code, {
          target: "esnext",
          format: "esm",
          sourcemap: true,
          loader: extname as "js" | "ts" | "jsx" | "tsx",
        })
        return {
          code: resCode,
          map
        }
      }
      return null
    }
  }

}