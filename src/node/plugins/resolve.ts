import { ServerContext } from './../../index';
import resolve from "resolve";
import { Plugin } from "./plugin";

import path from "path";
import fs, { pathExists } from "fs-extra";
import { DEFAULT_EXTERSIONS } from "../contants";
export function resolvePath(): Plugin {
  let serverContext: ServerContext
  return {
    name: "resolvePlugin",
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
        const hasExtension = path.extname(id).length > 0;
        let resovledId: string;
        // if (hasExtension) {
        //   console.log(id)
        // }
      }
      return null
    },
    async load(id) {
      let code = await fs.readFile(id, "utf-8");
      console.log(code)
      return code
    },
    async transform(code, id) {
      return {
        code
      }
    }
  }
}