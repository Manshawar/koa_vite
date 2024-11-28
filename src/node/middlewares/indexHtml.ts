import path from "path";
import fs from "fs-extra";
import { ServerContext } from "../../index";
import { Middleware } from "koa";
export function indexHtmlMiddware(serverContext: ServerContext): Middleware {
  return async (ctx, next) => {
    const { res, req } = ctx;
  
    if (req.url === "/") {
      const { root } = serverContext;
      const indexHtmlPath = path.resolve(root, "index.html");
      if (await fs.pathExists(indexHtmlPath)) {
        const readHtml = await fs.readFile(indexHtmlPath, "utf-8");
        let html = readHtml;
      
        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html)
          }
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");

        ctx.body = html
      }
    }
    return next();

  }

}