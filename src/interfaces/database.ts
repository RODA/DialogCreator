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

// Type‑only import to avoid runtime coupling (no circular dep at runtime)
import type { elements } from '../modules/elements';

type ElementDefaults = typeof elements;

// Helper mapped type trimming non-DB elements (e.g. groupElement) if desired
type PersistableElementKeys = Exclude<keyof ElementDefaults, 'groupElement'>;

// Declare the persisted property lists (single source of truth for persistence)
export const PersistedProps = {
    buttonElement: [
        'nameid',
        'label',
        'left',
        'top',
        'maxWidth',
        'lineClamp',
        'color',
        'fontColor',
        'isEnabled',
        'isVisible'
    ],
    inputElement: [
        'nameid',
        'left',
        'top',
        'width',
        'value',
        'valueType',
        'isEnabled',
        'isVisible'
    ],
    selectElement: [
        'nameid',
        'left',
        'top',
        'width',
        'value',
        'arrowColor',
        'isEnabled',
        'isVisible'
    ],
    checkboxElement: [
        'nameid',
        'left',
        'top',
        'size',
        'color',
        'fill',
        'isChecked',
        'isEnabled',
        'isVisible'
    ],
    radioElement: [
        'nameid',
        'group',
        'left',
        'top',
        'size',
        'color',
        'isSelected',
        'isEnabled',
        'isVisible'
    ],
    counterElement: [
        'nameid',
        'left',
        'top',
        'space',
        'color',
        'startval',
        'maxval',
        'isEnabled',
        'isVisible'
    ],
    sliderElement: [
        'nameid',
        'left',
        'top',
        'width',
        'height',
        'direction',
        'color',
        'isEnabled',
        'isVisible',
        'handlepos',
        'handleshape',
        'handleColor',
        'handlesize'
    ],
    labelElement: [
        'left',
        'top',
        'maxWidth',
        'lineClamp',
        'fontColor',
        'value',
        'isEnabled',
        'isVisible'
    ],
    separatorElement: [
        'left',
        'top',
        'width',
        'height',
        'direction',
        'color',
        'isEnabled',
        'isVisible'
    ],
    containerElement: [
        'nameid',
        'left',
        'top',
        'width',
        'height',
        'contentType',
        'selection',
        'variableType',
        'parentContainer',
        'isEnabled',
        'isVisible'
    ]
} as const satisfies {
    [K in PersistableElementKeys]?: readonly (keyof ElementDefaults[K])[]
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

