import { resolvePlugins } from './node/plugins/index';
import { createPluginContainer, type PluginContainer } from './node/pluginContainer';
import type { Plugin } from "./node/plugins/plugin";
import Koa from "koa";
import koaStatic from "koa-static";
import { optimize } from "./node/optimizer";
import { indexHtmlMiddware } from "./node/middlewares/indexHtml";
import { transformMiddleware } from "./node/middlewares/transformMiddleware";
import { ModuleGraph } from "./node/ModuleGraph";
import { createWebSocketServer } from "./node/ws";
import chokidar, { FSWatcher } from "chokidar";
import { normalizePath } from "./node/utils";
import { bindingHMREvents } from "./node/hmr"
import path from "path";
const app = new Koa();
const root = process.cwd();

let clientPath = path.join(process.cwd(), "/src/client/").replaceAll("\\", "/");

export interface ServerContext {
  root: string;
  clientPath: string;
  PluginContainer: PluginContainer,
  app: Koa;
  plugins: Plugin[];
  moduleGraph: ModuleGraph,
  ws: { send: (data: any) => void; close: () => void };
  watcher: FSWatcher
}
const plugins = resolvePlugins();
const PluginContainer = createPluginContainer(plugins);
const moduleGraph = new ModuleGraph((url) => PluginContainer.resolveId(url));
const watcher = chokidar.watch(clientPath, {
  ignored: [/node_modules/, /\.git/],
  ignoreInitial: true
});
const ws = createWebSocketServer(app);
const serverContext: ServerContext = {
  root: process.cwd(),
  PluginContainer,
  app,
  plugins: plugins,
  moduleGraph,
  ws,
  clientPath,
  watcher
};
bindingHMREvents(serverContext)
app.use(koaStatic(path.join(process.cwd(), "/src/client/")));
for (const plugin of plugins) {
  if (plugin.configureServer) {
    await plugin.configureServer(serverContext)
  }
}
app.use(indexHtmlMiddware(serverContext));
app.use(transformMiddleware(serverContext));



app.listen(3000, async () => {

  await optimize(root);



  console.log("http://localhost:3000 ")
})