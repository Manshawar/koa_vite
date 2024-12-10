
import { ModuleGraph, ModuleNode } from "../../ModuleGraph";

export function getboundaries(mod: ModuleNode, boundaries: Set<any>) {

  if (mod.importers) {
  
    mod.importers.forEach((item) => {
      // console.log("importers", item.url, mod.url, )
      getboundaries(item, boundaries);
      boundaries.add(item.url);
    })
  }
  boundaries.add(mod.url);
  return boundaries
}