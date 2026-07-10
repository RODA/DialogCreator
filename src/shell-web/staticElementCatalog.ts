import type { ElementCatalog } from '../core/catalog/elementCatalog';
import { DBElementsProps } from '../interfaces/database';
import { elements } from '../modules/elements';

function readDefaultProperties(element: string): Record<string, string> {
    const defaults = elements[element as keyof typeof elements] as Record<string, unknown> | undefined;
    const properties = DBElementsProps[element] || [];
    const out: Record<string, string> = {};

    if (!defaults) {
        return out;
    }

    for (const property of properties) {
        out[property] = String(defaults[property] ?? '');
    }

    return out;
}

export function createStaticElementCatalog(): ElementCatalog {
    const overrides = new Map<string, Record<string, string>>();

    return {
        async getProperties(element: string): Promise<Record<string, string>> {
            return {
                ...readDefaultProperties(element),
                ...(overrides.get(element) || {})
            };
        },

        async updateProperty(
            element: string,
            property: string,
            value: string
        ): Promise<boolean> {
            const current = overrides.get(element) || {};
            current[property] = value;
            overrides.set(element, current);
            return true;
        },

        async resetProperties(element: string): Promise<false | Record<string, string>> {
            const defaults = readDefaultProperties(element);
            if (Object.keys(defaults).length === 0) {
                return false;
            }

            overrides.delete(element);
            return defaults;
        }
    };
}
