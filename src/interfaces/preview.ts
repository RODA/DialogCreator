import type { Dialog } from './dialog';

export interface PreviewUI {
    /** Log helper (forwards to editor console) */
    log(...args: unknown[]): void;

    /** Show an app message dialog */
    // New preferred signatures
    showMessage(message: string, detail?: string, type?: 'info' | 'error' | 'question' | 'warning'): void;
    // Legacy compatibility signatures (will be normalized internally)
    showMessage(type: 'info' | 'error' | 'question' | 'warning', title: string, message: string): void;
    showMessage(type: 'info' | 'error' | 'question' | 'warning', message: string): void;

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

    /** Convenience: onClick/onChange/onInput wrappers */
    onClick(name: string, handler: (ev: Event, el: HTMLElement) => void): void;
    onChange(name: string, handler: (ev: Event, el: HTMLElement) => void): void;
    onInput(name: string, handler: (ev: Event, el: HTMLElement) => void): void;

    /** Dispatch an event on the element (bubbling), without changing state. Supported: 'click', 'change', 'input'. */
    trigger(name: string, event: 'click' | 'change' | 'input'): void;

    /** Select a value in a Select element (single choice) or select a row in a Container (adds to selection) */
    select(name: string, value: string): void;

    /**
     * Call a backend service by name. Returns a Promise, and also supports an optional callback for simplicity.
     * If a callback is provided, it will be called with the result when available.
     */
    call(service: string, args?: unknown, cb?: (result: unknown) => void): Promise<unknown>;

    /** Get or set the items/options of list-like elements.
     *  - For Select: returns/sets option strings; selection is always single-choice.
     *  - For Container: returns/sets row labels; selection can be multi-choice.
     */
    items(name: string): string[] | undefined;
    items(name: string, values: string[]): void;

    /** Return selected values.
     *  - For Select: a single-value array (or empty if nothing selected)
     *  - For Container: an array of selected row labels (multi-select)
     */
    values(name: string): string[];

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
