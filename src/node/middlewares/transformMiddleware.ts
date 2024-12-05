
import { SourceDescription } from "rollup"
import { Middleware } from "koa";
import { ServerContext } from "../../index";
import createDebug from "debug";
import { isJSRequest, cleanUrl, isCSSRequest } from "../utils"

import path from "path";
import { EXTERNAL_TYPES } from "../contants"
const debug = createDebug("dev");
async function transformRequest(url: string, serverContext: ServerContext): Promise<SourceDescription | null | string | undefined> {
  const { PluginContainer } = serverContext;
  url = cleanUrl(url);
  let res;
  let resolveId = await PluginContainer.resolveId(url);
  if (resolveId?.id) {
    let code = await PluginContainer.load(resolveId?.id);
    if (typeof code === "object" && code !== null) {
      code = code.code
    }
    if (code) {
      res = await PluginContainer.transform(code, resolveId?.id);
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
    if (isJSRequest(url) || isCSSRequest(url)) {
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
    let ext = path.extname(url);
    if (EXTERNAL_TYPES.some(item => new RegExp(item).test(ext))) {
      console.log(ext)
    }

  }

}