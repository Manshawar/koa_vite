import { Plugin } from "./plugin";
import { allin } from "./allin";
import { resolvePath } from "./resolve";
import { esbuildTransformPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis"
export const resolvePlugins = (): Plugin[] => {
  return [
    // allin(),
    resolvePath(),
    esbuildTransformPlugin(),
    importAnalysisPlugin()
  ]
}