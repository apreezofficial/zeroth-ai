import os from "node:os";
import path from "node:path";

/**
 * Where models are stored. Override with ZEROTH_HOME.
 * macOS: ~/Library/Caches/zeroth · Linux: $XDG_CACHE_HOME or ~/.cache/zeroth · Windows: %LOCALAPPDATA%\zeroth
 */
export function defaultCacheDir(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  home: string = os.homedir(),
): string {
  if (env.ZEROTH_HOME) return env.ZEROTH_HOME;
  if (platform === "darwin") return path.join(home, "Library", "Caches", "zeroth");
  if (platform === "win32") return path.join(env.LOCALAPPDATA ?? path.join(home, "AppData", "Local"), "zeroth");
  return path.join(env.XDG_CACHE_HOME ?? path.join(home, ".cache"), "zeroth");
}
