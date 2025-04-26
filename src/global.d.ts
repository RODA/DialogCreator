export {};

declare global {
    interface Window {
        electronAPI: {
            onPopulateDefaults: (callback: (args: any) => void) => void;
            addElementsToDefaults: () => void;
        };
    }
}