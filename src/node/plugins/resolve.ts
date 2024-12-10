import { ServerContext } from './../../index';
import resolve from "resolve";
import { Plugin } from "./plugin";
import path from "path";
import fs, { pathExists } from "fs-extra";
import { DEFAULT_EXTERSIONS } from "../contants";
import { cleanUrl, normalizePath } from "../utils";
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
        const hasExtension = path.extname(id).length > 1;
        let resolvedId: string;

        if (hasExtension) {
          //请于test中查看resolve.test.ts测试

          resolvedId = normalizePath(resolve.sync(id, { basedir: path.dirname(importer) }));
          if (await pathExists(resolvedId)) {
            return {
              id: resolvedId,
            }
          }
        } else {

          for (const extname of DEFAULT_EXTERSIONS) {
            try {
              const withExtension = `${id}${extname}`;

              resolvedId = normalizePath(resolve.sync(withExtension, {
                basedir: path.dirname(importer),
              }));

              if (await pathExists(resolvedId)) {

                return {
                  id: resolvedId
                }
              }
            } catch (error) {
              continue
            }
          }
        }
      }
      return null
    },


  }
}