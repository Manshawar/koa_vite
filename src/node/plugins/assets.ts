import { pathExists, readFile } from "fs-extra";
import { Plugin } from "./plugin";
import { ServerContext } from "../../index";
import { cleanUrl, getShortName, normalizePath, removeImportQuery } from "../utils";
import path from "path"
export function assetPlugin(): Plugin {
  let serverContext: ServerContext;

  return {
    name: "m-vite:asset",
    configureServer(s) {
      serverContext = s;
    },
    async load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id));
      const resolvedId = `/${path.relative(path.join(serverContext.root,"/src/client/"), cleanedId).replaceAll('\\','/')}`;
    
      if (cleanedId.endsWith(".svg")) {
        return {
          code: `export default "${resolvedId}"`,
        };
      }
    },
  };
}