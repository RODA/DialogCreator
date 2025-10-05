
// PURE utilities functions, no side effects, no dependencies
// these do not depend on browser-only APIs, so can be imported
// in both renderer AND main process.

import { Utils } from '../interfaces/utils';

const TRUE_SET = new Set(['true', 't', '1']); // , 'yes', 'y', 'on'
const FALSE_SET = new Set(['false', 'f', '0']); // , 'no', 'n', 'off'


let __measureCanvas: HTMLCanvasElement | null = null;

export const utils: Utils = {
    // Generic typing lives in the Utils interface; we keep implementation minimal here.
    getKeys: function (obj) {
        if (!obj) {
            // never[] is assignable to Array<Extract<keyof typeof obj,string>>
            return [] as never[];
        }
        return Object.keys(obj) as Array<Extract<keyof typeof obj, string>>;
    },
    // getKeys: function(obj) {
    //     if (obj === null) return([]);
    //     return Object.keys(obj);
    // },

    // ---- inline typing necessary below ----
    isKeyOf: function <T extends object>(obj: T, key: PropertyKey): key is keyof T {
        return !!obj && key in obj;
    },

    isOwnKeyOf: function <T extends object>(obj: T, key: PropertyKey): key is keyof T {
        if (!obj) return false;
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    getKeyValue: function <T extends object, K extends keyof T>(obj: T, key: K): T[K] {
        return obj[key];
    },

    // Overloaded primitive type expectation helper
    expectType: (function() {
        function expectType<T extends object, K extends string>(obj: T, key: K, kind: 'string'): asserts obj is T & Record<K, string>;
        function expectType<T extends object, K extends string>(obj: T, key: K, kind: 'number'): asserts obj is T & Record<K, number>;
        function expectType<T extends object, K extends string>(obj: T, key: K, kind: 'boolean'): asserts obj is T & Record<K, boolean>;
        function expectType(obj: any, key: string, kind: 'string' | 'number' | 'boolean') {
            if (!obj || !(key in obj)) {
                throw new Error(`Missing property "${key}"`);
            }
            const v = obj[key];
            if (typeof v !== kind || (kind === 'number' && !Number.isFinite(v))) {
                throw new Error(`Expected "${key}" to be ${kind}, got ${typeof v}`);
            }
        }
        return expectType;
    })(),
    // ---- inline typing necessary above ----

    isNumeric: function (x) {
        if (utils.missing(x) || x === null || ("" + x).length == 0) {
            return false;
        }

        return (
            Object.prototype.toString.call(x) === "[object Number]" &&
            !isNaN(parseFloat("" + x)) &&
            isFinite(utils.asNumeric(x as string))
        )
    },

    possibleNumeric: function(x) {
        if (utils.isNumeric(x)) {
            return true;
        }
        if (
            utils.isNumeric("" + utils.asNumeric(x)) ||
            utils.isInteger(utils.asInteger(x))
        ) {
            return true;
        }

        return false;
    },

    isInteger: function (x) {
        return parseFloat("" + x) == parseInt("" + x, 10);
    },

    asNumeric: function(x) {
        return parseFloat("" + x);
    },

    ensureNumber: function(x, fallback) {
        const n = Number(x);
        return Number.isFinite(n) ? n : fallback;
    },

    asInteger: function(x) {
        return parseInt("" + x);
    },

    isTrue: function(x) {
        if (utils.missing(x) || utils.isNull(x)) {
            return false;
        }
        // return (x === true || (typeof x === 'string' && (x === 'true' || x === 'True')));
        if (typeof x === 'boolean') return x === true;
        if (typeof x === 'number') return x === 1;
        if (typeof x === 'string') {
            const s = x.trim().toLowerCase();
            if (TRUE_SET.has(s)) return true;
            if (FALSE_SET.has(s)) return false; // explicit false tokens remain false
        }
        return false;
    },

    isFalse: function(x) {
        if (utils.missing(x) || utils.isNull(x)) {
            return false;
        }
        // return (x === false || (typeof x === 'string' && (x === 'false' || x === 'False')));
        if (typeof x === 'boolean') return x === false;
        if (typeof x === 'number') return x === 0;
        if (typeof x === 'string') {
            const s = x.trim().toLowerCase();
            return FALSE_SET.has(s);
        }
        return false;
    },

    isNull: function(x) {
        return utils.exists(x) && x === null;
    },

    missing: function (x) {
        return x === void 0 || x === undefined;
    },

    exists: function (x) {
        return x !== void 0 && x !== undefined;
    },

    capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    isElementOf: function (x, set) {
        if (
            utils.missing(x) ||
            utils.isNull(x) ||
            utils.missing(set) ||
            utils.isNull(set) ||
            set.length === 0
        ) {
            return false;
        }

        return set.indexOf(x) >= 0;
    },

    isNotElementOf: function (x, set) {
        if (
            utils.missing(x) ||
            utils.isNull(x) ||
            utils.missing(set) ||
            utils.isNull(set) ||
            set.length === 0
        ) {
            return false;
        }

        return set.indexOf(x) < 0;
    },

    isValidColor: function(value) {
        const x = new Option().style;
        x.color = value;
        return x.color !== '';
    },

    // Measure the natural width (in CSS pixels) of a text string for a given font
    // Prefers an offscreen canvas when a DOM is available; otherwise falls back to an approximation
    textWidth: function(text, fontSize, fontFamily?) {
        const t = String(text ?? '');
        if (t.length === 0) return 0;

        const size = Number(fontSize) || 12;
        // Resolve a usable font-family string
        let family = (fontFamily && String(fontFamily).trim().length) ? String(fontFamily) : '';
        if (!family && typeof window !== 'undefined' && typeof getComputedStyle === 'function') {
            family = getComputedStyle(document.body || document.documentElement).fontFamily || '';
        }

        if (!family) {
            family = 'Arial, Helvetica, sans-serif';
        }
        // Quote family names with spaces that are not already quoted
        const familyNormalized = family
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(name => (/^['"]/ .test(name) || !/\s/.test(name)) ? name : `"${name}"`)
            .join(', ');

        // Prefer OffscreenCanvas if available (no layout required)
        const Offscreen = globalThis.OffscreenCanvas;
        if (Offscreen && typeof Offscreen === 'function') {
            const off = new Offscreen(0, 0);
            const ctx = off.getContext('2d');
            if (ctx && typeof ctx.measureText === 'function') {
                ctx.font = `${size}px ${familyNormalized}`;
                const metrics = ctx.measureText(t);
                return Math.ceil(metrics.width);
            }
        }

        // Fallback to a hidden canvas element in the DOM
        if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = `${size}px ${familyNormalized}`;
                const metrics = ctx.measureText(t);
                return Math.ceil(metrics.width);
            }
        }

        // Final fallback approximation: average character width ≈ 0.6 * fontSize
        return Math.ceil(t.length * size * 0.6);
    },
};
