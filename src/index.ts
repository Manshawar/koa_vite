import { resolvePlugins } from './node/plugins/index';
import { createPluginContainer, type PluginContainer } from './node/pluginContainer';
import type { Plugin } from "./node/plugins/plugin";
import Koa from "koa";
import koaStatic from "koa-static";
import { optimize } from "./node/optimizer";
import { indexHtmlMiddware } from "./node/middlewares/indexHtml";
import { transformMiddleware } from "./node/middlewares/transformMiddleware";
import { EXTERNAL_TYPES } from "./node/contants"
import path from "path";
const app = new Koa();
const root = process.cwd();

export interface ServerContext {
  root: string;
  PluginContainer: PluginContainer,
  app: Koa;
  plugins: Plugin[]

}
const plugins = resolvePlugins();
const PluginContainer = createPluginContainer(plugins)
const serverContext: ServerContext = {
  root: process.cwd(),
  PluginContainer,
  app,
  plugins: plugins
}
for (const plugin of plugins) {
  if (plugin.configureServer) {
    await plugin.configureServer(serverContext)
  }
}
app.use(koaStatic(path.join(root, "/src/client")))

app.use(indexHtmlMiddware(serverContext));

app.use(transformMiddleware(serverContext));


app.listen(3000, async () => {
  await optimize(root);
  console.log(path.join(root, "/src/client"))
  console.log("http://localhost:3000 ")
})