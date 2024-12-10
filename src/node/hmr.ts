
import { ServerContext } from './../index';
import picocolors from "picocolors";
import { getShortName } from "./utils";
export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, ws, root } = serverContext;
  watcher.on("change", async (file) => {
    console.log(`✨${picocolors.blue("[hmr]")} ${picocolors.green(file)} changed`);
    const { moduleGraph } = serverContext;
    await moduleGraph.invalidateModule(file);

    ws.send({
      type: "update",
      updates: [{
        type: "js-update",
        timeStamp: Date.now(),
        path: "/" + getShortName(file, root),
        acceptedPath: "/" + getShortName(file, root)
      }]
    })
  })
}