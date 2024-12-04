import { resolvePlugins } from './node/plugins/index';
import { createPluginContainer, type PluginContainer } from './node/pluginContainer';
import type { Plugin } from "./node/plugins/plugin";
import Koa from "koa";
const app = new Koa();
import { optimize } from "./node/optimizer";
import { indexHtmlMiddware } from "./node/middlewares/indexHtml";
import { transformMiddleware } from "./node/middlewares/transformMiddleware";
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


app.use(indexHtmlMiddware(serverContext));

app.use(transformMiddleware(serverContext));

app.listen(3000, async () => {
  await optimize(root)
  console.log("http://localhost:3000 ")
})