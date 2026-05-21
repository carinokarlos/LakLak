import { config } from "../src/config.js";
import { stopNodeProcessesOnPort } from "./port-utils.js";

const { stopped, blocked } = await stopNodeProcessesOnPort(config.port);

if (stopped.length === 0 && blocked.length === 0) {
  console.log(`No process is listening on port ${config.port}.`);
}

for (const processInfo of stopped) {
  console.log(`Stopped ${processInfo.name} PID ${processInfo.pid} on port ${config.port}.`);
}

for (const processInfo of blocked) {
  console.log(
    `Port ${config.port} is used by ${processInfo.name} PID ${processInfo.pid}; not stopping it.`
  );
}
