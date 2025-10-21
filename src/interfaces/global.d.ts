// Global ambient declarations for the DialogCreator project
// This file augments the Window interface with custom properties used across preload scripts.
// It is picked up automatically because tsconfig.json includes "src/**/*".

export {};

declare global {
    interface Window {
        /**
         * Collection of disposer / cleanup handlers registered by preview customJS,
         * invoked before a new preview render. Each handler should be safe to call once.
         */
        __userHandlers?: Array<() => void>;
        __nameGlobals?: Record<string, HTMLElement>;
        __radioGroupGlobals?: Record<string, string>;

        /**
         * CodeMirror 6 helper API exposed by the in-app bundle.
         * Available in windows that load the CM6 bundle (e.g., Code window).
         */
        CM6?: {
            createCodeEditor: (
                el: HTMLElement,
                opts?: {
                    value?: string;
                    onChange?: (value: string) => void
                }
            ) => {
                view: unknown;
                getValue(): string;
                setValue(v: string): void;
                focus(): void;
                destroy(): void;
            },
            setDialogMeta?: (meta: {
                elements: Array<{
                    name: string;
                    type: string;
                    options?: string[];
                }>;
                radioGroups?: string[];
            } | null | undefined) => void,
            requestLint?: (instance: { view?: unknown } | null | undefined) => void,
            setDiagnostics?: (instance: { view?: unknown } | null | undefined, diags: Array<{
                from: number;
                to: number;
                severity?: 'info' | 'warning' | 'error';
                message: string;
            }>) => void
        };
    }
}
