import { Plugin } from "./plugin";
import { allin } from "./allin"
export const resolvePlugins = (): Plugin[] => {
  return [
    allin()
  ]
}