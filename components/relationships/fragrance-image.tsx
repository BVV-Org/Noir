import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FragranceImageVM } from "@/types/relationships";

/**
 * FragranceImage — the artwork slot for a fragrance.
 *
 * The KB ships an image table, but nearly every entry is still a generated
 * placeholder, so `imageFor` only hands us a `src` once a real rendition is
 * ready. Everything else falls back to the deterministic gradient bottle the
 * design already uses — an intentional stand-in reads better than a grey
 * placeholder photo, and the layout is identical either way.
 */
export function FragranceImage({
  image,
  label,
  sizes = "(min-width: 640px) 7rem, 6rem",
  className,
}: {
  image: FragranceImageVM;
  label?: string;
  sizes?: string;
  className?: string;
}) {
  const [from, to] = image.swatch;

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-secondary/40", className)}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 50% 18%, ${from}, ${to})`,
          }}
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-[60%] w-[32%] rounded-[10px] border border-white/15 bg-white/[0.06] backdrop-blur-[1px]">
              <div className="mx-auto mt-[-9%] h-[9%] w-[26%] rounded-t-sm border border-white/15 bg-white/10" />
            </div>
          </div>
        </div>
      )}
      {label && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.08em] text-white/85">
          {label}
        </span>
      )}
    </div>
  );
}
