import { cn } from "@/lib/utils";

/**
 * BottleArt — a deterministic gradient stand-in for product imagery.
 *
 * The knowledge base carries no images, so the card's "image" is generated from
 * the fragrance id (via `swatchFor` in the formatter). When real photography
 * exists, swap the inner element for next/image; the layout is unchanged.
 */
export function BottleArt({
  swatch,
  label,
  className,
}: {
  swatch: [string, string];
  label?: string;
  className?: string;
}) {
  const [from, to] = swatch;
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-lg", className)}
      style={{ background: `radial-gradient(120% 120% at 50% 18%, ${from}, ${to})` }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[60%] w-[32%] rounded-[10px] border border-white/15 bg-white/[0.06] backdrop-blur-[1px]">
          <div className="mx-auto mt-[-9%] h-[9%] w-[26%] rounded-t-sm border border-white/15 bg-white/10" />
        </div>
      </div>
      {label && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.08em] text-white/85">
          {label}
        </span>
      )}
    </div>
  );
}
