import type { PerformanceProfile } from "@/types";
import { CORE_METRICS } from "@/lib/config/metrics";
import { PerformanceBar } from "@/components/product/performance-bar";

/**
 * PerformancePanel — the core `nv` metrics V1 surfaces.
 *
 * The extended profile (citrus, smokiness, femininity…) is stored on every
 * product and deliberately not rendered: twenty bars is a spreadsheet, not a
 * product page. Those numbers are held for the DNA radar in a later version
 * (TDD §7) — this component is where that visualization will attach.
 *
 * Metrics missing from Shopify are skipped rather than drawn at zero, which
 * would read as "this fragrance has no longevity".
 */
export function PerformancePanel({
  performance,
}: {
  performance: PerformanceProfile;
}) {
  const metrics = CORE_METRICS.filter(
    ([key]) => typeof performance[key] === "number"
  );

  if (metrics.length === 0) return null;

  return (
    <section aria-labelledby="performance-heading">
      <h2 id="performance-heading" className="text-h4 font-semibold">
        Performance
      </h2>

      <div className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {metrics.map(([key, label]) => (
          <PerformanceBar
            key={key}
            label={label}
            value={performance[key] as number}
          />
        ))}
      </div>
    </section>
  );
}
