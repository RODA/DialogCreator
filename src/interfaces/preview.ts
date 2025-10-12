import type { Dialog } from './dialog';
import { StringNumber } from './elements';

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

    /** Unified getters/setters */
    // Returns current value or items depending on element type.
    // - Input: string
    // - Label: string
    // - Select: selected value (string)
    // - Checkbox: boolean (checked)
    // - Radio: boolean (selected)
    // - Counter: number
    // - Container: array of row labels (items)
    getValue(name: string): unknown;
    // Sets value or items depending on element type and value type.
    // - If value is an array: for Select/Container, sets items/options/rows
    // - If scalar: sets value for Input/Label/Select/Counter; boolean for Checkbox/Radio
    setValue(name: string, value: unknown | string[]): void;
    // Selected values:
    // - Container: array of selected row labels
    // - Select: array with single selected value (or empty)
    getSelected(name: string): string[];

    /** Checkbox/Radio convenience for checked/selected */
    isChecked(name: string): boolean;
    isUnchecked(name: string): boolean;

    /** Checkbox/Radio convenience: set checked/selected state to true */
    check(name: string): void;

    /** Checkbox/Radio convenience: set checked/selected state to false */
    uncheck(name: string): void;

    /** Returns whether the element is currently visible in Preview */
    isVisible(name: string): boolean;
    isHidden(name: string): boolean;

    /** Returns whether the element is currently enabled (interactive) in Preview */
    isEnabled(name: string): boolean;
    isDisabled(name: string): boolean;

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

    /** Set selection: Select elements (single value) or Container rows (accepts string or string[]). */
    setSelected(name: string, value: string | string[]): void;

    /** Legacy alias (additive for Container). Prefer setSelected for explicit selection. */
    select(name: string, value: string): void;

    /** Add a new row/value to a Container (does nothing for Select). */
    addValue(name: string, value: string): void;

    /** Delete a row/value from a Container by its label (does nothing for Select). */
    deleteValue(name: string, value: string): void;

    /**
     * Call a backend service by name. Returns a Promise, and also supports an optional callback for simplicity.
     * If a callback is provided, it will be called with the result when available.
     */
    // call(service: string, args?: unknown, cb?: (result: unknown) => void): Promise<unknown>;

    // items() / values() removed in favor of getValue/setValue/getSelected

    /** Dispose all registered event handlers (internal use) */
    __disposeAll(): void;
}

// Lightweight environment adapters so this module stays import-safe everywhere.
// Nothing here touches DOM/Electron directly until you call createPreviewUI().
export interface PreviewUIEnv {
    // Find the element wrapper by name within canvas
    findWrapper: (name: string) => HTMLElement | null;
    // Update element properties (delegates to renderutils.updateElement)
    updateElement: (element: HTMLElement, props: StringNumber) => void;
    // Surface runtime errors in Preview (already bound to canvas)
    showRuntimeError: (msg: string) => void;
    // Forward logs to the Editor console (message already formatted as single string)
    logToEditor: (msg: string) => void;
    // Show an app-level dialog message via main process
    showDialogMessage: (type: 'info' | 'warning' | 'error' | 'question', message: string, detail: string) => void;
    // Experimental bridge to services; returns a Promise and optionally invokes a callback
    // call: (service: string, args?: unknown, cb?: (result: unknown) => void) => Promise<unknown>;
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
