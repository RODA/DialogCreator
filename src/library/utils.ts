
// PURE utilities functions, no side effects, no dependencies
// these do not depend on browser-only APIs, so can be imported
// in both renderer AND main process.

import { Utils } from '../interfaces/utils';

export const utils: Utils = {
    getKeys: function(obj) {
        if (obj === null) return([]);
        return Object.keys(obj);
    },

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
        return (x === true || (typeof x === 'string' && (x === 'true' || x === 'True')));
    },

    isFalse: function(x) {
        if (utils.missing(x) || utils.isNull(x)) {
            return false;
        }
        return (x === false || (typeof x === 'string' && (x === 'false' || x === 'False')));
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

    isValidColor: function(value: string): boolean {
        const x = new Option().style;
        x.color = value;
        return x.color !== '';
    },
}
