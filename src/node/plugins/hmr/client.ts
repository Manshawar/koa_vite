

console.log("[vite] connecting...");
const socket = new WebSocket(`ws://localhost:__HMR_PORT__`, "vite-hmr");
let boundaries: any;
socket.addEventListener("message", async ({ data }) => {

  handleMessage(JSON.parse(data)).catch(console.error)
});
async function handleMessage(payload: any) {
  switch (payload.type) {
    case "connection":
      console.log(`[vite] connected.`);
      setInterval(() => socket.send("ping"), 1000);
      break;
    case "update":
      console.log(payload.updates)
      payload.updates.forEach((update: any) => {
        if (update.type === "js-update") {
          fetchUpdate(update)
        }
      })
      break;
  }
}
interface HotModule {
  id: string;
  callbacks: HotcallBack[]
};
interface HotcallBack {
  deps: string[];
  fn: (modules: object[]) => void;
};
const hotModulesMap = new Map<string, HotModule>();
const pruneMap = new Map<string, (data: any) => void | Promise<void>>();
export const createHotContext = (ownerPath: string, arr: any) => {

  boundaries = arr;
  const mod: HotModule = hotModulesMap.get(ownerPath) || {
    id: ownerPath,
    callbacks: []
  };
  hotModulesMap.set(ownerPath, mod)

  if (mod) {
    mod.callbacks = []
  }
  function acceptDeps(deps: string[], callback: any) {

    const mod: HotModule = hotModulesMap.get(ownerPath) || {
      id: ownerPath,
      callbacks: []
    };
    mod.callbacks.push({ deps, fn: callback });
    hotModulesMap.set(ownerPath, mod)
  }
  return {
    accept(deps: any, callback?: any) {

      if (typeof deps === "function" || !deps) {
        //@ts-ignore
        acceptDeps([ownerPath], ([mod]) => deps && deps(mod))
      }
    },
    prune(cb: (data: any) => void) {
      pruneMap.set(ownerPath, cb)
    }
  }
}

async function fetchUpdate({ path, timeStamp }: any) {
  // console.log(path)
  const mod = hotModulesMap.get(path);
  console.log(boundaries, "mod---------------------", path)
  if (!mod) return;
  const moduleMap = new Map();
  const modulesToUpdate = new Set<string>();
  modulesToUpdate.add(path);
  // boundaries.forEach((item:string) => {
  //   modulesToUpdate.add(item);
  // })
  await Promise.all(Array.from(modulesToUpdate).map(async (dep) => {
    const [path, query] = dep.split("?");

    try {
      const newMod = await import(path + `?t=${timeStamp}${query ? `&${query}` : ""}`);
      moduleMap.set(dep, newMod)
    } catch (e) {
      console.error(e)
    }
  }))
  return () => {
    for (const { deps, fn } of mod.callbacks) {
      fn(deps.map(dep => moduleMap.get(dep)));
      console.log(`[vite] hot updated: ${path}`);
    }
  }
}
const sheetsMap = new Map();
export function updateStyle(id: string, content: string) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = content;
    document.head.appendChild(style);
  } else {
    style.innerHTML = content;
  }

  sheetsMap.set(id, style);
};
export function removeStyle(id: string): void{
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
  }
  sheetsMap.delete(id)
}