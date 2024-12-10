import Koa from "koa";
import { optimize } from "./node/optimizer";
import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";
import fs from "fs-extra";
import esbuild from "esbuild";
import path from "path";
import { parse as vueParse, compileTemplate, compileScript } from "vue/compiler-sfc";
import resolve from "resolve";
import koaStatic from "koa-static";
const root = process.cwd();

const app = new Koa();
console.log(path.join(root, "/src/cyber"));

app.use(async (ctx, next) => {
  const { req, res } = ctx;
  if (req.url?.endsWith(".png")) {
    let img = await fs.readFile(path.resolve(path.join(root, req.url as string)));
    ctx.set('Content-Type', 'image/png'); 
    res.end(img)
    // let img =await fs.readFile()
    // res.end()
  }
  if (req.url === "/") {
    const realPath = path.join(process.cwd(), "/cyber.html");
    //transformHtml
    if (await fs.pathExists(realPath)) {
      let code = await fs.readFile(realPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.end(code);
    }
  } else if (req.method === "GET" || /\.(?:j|t)sx?$|\.mjs$|\.vue$/.test(req.url as string)) {
    //resolve
    const realPath = path.join(process.cwd(), req.url + "");

    //loader
    if (realPath.endsWith("?import")) {
      let realtivePath = path
        .join( path.relative(process.cwd(), realPath.split("?")[0]))
        .replaceAll("\\", "/");
      let code = `export default "${realtivePath}"`;
      res.setHeader("Content-Type", "application/javascript");

      res.statusCode = 200;
      res.end(code);
    }
    if ((await fs.pathExists(realPath)) && !realPath.endsWith(".png")) {
      let code = await fs.readFile(realPath, "utf-8");
      //vue-plugin loader
      if (req.url?.endsWith(".vue")) {
        const vueAst = vueParse(code);
        let scriptRes = compileScript(vueAst.descriptor, { id: req.url });
        let temp = compileTemplate({
          source: vueAst.descriptor.template?.content as string,
          filename: realPath,
          id: req.url,
          slotted: vueAst.descriptor.slotted,
          compilerOptions: { bindingMetadata: scriptRes.bindings },
        });
        let arr = [scriptRes.content, temp.code];
        code = arr.join("\n");
      }

      let exname =
        path.extname(req.url as string).slice(1) === "vue"
          ? "js"
          : path.extname(req.url as string).slice(1);
      let { code: transformedCode, map } = await esbuild.transform(code, {
        target: "esnext",
        format: "esm",
        sourcemap: true,
        loader: exname as "js" | "ts" | "jsx" | "tsx",
      });

      //  transform
      const ms = new MagicString(transformedCode);
      await init;
      const [imports, exports] = parse(transformedCode);

      for (const importInfo of imports) {
        const { n: importedId, s: start, e: end } = importInfo;

        if (!importedId) continue;
        if (/^[\w@][^:]/.test(importedId)) {
          let realPath = path.join("/", "node_modules", ".m-vite", `${importedId}.js`);
          realPath = realPath.replace(/\\/g, "/");

          ms.overwrite(start, end, realPath);
        } else if (importedId.startsWith(".") || importedId.startsWith("/")) {
          let realtivePath = path
            .join(
              "/",
              path.relative(
                process.cwd(),
                resolve.sync(importedId, { basedir: path.dirname(realPath) })
              )
            )
            .replaceAll("\\", "/");
          if (realtivePath.endsWith(".png")) {
            realtivePath = realtivePath + "?import";
          }
          ms.overwrite(start, end, realtivePath);
        }
        code = ms.toString();
      }

      // vue-plugin transform
      if (req.url?.endsWith(".vue")) {
        for (const exportInfo of exports) {
          const { n: exportId, s: start, e: end } = exportInfo;
          if (!exportInfo) continue;

          if (exportId === "default") ms.overwrite(start, end, "other");
          // console.log(realPath)
          code =
            ms.toString() +
            `let sfc_main =stdin_default.__vccOpts || stdin_default;sfc_main.render = function(...arg){console.log(arg);return render(...arg)};\n sfc_main.__file = "${realPath}";\nexport default /* @__PURE__ */sfc_main`;
        }
      }

      res.setHeader("Content-Type", "application/javascript");

      res.statusCode = 200;
      res.end(code);
    }
  }
  return next();
});

app.listen(8954, async () => {
  await optimize(root, "src/cyber/react.tsx");
  await optimize(root, "src/cyber/vue.ts");
  console.log("http://localhost:8954 ");
});
