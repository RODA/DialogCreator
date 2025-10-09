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
    }
}
