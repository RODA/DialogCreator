// Per-element DB interfaces are auto-derived from PersistedProps below.
// Everything persisted is stored as a string in the database layer.
// We keep an index signature for backward compatibility (loose writes / dynamic keys).

// Map element names to their interfaces
// --- Auto-derived element interfaces will be declared AFTER PersistedProps ---

export interface DBInterface {
    getProperties: (element: string) => Promise<Record<string, string>>;
    updateProperty: (element: string, property: string, value: string) => Promise<boolean>;
    resetProperties: (element: string) => Promise<false | Record<string, string>>;
}

export type PropertiesType = {
    [key: string]: string[];
};

// --- Refactored DBElementsProps ---
// Instead of duplicating interface keys, declare only the subset of properties
// that must be persisted for each element. We type‑check that every listed
// property actually exists on the element defaults (defined in modules/elements.ts).

// Import at runtime; we only read the lightweight $persist arrays.
// This creates a (non-problematic) dependency on modules/elements.ts; if a cycle appears,
// we can refactor by moving a thin metadata export.
import { elements } from '../modules/elements';

type ElementDefaults = typeof elements;

// Build PersistedProps from $persist arrays present on each element definition.
// groupElement intentionally omitted from persistence (no DB row requirements yet).
export const PersistedProps = Object.fromEntries(
    Object.entries(elements)
        .filter(([key]) => key !== 'groupElement')
        .map(([key, val]) => [key, val.$persist ?? []])
) as {
    [K in Exclude<keyof ElementDefaults, 'groupElement'>]: readonly (keyof ElementDefaults[K])[];
};

// Export in the previous shape (mutable string arrays) where existing code expects it
export const DBElementsProps: PropertiesType = Object.fromEntries(
    Object.entries(PersistedProps).map(([k, v]) => [k, [...v]])
) as PropertiesType;


// ---------- Auto-derived interfaces & maps ----------
type ElementId = keyof typeof PersistedProps; // e.g. 'buttonElement'
type StripElementSuffix<S extends string> = S extends `${infer B}Element` ? B : S;
type CapitalizeFirst<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

type PersistedKeys<K extends ElementId> = (typeof PersistedProps)[K][number];

// Base record: each persisted key maps to string, plus index signature
type PersistedRecord<K extends ElementId> = {
    [P in PersistedKeys<K>]: string;
} & { [key: string]: string };

export type DBElements = {
    [K in ElementId as CapitalizeFirst<StripElementSuffix<K & string>>]: PersistedRecord<K>
};

export type AnyDBElement = DBElements[keyof DBElements];

// Convenient aliases (keep previous names usable externally)
export type Button    = DBElements['Button'];
export type Input     = DBElements['Input'];
export type Select    = DBElements['Select'];
export type Checkbox  = DBElements['Checkbox'];
export type Radio     = DBElements['Radio'];
export type Counter   = DBElements['Counter'];
export type Slider    = DBElements['Slider'];
export type Label     = DBElements['Label'];
export type Separator = DBElements['Separator'];
export type Container = DBElements['Container'];
export type ChoiceList = DBElements['ChoiceList'];
