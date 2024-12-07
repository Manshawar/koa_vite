import { Plugin } from "./plugin";
import { allin } from "./allin";
import { resolvePath } from "./resolve";
import { esbuildTransformPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis";
import { cssPlugin } from "./css";
export const resolvePlugins = (): Plugin[] => {
  return [
    // allin(),
    resolvePath(),
    esbuildTransformPlugin(),
    importAnalysisPlugin(),
    cssPlugin()
  ]
}