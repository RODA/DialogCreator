import type { Dialog } from './dialog';

export interface PreviewUI {
    /** Returns the wrapper element (outer div) for the named element */
    el(name: string): HTMLElement | null;

    /** Returns the inner element (first child) for the named element */
    inner(name: string): HTMLElement | null;

    /** Element type (dataset.type) for a named element */
    type(name: string): string | null;

    /** DOM id of the wrapper element */
    id(name: string): string | null;

    /** Log helper (forwards to editor console) */
    log(...args: unknown[]): void;

    /** Generic getter (value / dataset-driven) */
    get(name: string, prop: string): unknown;

    /** Generic setter */
    set(name: string, prop: string, value: unknown): void;

    /** Convenience alias to get/set value/text content */
    text(name: string): unknown;
    text(name: string, value: unknown): void;
    value(name: string): unknown;
    value(name: string, value: unknown): void;

    /** Checkbox/Radio convenience for checked/selected */
    checked(name: string): boolean;

    /** Checkbox/Radio convenience: set checked/selected state to true */
    check(name: string): void;

    /** Checkbox/Radio convenience: set checked/selected state to false */
    uncheck(name: string): void;

    /** Returns whether the element is currently visible in Preview */
    isVisible(name: string): boolean;

    /** Returns whether the element is currently enabled (interactive) in Preview */
    isEnabled(name: string): boolean;

    /** Show / hide */
    show(name: string, on?: boolean): void;
    hide(name: string): void;

    /** Enable / disable */
    enable(name: string, on?: boolean): void;
    disable(name: string): void;

    /** Register an event handler on the wrapper */
    on(name: string, event: string, handler: (ev: Event, el: HTMLElement) => void): void;

    /** Dispatch an event on the element (bubbling), without changing state. Supported: 'click', 'change'. */
    trigger(name: string, event: 'click' | 'change'): void;

    /** Dispose all registered event handlers (internal use) */
    __disposeAll(): void;
}

export interface PreviewScriptExports {
    /** Optional initialization hook; called after user script loads */
    init?: (ui: PreviewUI) => void;

    /** Optional disposer hook; called before preview re-renders or unloads */
    dispose?: (ui: PreviewUI) => void;

    /** Allow additional properties (user-defined state) while keeping known hooks typed */
    [key: string]: unknown;
}

export interface PreviewDialog {
    id: string;
    properties: {
        width: string | number;
        height: string | number;
        background?: string;
        fontSize?: string | number;
    };
    // Reuse the canonical Dialog.syntax shape for consistency
    syntax: Dialog['syntax'];
    elements: Array<Record<string, any>>; // existing broad shape retained
    customJS?: string;
}
