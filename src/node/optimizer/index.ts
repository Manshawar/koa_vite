import path from "path";
import { build } from "esbuild";
import { scanPlugin } from "./scanplugin";
import { preBundlePlugin } from "./preBundlePlugin";
import { PRE_BUNDLE_DIR } from "../contants";
export async function optimize(root: string, other?: string) {
  // 1. 确定入口
  // 2. 从入口处扫描依赖
  // 3. 预构建依赖;
  const deps = new Set<string>();
  const entry = path.resolve(root, other ? other : "src/client/main.tsx");
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  });
  await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)]
  });
  console.log("需要构建的依赖项", deps)
}
