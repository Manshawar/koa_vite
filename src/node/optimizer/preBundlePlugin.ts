import { Loader, Plugin } from "esbuild";
import { BARE_IMPORT_RE } from "../contants";
import { init, parse } from "es-module-lexer";
import path from "path";
import resolve from "resolve";
import fs from "fs-extra";
import createDebug from "debug";
import { normalizePath } from "../utils";

const debug = createDebug("dev");
export function preBundlePlugin(deps: Set<string>): Plugin {
  return {
    name: "esbuild:pre-bundle",
    setup(build) {

      build.onResolve(
        {
          filter: BARE_IMPORT_RE,
        },
        (resolveInfo) => {
          const { path: id, importer } = resolveInfo;
          const isEntry = !importer;
          // 命中需要预编译的依赖;

          if (deps.has(id)) {

            // console.log("id", id, isEntry, importer)
            // 若为入口，则标记 dep 的 namespace
            return isEntry
              ? {
                path: id,
                namespace: "dep",
              }
              : {
                // 因为走到 onResolve 了，所以这里的 path 就是绝对路径了
                path: resolve.sync(id, { basedir: process.cwd() }),
              };
          }
        }
      );
      build.onLoad({
        filter: /.*/,
        namespace: "dep"
      }, async (loadInfo) => {
        await init;
        const id = loadInfo.path;

        const root = process.cwd()
        const entryPath = normalizePath(resolve.sync(id, { basedir: root }));
        debugger
        const code = await fs.readFile(entryPath, "utf-8");
        // console.log("path-------", entryPath,)
        const [imports, exports] = await parse(code);
        // console.log("imports, exports", imports, exports)
        let proxyModule = [];
        let relativePath = normalizePath(path.relative(root, entryPath))
        if (
          !relativePath.startsWith('./') &&
          !relativePath.startsWith('../') &&
          relativePath !== '.'
        ) {
          relativePath = `./${relativePath}`
        }
        //进行词法解析，将所有require的文件方法提取出来转为es虚拟模块暴露 
        if (!imports.length && !exports.length) {

          const res = require(entryPath);

          const specifiers = Object.keys(res);
          // console.log("res----", entryPath, res)
          proxyModule.push(
            `export { ${specifiers.join(",")} } from "${relativePath}"`,
            `export default require("${relativePath}")`
          );
        } else {

          if ((exports as any).includes("default")) {
            proxyModule.push(`import d from "${entryPath}";export default d`);
          }
          proxyModule.push(`export * from "${relativePath}"`);
        }

 
        debug("代理模块内容: %o", proxyModule.join("\n"));
        const loader = path.extname(entryPath).slice(1);
        // console.log("resolveDir----------", root, proxyModule)
        // console.log("proxyModule----------", proxyModule)
        return {
          loader: loader as Loader,
          contents: proxyModule.join("\n"),
          resolveDir: root,
        }
      })
      build.onStart(() => {
        console.log('build started')
      })
    }
  }
}