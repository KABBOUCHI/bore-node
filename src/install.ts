import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { execSync } from "node:child_process";
import { BORE_VERSION, RELEASE_BASE } from "./constants";
import { UnsupportedError } from "./error";

const LINUX_URL: Partial<Record<typeof process.arch, string>> = {
    arm64: "bore-VERSION-armv7-unknown-linux-gnueabihf.tar.gz",
    arm: "bore-VERSION-arm-unknown-linux-gnueabi.tar.gz",
    x64: "bore-VERSION-x86_64-unknown-linux-musl.tar.gz",
    ia32: "bore-VERSION-i686-unknown-linux-musl.tar.gz",
};

const MACOS_URL: Partial<Record<typeof process.arch, string>> = {
    arm64: "bore-VERSION-aarch64-apple-darwin.tar.gz",
    x64: "bore-VERSION-x86_64-apple-darwin.tar.gz",
};

const WINDOWS_URL: Partial<Record<typeof process.arch, string>> = {
    x64: "bore-VERSION-x86_64-pc-windows-msvc.zip",
    ia32: "bore-VERSION-i686-pc-windows-msvc.zip",
};

function resolve_base(version: string): string {
    return `${RELEASE_BASE}download/${version}/`;
}

/**
 * Install bore to the given path.
 * @param to The path to the binary to install.
 * @param version The version of bore to install.
 * @returns The path to the binary that was installed.
 */
export async function install(to: string, version = BORE_VERSION): Promise<string> {
    if (process.platform === "linux") {
        return install_linux(to, version);
    } else if (process.platform === "darwin") {
        return install_macos(to, version);
    } else if (process.platform === "win32") {
        return install_windows(to, version);
    } else {
        throw new UnsupportedError("Unsupported platform: " + process.platform);
    }
}

export async function install_linux(to: string, version = BORE_VERSION): Promise<string> {
    let file = LINUX_URL[process.arch];

    if (file === undefined) {
        throw new UnsupportedError("Unsupported architecture: " + process.arch);
    }

    file = file.replace("VERSION", version);

    await download(resolve_base(version) + file, `${to}.tar.gz`);
    process.env.VERBOSE && console.log(`Extracting to ${to}`);
    execSync(`tar -xzf ${path.basename(`${to}.tar.gz`)}`, { cwd: path.dirname(to) });
    fs.unlinkSync(`${to}.tar.gz`);
    fs.renameSync(`${path.dirname(to)}/bore`, to);
    fs.chmodSync(to, "755");
    return to;
}

export async function install_macos(to: string, version = BORE_VERSION): Promise<string> {
    let file = MACOS_URL[process.arch];

    if (file === undefined) {
        throw new UnsupportedError("Unsupported architecture: " + process.arch);
    }

    file = file.replace("VERSION", version);

    await download(resolve_base(version) + file, `${to}.tar.gz`);
    process.env.VERBOSE && console.log(`Extracting to ${to}`);
    execSync(`tar -xzf ${path.basename(`${to}.tar.gz`)}`, { cwd: path.dirname(to) });
    fs.unlinkSync(`${to}.tar.gz`);
    fs.renameSync(`${path.dirname(to)}/bore`, to);
    return to;
}
export async function install_windows(to: string, version = BORE_VERSION): Promise<string> {
    let file = WINDOWS_URL[process.arch];

    if (file === undefined) {
        throw new UnsupportedError("Unsupported architecture: " + process.arch);
    }

    file = file.replace("VERSION", version);

    await download(resolve_base(version) + file, `${to}.zip`);
    process.env.VERBOSE && console.log(`Extracting to ${to}`);
    
    execSync(`tar -xzf ${path.basename(`${to}.zip`)}`, { cwd: path.dirname(to) });
    fs.unlinkSync(`${to}.zip`);
    fs.renameSync(`${path.dirname(to)}\bore`, to);
    return to;
}

function download(url: string, to: string, redirect = 0): Promise<string> {
    if (redirect === 0) {
        process.env.VERBOSE && console.log(`Downloading ${url} to ${to}`);
    } else {
        process.env.VERBOSE && console.log(`Redirecting to ${url}`);
    }

    if (!fs.existsSync(path.dirname(to))) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
    }

    return new Promise<string>((resolve, reject) => {
        const request = https.get(url, (res) => {
            const redirect_code: unknown[] = [301, 302, 303, 307, 308];
            if (redirect_code.includes(res.statusCode) && res.headers.location !== undefined) {
                request.destroy();
                const redirection = res.headers.location;
                resolve(download(redirection, to, redirect + 1));
                return;
            }

            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                const file = fs.createWriteStream(to);

                file.on("finish", () => {
                    file.close(() => resolve(to));
                });

                file.on("error", (err) => {
                    fs.unlink(to, () => reject(err));
                });

                res.pipe(file);
            } else {
                request.destroy();
                reject(new Error(`HTTP response with status code: ${res.statusCode}`));
            }
        });

        request.on("error", (err) => {
            reject(err);
        });

        request.end();
    });
}