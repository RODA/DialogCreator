export interface ElementCatalog {
    getProperties(element: string): Promise<Record<string, string>>;
    updateProperty(element: string, property: string, value: string): Promise<boolean>;
    resetProperties(element: string): Promise<false | Record<string, string>>;
}
