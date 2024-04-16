import path from "node:path";

export const DEFAULT_BORE_BIN = path.join(
    __dirname,
    "..",
    "bin",
    process.platform === "win32" ? "bore.exe" : "bore",
);

/**
 * The path to the bore binary.
 * If the `BORE_BIN` environment variable is set, it will be used; otherwise, {@link DEFAULT_BORE_BIN} will be used.
 * Can be overridden with {@link use}.
 */
export let bin = process.env.BORE_BIN || DEFAULT_BORE_BIN;

/**
 * Override the path to the bore binary.
 * @param executable - The path to the bore executable.
 */
export function use(executable: string): void {
    bin = executable;
}

export const BORE_VERSION = process.env.BORE_VERSION || "v0.5.0";

export const RELEASE_BASE = "https://github.com/ekzhang/bore/releases/";