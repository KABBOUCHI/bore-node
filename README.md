# bore-node

## Installation

```bash
npm install bore-node

pnpm add bore-node

yarn add bore-node
```

## Usage

```ts
import { install, bin } from "bore-node";
import fs from "node:fs";
import { spawn } from "node:child_process";

if (!fs.existsSync(bin)) {
  await install(bin);
}

// check bore version
spawn(bin, ["--version"], { stdio: "inherit" });
```

or

```ts
import { install, bin, spawn } from "bore-node";
import fs from "node:fs";

if (!fs.existsSync(bin)) {
  await install(bin);
}

// check bore version
spawn(["--version"]);

// open tunnel
spawn(["local", "8080", "--to", "bore.pub"]);
```
