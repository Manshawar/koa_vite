import { PartialResolvedId, TransformResult } from "rollup";
import { cleanUrl } from "./utils";
import { debug } from "console";
export class ModuleNode {
  url: string="";
  id: string="";
  importers = new Set<ModuleNode>();
  importedModules = new Set<ModuleNode>();
  transformResult: TransformResult | null = null;
  lastHMRTimetamp = 0;
  constructor(url: string) {
    this.url = url
  }
};
export class ModuleGraph {
  urlToModuleMap = new Map<string, ModuleNode>();
  idToModuleMap = new Map<string, ModuleNode>();
  constructor(private resolveId: (url: string) => Promise<PartialResolvedId | null>) { };
  getModuleById(url: string): ModuleNode | undefined {
    return this.idToModuleMap.get(url)
  }
  async getModuleByUrl(rawUrl: string): Promise<ModuleNode | undefined> {
    const { url } = await this._resolve(rawUrl);
    return this.urlToModuleMap.get(cleanUrl(url))
  }
  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode | undefined> {

    const { url, resolvedId } = await this._resolve(rawUrl);
    if (this.urlToModuleMap.has(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode
    }
    const mod = new ModuleNode(url);
    mod.id = resolvedId;
    this.urlToModuleMap.set(url, mod);
    this.idToModuleMap.set(resolvedId, mod)
    return mod;
  };
  async updataModuleInfo(mod: ModuleNode, importedModules: Set<string | ModuleNode>) {
    const prevImports = mod.importedModules;

    for (const curImports of importedModules) {
   
   
      const dep = typeof curImports === "string" ? await this.ensureEntryFromUrl(cleanUrl(curImports)) : curImports;
      if (dep) {
    
        mod.importedModules.add(dep);
        dep.importers.add(mod);
      }
    }
    for (const preImport of prevImports) {
      if (!importedModules.has(preImport.url as string)) {
        preImport.importers.delete(mod)
      }
    }
  };
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file);
    if (mod) {
      mod.lastHMRTimetamp = Date.now();
      mod.transformResult = null;
      mod.importers.forEach((importer) => {
        this.invalidateModule(importer.id!)
      })
    }
  }
  private async _resolve(url: string): Promise<{ url: string, resolvedId: string }> {
    const resolved = await this.resolveId(url);
    const resolvedId = resolved?.id as string;
    return { url, resolvedId }
  }
}