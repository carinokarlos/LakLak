import { spawn } from "node:child_process";

import { config } from "../src/config.js";
import { stopNodeProcessesOnPort } from "./port-utils.js";

const { stopped, blocked } = await stopNodeProcessesOnPort(config.port);

if (blocked.length > 0) {
  console.error(`Port ${config.port} is already used by another process:`);
  for (const processInfo of blocked) {
    console.error(`- ${processInfo.name} PID ${processInfo.pid}`);
  }
  console.error("Stop that process or change PORT in .env.");
  process.exit(1);
}

if (stopped.length > 0) {
  const pids = stopped.map((processInfo) => processInfo.pid).join(", ");
  console.log(`Stopped old Node server on port ${config.port} (PID ${pids}).`);
}

const child = spawn(process.execPath, ["--watch", "src/server.js"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
