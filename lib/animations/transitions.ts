import type { Transition } from "framer-motion";
import { duration, easePremium } from "./durations";

/**
 * Named transitions built from the timing tokens. Compose these into variants
 * rather than specifying `ease`/`duration` inline at call sites.
 */
export const transitions = {
  fast: { duration: duration.fast, ease: easePremium },
  base: { duration: duration.base, ease: easePremium },
  page: { duration: duration.page, ease: easePremium },
  reveal: { duration: duration.reveal, ease: easePremium },
} satisfies Record<string, Transition>;
