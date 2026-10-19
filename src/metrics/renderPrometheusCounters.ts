// Renders labelled counters in the Prometheus text exposition format.
export function renderPrometheusCounters(
  name: string,
  help: string,
  label: string,
  counts: Readonly<Record<string, number>>,
): string {
  const samples = Object.keys(counts)
    .sort()
    .map((key) => `${name}{${label}="${key}"} ${counts[key] ?? 0}`);
  return [`# HELP ${name} ${help}`, `# TYPE ${name} counter`, ...samples, ""].join("\n");
}
