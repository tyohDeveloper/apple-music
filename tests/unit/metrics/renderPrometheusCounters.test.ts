import { describe, expect, it } from "vitest";
import { renderPrometheusCounters } from "../../../src/metrics/renderPrometheusCounters.ts";

describe("renderPrometheusCounters", () => {
  it("renders help, type and sorted samples", () => {
    const text = renderPrometheusCounters("http_responses_total", "Responses.", "class", { "4xx": 2, "2xx": 5 });
    expect(text).toBe(
      '# HELP http_responses_total Responses.\n# TYPE http_responses_total counter\n' +
        'http_responses_total{class="2xx"} 5\nhttp_responses_total{class="4xx"} 2\n',
    );
  });
});
