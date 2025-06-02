export interface Utils {
    getKeys(obj: Record<string, unknown>): Array<string>;
    isNumeric: (x: string) => boolean;
    possibleNumeric: (x: string) => boolean;
    isInteger: (x: number) => boolean;
    asNumeric(x: string): number;
    asInteger(x: string): number;
    isTrue: (x: unknown) => boolean;
    isFalse: (x: unknown) => boolean;
    isNull: (x: unknown) => boolean;
    missing: (x: unknown) => boolean;
    exists: (x: unknown) => boolean;
    capitalize: (str: string) => string;
    isElementOf<T>(x: T, set: T[]): boolean;
    isNotElementOf<T>(x: T, set: T[]): boolean;
    isValidColor: (value: string) => boolean;
}
