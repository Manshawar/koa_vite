import Koa from "koa";
const app = new Koa();
import { optimize } from "./node/optimizer";
import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";
import fs from "fs-extra";
import esbuild from "esbuild"
import path from "path";
import {
  parse as vueParse,
  compileTemplate,
  compileScript,
} from "vue/compiler-sfc"
const root = process.cwd();

let request = "test:req";

app.use(async (ctx, next) => {
  const { req, res } = ctx;
  if (req.url === "/") {
    const realPath = path.join(process.cwd(), "/cyber.html");
    if (await fs.pathExists(realPath)) {
      let code = await fs.readFile(realPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.end(code)
    }
  } else if ((req.method === "GET" || /\.(?:j|t)sx?$|\.mjs$|\.vue$/.test(req.url as string))) {

    const realPath = path.join(process.cwd(), req.url + "");
    if (await fs.pathExists(realPath)) {
      let code = await fs.readFile(realPath, "utf-8");
      if (req.url?.endsWith(".vue") || req.url === request) {
        const vueAst = vueParse(code);

        let scriptRes = compileScript(vueAst.descriptor, { id: req.url });

        let temp = compileTemplate({ source: vueAst.descriptor.template?.content as string, filename: realPath, id: req.url, slotted: vueAst.descriptor.slotted, compilerOptions: { bindingMetadata: scriptRes.bindings } });
        let arr = [scriptRes.content, temp.code]
        code = arr.join("\n");

      }

      let { code: transformedCode, map } = await esbuild.transform(code, {
        target: "esnext",
        format: "esm",
        sourcemap: true,
        loader: "tsx" as "js" | "ts" | "jsx" | "tsx",
      });
      const ms = new MagicString(transformedCode);
      await init;
      const [imports, exports] = parse(transformedCode);

      for (const importInfo of imports) {
        const { n: importedId, s: start, e: end } = importInfo;

        if (!importedId) continue;
        if (/^[\w@][^:]/.test(importedId)) {

          let realPath = path.join('/', "node_modules", ".m-vite", `${importedId}.js`);
          realPath = realPath.replace(/\\/g, "/");
          ms.overwrite(start, end, realPath);
          code = ms.toString();
        }

      }
      if (req.url?.endsWith(".vue")) {
        for (const exportInfo of exports) {
          const { n: exportId, s: start, e: end } = exportInfo;


          if (!exportInfo) continue;

          if (exportId === "default") ms.overwrite(start, end, "other");
          // console.log(realPath)
          code = ms.toString() + `let sfc_main =stdin_default.__vccOpts || stdin_default;sfc_main.render = function(...arg){console.log(arg[3].count);return render(...arg)};\n sfc_main.__file = "${realPath}";\nexport default /* @__PURE__ */sfc_main`
        }
      }
      res.setHeader("Content-Type", "application/javascript");


      res.statusCode = 200;
      res.end(code)
    }
  }
  return next()
})


app.listen(8954, async () => {
  await optimize(root, "src/cyber/react.tsx")
  await optimize(root, "src/cyber/vue.ts")
  console.log("http://localhost:8954 ")
})