import type { Dialog } from './dialog';
import { StringNumber } from './elements';

export interface ContainerItemDescriptor {
    text: string;
    type?: string;
    active?: boolean;
}

export interface PreviewUI {
    /** Log helper (forwards to editor console) */
    log(...args: unknown[]): void;

    /** Show an app message dialog */
    // New preferred signatures
    showMessage(message: string, detail?: string, type?: 'info' | 'error' | 'question' | 'warning'): void;
    // Legacy compatibility signatures (will be normalized internally)
    showMessage(type: 'info' | 'error' | 'question' | 'warning', title: string, message: string): void;
    showMessage(type: 'info' | 'error' | 'question' | 'warning', message: string): void;

    /** Legacy stub retained for compatibility. Does nothing in Preview. */
    run(command: string): void;

    /** Update the syntax panel with the provided command. */
    updateSyntax(command: string): void;

    /** Reset the dialog to its initial Preview state (as first opened). */
    resetDialog(): void;

    /** Generic getter (value / dataset-driven) */
    get(element: string, prop: string): unknown;

    /** Generic setter */
    set(element: string, prop: string, value: unknown): void;

    /** Unified getters/setters */
    // Returns current value or items depending on element type.
    // - Input: string
    // - Label: string
    // - Select: selected value (string)
    // - Checkbox: boolean (checked)
    // - Radio: boolean (selected)
    // - Counter: number
    // - Container: array of row labels (items) or '' when empty
    getValue(element: string): unknown;

    // Sets value or items depending on element type and value type.
    // - If value is an array: for Select/Container, sets items/options/rows
    // - If scalar: sets value for Input/Label/Select/Counter; boolean for Checkbox/Radio
    setValue(element: string, value: unknown | string[] | ContainerItemDescriptor[]): void;

    // Selected values:
    // - Container: array of selected row labels
    // - Select: array with single selected value (or empty array when none)
    // - Container: array of selected row labels (items) or '' when empty
    getSelected(element: string): string[] | '';

    /** Checkbox/Radio convenience for checked/selected */
    isChecked(element: string): boolean;
    isUnchecked(element: string): boolean;

    /** Checkbox/Radio convenience: set checked/selected state to true */
    check(element: string): void;
    check(...elements: string[]): void;

    /** Checkbox/Radio convenience: set checked/selected state to false */
    uncheck(element: string): void;
    uncheck(...elements: string[]): void;

    /** Returns whether the element is currently visible in Preview */
    isVisible(element: string): boolean;
    isHidden(element: string): boolean;

    /** Returns whether the element is currently enabled (interactive) in Preview */
    isEnabled(element: string): boolean;
    isDisabled(element: string): boolean;

    /** Show / hide */
    show(element: string, on?: boolean): void;
    hide(element: string, on?: boolean): void;

    /** Enable / disable */
    enable(element: string, on?: boolean): void;
    disable(element: string, on?: boolean): void;

    /** Error helpers */
    addError(element: string, message: string): void;
    clearError(element: string, message?: string): void;
    clearError(...elements: string[]): void;

    /** Return list of available dataset names from the connected workspace */
    listDatasets(): string[];
    /** Return list of variables specific to a dataset */
    listVariables(dataset: string | string[]): Array<string | ContainerItemDescriptor>;

    /** Register an event handler on the wrapper */
    on(element: string, event: string, handler: (ev: Event, el: HTMLElement) => void): void;

    /** Convenience: onClick/onChange/onInput wrappers */
    onClick(element: string, handler: (ev: Event, el: HTMLElement) => void): void;
    onChange(element: string, handler: (ev: Event, el: HTMLElement) => void): void;
    onInput(element: string, handler: (ev: Event, el: HTMLElement) => void): void;

    /** Dispatch an event on the element (bubbling), without changing state. Supported: 'click', 'change', 'input'. Defaults to 'change'. */
    trigger(element: string, event?: 'click' | 'change' | 'input'): void;

    /** Convenience: trigger a 'change' event on the element. */
    triggerChange(element: string): void;

    /** Convenience: trigger a 'click' event on the element. */
    triggerClick(element: string): void;

    /** Set selection: Select elements (single value) or Container items (accepts string or string[]). */
    setSelected(element: string, value: string | string[]): void;

    /** Legacy alias (additive for Container). Prefer setSelected for explicit selection. */
    select(element: string, value: string): void;

    /** Add a new item to a Container (does nothing for Select). */
    addValue(element: string, value: string | ContainerItemDescriptor): void;

    /** Clear item(s) from a Container by their label(s) (does nothing for Select). */
    clearValue(element: string, value: string | string[]): void;

    /** Clear the value of an Input element. */
    clearInput(element: string): void;

    /** Clear content of supported elements (Input, Container). */
    clearContent(...elements: string[]): void;

    /** Set the visible label text of a Button element. */
    setLabel(element: string, label: string): void;

    /** Change the label of a specific item within a Container. */
    changeValue(element: string, oldValue: string, newValue: string): void;

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
    // Find the element wrapper by element identifier within canvas
    findWrapper: (element: string) => HTMLElement | null;
    // Locate radio group members by group name
    findRadioGroupMembers: (group: string) => HTMLElement[];
    // Update element properties (delegates to renderutils.updateElement)
    updateElement: (element: HTMLElement, props: StringNumber) => void;
    // Surface runtime errors in Preview (already bound to canvas)
    showRuntimeError: (msg: string) => void;
    // Forward logs to the Editor console (message already formatted as single string)
    logToEditor: (msg: string) => void;
    // Show an app-level dialog message via main process
    showDialogMessage: (type: 'info' | 'warning' | 'error' | 'question', message: string, detail: string) => void;
    // Open an external floating run panel near the Preview window
    openSyntaxPanel?: (command: string) => void;
    // Reset the Preview dialog to its initial state
    resetDialog: () => void;
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
        name?: string | number;
        title?: string | number;
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
