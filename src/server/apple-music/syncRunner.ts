// Runs sync tasks in this server process (docs/design/apple-music-import.md, Decisions): a
// route creates the run, then starts its task here. Cancelling aborts a task between pages;
// closing aborts every task, which then finish as interrupted, and waits for them. Finished
// runs are counted by status for /metrics.
import { countByLabel } from "../../metrics/countByLabel.ts";
import { runLibrarySync, type SyncDependencies, type SyncJob } from "./runLibrarySync.ts";

export type SyncRunner = {
  readonly start: (job: SyncJob) => void;
  readonly cancel: (runId: string) => boolean;
  readonly finishedCounts: () => Readonly<Record<string, number>>;
  readonly close: () => Promise<void>;
};

type Task = { readonly controller: AbortController; readonly done: Promise<void> };

function stopAll(tasks: ReadonlyMap<string, Task>): Promise<void> {
  for (const task of tasks.values()) task.controller.abort("interrupted");
  return Promise.all([...tasks.values()].map((task) => task.done)).then(() => undefined);
}

export function syncRunnerOf(deps: SyncDependencies): SyncRunner {
  const tasks = new Map<string, Task>();
  let finished: Readonly<Record<string, number>> = {};
  const start = (job: SyncJob): void => {
    const controller = new AbortController();
    const done = runLibrarySync(deps, job, controller.signal)
      .then((end) => void (finished = countByLabel(finished, end.status)), (error: unknown) => deps.log.error(error))
      .finally(() => tasks.delete(job.runId));
    tasks.set(job.runId, { controller, done });
  };
  const cancel = (runId: string): boolean => {
    tasks.get(runId)?.controller.abort("cancelled");
    return tasks.has(runId);
  };
  return { start, cancel, finishedCounts: () => finished, close: () => stopAll(tasks) };
}
