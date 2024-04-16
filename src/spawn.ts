import { spawn as spawnChild } from "node:child_process";
import { bin } from "./constants.js";

export const spawn = (args: string[]) => {
    const child = spawnChild(bin, args, {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
            ...process.env,
            NO_COLOR: 'true'
        }
    });

    if (process.env.VERBOSE) {
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    }

    return child
}