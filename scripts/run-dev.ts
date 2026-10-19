// Development: the API server under `tsx watch` (settings from .env) and the Vite dev
// server, which proxies /api to it (vite.config.ts). Stopping this process stops both.
import { spawn } from "node:child_process";

const children = [
  spawn("npx", ["tsx", "watch", "--env-file=.env", "src/server/main.ts"], { stdio: "inherit" }),
  spawn("npx", ["vite"], { stdio: "inherit" }),
];

function stopAll(signal: NodeJS.Signals): void {
  for (const child of children) if (child.exitCode === null) child.kill(signal);
}

for (const child of children) {
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
    stopAll("SIGTERM");
  });
}
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => stopAll(signal));
