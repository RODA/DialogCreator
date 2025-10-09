export interface Utils {
    getKeys<T extends object>(obj: T | null | undefined): Array<Extract<keyof T, string>>;
    // getKeys(obj: Record<string, unknown>): Array<string>;
    isKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T;
    isOwnKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T;
    getKeyValue<T extends object, K extends keyof T>(obj: T, key: K): T[K];

    // --- overload expectType
    expectType<T extends object, K extends string>(obj: T, key: K, kind: 'string'): asserts obj is T & Record<K, string>;
    expectType<T extends object, K extends string>(obj: T, key: K, kind: 'number'): asserts obj is T & Record<K, number>;
    expectType<T extends object, K extends string>(obj: T, key: K, kind: 'boolean'): asserts obj is T & Record<K, boolean>;

    isNumeric: (x: string) => boolean;
    possibleNumeric: (x: string) => boolean;
    isInteger: (x: number) => boolean;
    asNumeric(x: string): number;
    ensureNumber(x: unknown, fallback: number): number;
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
    // True if s is a valid (non-reserved) JavaScript identifier using ASCII letters/digits/_/$
    isIdentifier: (s: string) => boolean;
    textWidth(text: string, fontSize: number, fontFamily?: string): number;
}
