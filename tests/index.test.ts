import { ChildProcess } from "node:child_process";
import fs from "node:fs";
import { bin, install, spawn } from "../src/index.js";
import { describe, it, expect } from "vitest";

process.env.VERBOSE = "1";

describe(
    "install",
    () => {
        it("should install binary", async () => {
            if (fs.existsSync(bin)) {
                fs.unlinkSync(bin);
            }
            expect(fs.existsSync(bin)).toBe(false);
            await install(bin);
            expect(fs.existsSync(bin)).toBe(true);
        });
    },
    { timeout: 60_000 },
);

describe(
    "spawn",
    () => {
        it("should spawn", async () => {
            const child = spawn(["--version"]);

            let version = "";

            child.stdout.on('data', (data) => {
                version += data;
            });

            expect(child).toBeInstanceOf(ChildProcess);

            await new Promise((r) => setTimeout(r, 1000));

            expect(version).toContain("bore-cli");
            child.kill();
        });
    },
    { timeout: 60_000 },
);
