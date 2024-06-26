import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/*.ts"],
    outDir: "lib",
    target: "node14",
    shims: true,
    clean: true,
    splitting: false,
    bundle: false,
    dts: options.watch ? false : { entry: "src/index.ts" },
}));