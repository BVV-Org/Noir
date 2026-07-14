# Motion language

Reference study: **jasminegunarto.com** (GSAP 3.13 + ScrollTrigger + SplitText +
CustomEase, block-based). We reproduce the *feel* with Framer Motion — no new
dependency — because the feel lives in four decisions, not in the library.

## 1. One ease does almost everything

Their whole site runs on a single registered CustomEase:

```
ease-inout-1  →  cubic-bezier(0.496, 0.004, 0, 1)
```

It holds still for a beat, snaps hard through the middle, then glides a long
way into rest. That long tail is what reads as "expensive" — the eye is told
the motion has *mass*. Two supporting curves exist but are rare:

```
ease-inout-2  →  cubic-bezier(0.79, 0.19, 0.24, 0.98)
ease-x        →  cubic-bezier(0.47, 0.82, 0.03, 0.97)
```

Ours live in `EASE` in `lib/animations/config.ts`. Reach for `EASE.signature`
by default; a bespoke curve per component is how a site stops feeling like one
object.

## 2. Two speeds on the same text

The single most valuable thing on that site. The title is split into lines
**and** characters, each character gets its **own** overflow mask, and then two
animations run at once on the same words:

| layer | property | from → to | duration | stagger |
| --- | --- | --- | --- | --- |
| characters | `xPercent` | `-100 → 0` | 0.8s | 0.04s |
| parent line | `xPercent` | `-15 → 0` | 1.4s | — |

The characters arrive fast, the line they sit in keeps drifting slowly behind
them. That is parallax *inside the typography*, and it manufactures depth from
a flat headline. A single-layer reveal — the thing most sites ship — cannot
buy this at any duration.

Implemented as `CharReveal` (`components/motion/char-reveal.tsx`).

## 3. Slow down, then overlap

Their durations are 2–3× what a design system usually allows: titles 1.4s,
section wipes 1.6s, media 1.4s. It never feels slow, because timelines
**overlap** rather than queue — the next element starts at `-=0.25` or `<`,
i.e. *before* the previous one finishes. Total sequence stays ~1.6s while every
individual part gets a luxurious arc.

Rule: long individual durations, short total. Never `delay = sum(previous)`.

## 4. Reveal by clip, never by opacity

Sections wipe in with `clipPath: inset(0 100% 0 0) → inset(0 0 0 0)` and wipe
out with `inset(0 0 0 0) → inset(0 0 100% 0)`. Images open from the centre
(`inset(0 50% 0 50%) → inset(0)`) while the inner `<img>` counter-scales
`2 → 1`, so the picture appears to *settle* rather than fade. A fade says
"content loaded". A clip says "the frame moved". Only one of those is a brand.

## Conversion notes

Motion is only worth its bytes where it moves someone toward a purchase.
What actually earns its place, in priority order:

1. **The CTA is the last thing to arrive.** The eye lands wherever motion ends,
   so the button is the terminus of the sequence, not an afterthought bolted
   below it. Measured on the built hero: characters land at ~0.9s, the CTA
   fades up at 0.7→0.94s, and the headline's slow line-drift tails off
   underneath it until ~1.6s (by then it is a sub-pixel settle, not visible
   motion). The last thing a visitor sees *appear* is the thing we want clicked.
2. **Never animate away the primary action.** The headline can be theatrical;
   the CTA fades in on a short, near-linear curve and is clickable
   immediately. A magnetic pull on hover (we have `Magnetic`) raises click
   intent without ever delaying the click.
3. **Trust copy travels with the CTA, not with the headline.** Free returns,
   authenticity, sample-first — set as mono telemetry directly under the
   button, revealed in the same beat. It answers the objection at the exact
   moment the objection forms.
4. **Give the fold a second read.** Their hero states a fact ("A VISUAL
   DESIGNER") and lets the *scroll* deliver the argument. Ours states the
   invitation and puts the proof (house count, shipping, samples) one line
   below — so a visitor who reads nothing else still gets a reason.
5. **Reduced motion is a real branch, not a disabled flag.** Every primitive
   here renders its settled state outright under `prefers-reduced-motion`. A
   headline that never arrives converts at zero.
