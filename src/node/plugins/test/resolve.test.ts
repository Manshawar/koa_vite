import resolve from "resolve";
import path from "path";

test('resolveImporter', () => {
  let id = "./App.tsx";
  let importer = "src/client/main.tsx"
  let res = resolve.sync(id, { basedir: path.dirname(importer) });
  expect(res).toBe(`D:\code\study\vite\minivite\koaVite\src\client\App.tsx`);
});