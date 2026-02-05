import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const commonSrc = path.join(root, "packages/common/src/index.ts");
/**
 * When packing from local terminal, '@bigtix/common' resolves to the .packages/common/src/index.ts file.
 * When packing from Skaffold/Docker/production, '@bigtix/common' has ./packages/common/dist folder, and the alias is
 * resolved via node_modules.
 */
const packingFromLocalDirectory = existsSync(commonSrc);

const nextConfig = {
  output: "standalone", // for production Docker (single deployable .next/standalone)
  transpilePackages: ["@bigtix/common"],
  webpack: (config) => {
    if (packingFromLocalDirectory) {
      config.resolve.alias ??= {};
      config.resolve.alias["@bigtix/common"] = commonSrc;
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      underscore: "lodash",
      ...(packingFromLocalDirectory && { "@bigtix/common": commonSrc }),
    },
  },
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
};

export default nextConfig;