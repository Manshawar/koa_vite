
import type {
  LoadResult,
  PartialResolvedId,
  SourceDescription,
  PluginContext as RollupPluginContext,
  ResolvedId,
} from "rollup";
import type { Plugin } from "./plugins/plugin"
export interface PluginContainer {
  resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>;
  load(id: string): Promise<LoadResult | null>;
  transform(code: string, id: string): Promise<SourceDescription | null>;
}


export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  //implements  实现，一个新的类，从父类或者接口实现所有的属性和方法，同时可以重写属性和方法，包含一些新的功能

  // @ts-ignore 这里仅实现上下文对象的 resolve 方法，此容器便于你使用rollup上面的一些方法，this.resolve this.parse
  class Context implements RollupPluginContext {
    // @ts-ignore
    async resolve(id, importer) {
      let out = await PluginContainer.resolveId(id, importer);
      if (typeof out === "string") out = { id: out };
      return out as ResolvedId | null
    }

  }
  //一个id模块的路径处理应该只有一个，code代码也应该只有一份，但是处理其code 可以处理多次
  const PluginContainer: PluginContainer = {
    async resolveId(id, importer) {
      const ctx = new Context();
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const newId = await plugin.resolveId.call(ctx, id, importer);
          if (newId) {
            id = typeof newId === 'string' ? newId : newId.id;
            return newId;
          }
        }
      }
      return null
    },
    async load(id) {
      const ctx = new Context();
      for (const plugin of plugins) {
        if (plugin.load) {
          const res = await plugin.load.call(ctx, id);
          if (res) {
            return res
          }
        }
      }
      return null
    },
    async transform(code, id) {
      const ctx = new Context();
      for (const plugin of plugins) {
        if (plugin.transform) {
          code = code.trim()
          const res = await plugin.transform.call(ctx, code, id);
          if (!res) {
            continue
          }
          if (typeof res === 'string') {
            code = res
          } else {
            code = res.code
          }
        }
      }
      return { code }
    }
  }
  return PluginContainer
}