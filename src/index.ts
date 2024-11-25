import Koa from "koa";
const app = new Koa();
import { optimize } from "./node/optimizer";
const root = process.cwd()
app.use((ctx) => {
  ctx.body = "hello Koa"
});
app.listen(3000, async () => {
  await optimize(root)
  console.log("http://localhost:3000 ")
})