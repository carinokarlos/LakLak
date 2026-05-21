import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function findPidsOnPort(port) {
  if (process.platform !== "win32") {
    return [];
  }

  const { stdout } = await execFileAsync("netstat", ["-ano"]);
  const pids = new Set();

  for (const line of stdout.split(/\r?\n/)) {
    const columns = line.trim().split(/\s+/);
    const [, localAddress, , state, pid] = columns;

    if (state === "LISTENING" && localAddress?.endsWith(`:${port}`) && pid) {
      pids.add(pid);
    }
  }

  return [...pids];
}

export async function getProcessName(pid) {
  if (process.platform !== "win32") {
    return "";
  }

  const { stdout } = await execFileAsync("tasklist", [
    "/FI",
    `PID eq ${pid}`,
    "/FO",
    "CSV",
    "/NH",
  ]);

  const match = stdout.match(/^"([^"]+)"/m);
  return match?.[1] || "";
}

export async function stopPid(pid) {
  await execFileAsync("taskkill", ["/PID", String(pid), "/F"]);
}

export async function stopNodeProcessesOnPort(port) {
  const pids = await findPidsOnPort(port);
  const stopped = [];
  const blocked = [];

  for (const pid of pids) {
    const name = await getProcessName(pid);

    if (name.toLowerCase() === "node.exe") {
      await stopPid(pid);
      stopped.push({ pid, name });
    } else {
      blocked.push({ pid, name: name || "unknown" });
    }
  }

  return { stopped, blocked };
}
