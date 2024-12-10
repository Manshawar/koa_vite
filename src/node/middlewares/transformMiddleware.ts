import { ModuleGraph } from './../ModuleGraph';

import { SourceDescription } from "rollup"
import { Middleware } from "koa";
import { ServerContext } from "../../index";
import createDebug from "debug";
import { isJSRequest, cleanUrl, isCSSRequest, isImportRequest } from "../utils"


const debug = createDebug("dev");
async function transformRequest(url: string, serverContext: ServerContext) {
  const { PluginContainer, moduleGraph } = serverContext;
  let query = url.split("?")[1];

  url = cleanUrl(url);


  let mod = await moduleGraph.getModuleByUrl(url);
  if (mod && mod.transformResult && !query) {
   
    return mod.transformResult;
  }
  let res;
  let resolveId = await PluginContainer.resolveId(url);
  if (resolveId?.id) {
    let code = await PluginContainer.load(resolveId?.id);
    if (typeof code === "object" && code !== null) {
      code = code.code
    }

    mod = await moduleGraph.ensureEntryFromUrl(url);
    if (code) {
      res = await PluginContainer.transform(code, resolveId?.id);
    }
    if (mod) {
      mod.transformResult = res
    }
  }
  return res
}
export function transformMiddleware(serverContext: ServerContext): Middleware {
  return async (ctx, next) => {
    const { req, res } = ctx
    if (req.method !== "GET" || !req.url) {
      return next()
    }
    const url = req.url;

    debug("transformMiddleware: %s", url);
    if (isJSRequest(url) || isCSSRequest(url) || isImportRequest(url)) {

      let resCode = await transformRequest(url, serverContext);

      if (!resCode) {
        return next();
      }

      if (resCode && typeof resCode !== "string") {
        resCode = resCode.code;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");
      return res.end(resCode);
    }


  }

}