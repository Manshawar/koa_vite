
import { Plugin } from "esbuild";
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from "../contants";
export function scanPlugin(deps: Set<string>): Plugin {

  return {
    name: "scan-deps",
    setup(build) {
      build.onResolve({ filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`) }, (resolveInfo) => {
 
        return {
          path: resolveInfo.path,
          // 打上 external 标记
          external: true,
        }
      });
      build.onResolve({
        filter: BARE_IMPORT_RE,
      }, (resolveInfo) => {
   
        deps.add(resolveInfo.path)
        return {
          path: resolveInfo.path,
          external: true
        }
      })
    },
  }
}