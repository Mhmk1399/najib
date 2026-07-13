/**
 * index.ts — Public API for the motion / reveal system.
 *
 * Import from:
 *   import { Reveal, RevealScript } from '@/components/motion';
 */

// ── Main exports ───────────────────────────────────────────────────────────
export { Reveal } from './reveal';
 
// ── Types ──────────────────────────────────────────────────────────────────
export type {
    RevealProps,
    RevealVariant,
    RevealDelay,
    RevealDuration,
    RevealTrigger,
    RevealElement,
} from './reveal.types';