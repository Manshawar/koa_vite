
import { ServerContext } from './../index';
import picocolors from "picocolors";
import { getShortName } from "./utils";
export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, ws, root } = serverContext;
  watcher.on("change", async (file) => {
    console.log(`✨${picocolors.blue("[hmr]")} ${picocolors.green(file)} changed`);
    const { moduleGraph } = serverContext;
    await moduleGraph.invalidateModule(file);
    let arr = moduleGraph.getboundaries("/" + getShortName(file, root)).map(item => ({
      type: "js-update",
      timeStamp: Date.now(),
      path: item,
      acceptedPath: item
    }))
    ws.send({
      type: "update",
      updates: arr,

    })
  })
}