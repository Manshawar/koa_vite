import { Plugin } from "./plugin";
import { allin } from "./allin";
import { resolvePath } from "./resolve";
import { esbuildTransformPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis";
import { assetPlugin } from "./assets"
import { cssPlugin } from "./css";
import { clientInjectPlugin } from "./clientInject";
export const resolvePlugins = (): Plugin[] => {
  return [
    // allin(),
    clientInjectPlugin(),
    resolvePath(),
    esbuildTransformPlugin(),
    importAnalysisPlugin(),
    cssPlugin(),
    assetPlugin()
  ]
}