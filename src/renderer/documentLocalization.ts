import type { PreviewDialog } from '../interfaces/preview';
import type { DialogLocaleDictionary } from '../interfaces/dialog';

export const clonePreviewDialog = (input: PreviewDialog): PreviewDialog => {
    try {
        return JSON.parse(JSON.stringify(input));
    } catch {
        return input;
    }
};

export const uniqueLocales = (dialog: PreviewDialog): string[] => {
    const out: string[] = [];
    const add = (value: unknown) => {
        const locale = String(value ?? '').trim();
        if (locale && !out.includes(locale)) {
            out.push(locale);
        }
    };

    add(dialog.properties.language);
    add(dialog.i18n?.baseLocale);
    Object.keys(dialog.i18n?.locales || {}).forEach(add);
    return out;
};

export const formatLocaleName = (locale: string): string => {
    const normalized = String(locale || '').trim().replace(/_/g, '-');
    if (!normalized) {
        return locale;
    }

    const language = normalized.split('-')[0];
    try {
        if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
            const names = new Intl.DisplayNames([normalized], { type: 'language' });
            const label = names.of(language);
            if (label) {
                return label.charAt(0).toLocaleUpperCase(normalized) + label.slice(1);
            }
        }
    } catch { /* fall back to locale code */ }

    return locale;
};

const resolveTranslation = (
    baseDict: DialogLocaleDictionary,
    localeDict: DialogLocaleDictionary,
    element: Record<string, any>,
    prop: string
): string | undefined => {
    const ids = [
        String(element.id ?? '').trim()
    ].filter(Boolean);

    for (const id of ids) {
        const key = `elements.${id}.${prop}`;
        if (localeDict[key] !== undefined) return localeDict[key];
        if (baseDict[key] !== undefined) return baseDict[key];
    }

    return undefined;
};

const translateDelimitedItems = (
    baseDict: DialogLocaleDictionary,
    localeDict: DialogLocaleDictionary,
    element: Record<string, any>,
    raw: unknown
): string | undefined => {
    const ids = [
        String(element.id ?? '').trim()
    ].filter(Boolean);
    const values = String(raw ?? '')
        .split(/[;,]/)
        .map(item => item.trim());

    if (!ids.length || !values.some(Boolean)) {
        return undefined;
    }

    let changed = false;
    const translated = values.map((value, index) => {
        for (const id of ids) {
            const key = `elements.${id}.items.${index}`;
            if (localeDict[key] !== undefined) {
                changed = true;
                return localeDict[key];
            }
            if (baseDict[key] !== undefined) {
                changed = true;
                return baseDict[key];
            }
        }
        return value;
    });

    return changed ? translated.join(', ') : undefined;
};

export const localizeDialogDocument = (input: PreviewDialog, locale: string): PreviewDialog => {
    const copy = clonePreviewDialog(input);
    const i18n = copy.i18n;
    if (!i18n?.locales) {
        return copy;
    }

    const baseLocale = String(i18n.baseLocale || copy.properties.language || '').trim();
    const baseDict = (baseLocale && i18n.locales[baseLocale]) || {};
    const localeDict = i18n.locales[locale] || baseDict;

    copy.properties.language = locale;
    const title = localeDict['dialog.title'] ?? baseDict['dialog.title'];
    if (title !== undefined) {
        copy.properties.title = title;
    }

    copy.elements = copy.elements.map((element) => {
        const next = { ...element };
        const type = String(next.type || '').trim();

        const label = resolveTranslation(baseDict, localeDict, next, 'label');
        if (label !== undefined) {
            next.label = label;
        }

        const value = resolveTranslation(baseDict, localeDict, next, 'value');
        if (value !== undefined) {
            if (type === 'Select') {
                next.__localizedValue = value;
            } else {
                if (type === 'Label') {
                    next.__baseValue ??= next.value;
                }
                next.value = value;
            }
        }

        const itemText = translateDelimitedItems(baseDict, localeDict, next, next.items);
        if (itemText !== undefined) {
            if (type === 'Choice') {
                const values = String(next.items || '').split(',').map((value) => value.trim());
                const labels = itemText.split(',').map((value) => value.trim());
                next.__itemLabels = Object.fromEntries(values.map((value, index) => [value, labels[index] || value]));
            } else {
                next.items = itemText;
            }
        }

        if (type === 'Choice' && itemText === undefined) {
            const choiceValue = resolveTranslation(baseDict, localeDict, next, 'items');
            if (choiceValue !== undefined) {
                next.items = choiceValue;
            }
        }

        return next;
    });

    return copy;
};

export const createDialogMessageTranslator = (dialog: PreviewDialog, locale: string) => {
    const i18n = dialog.i18n;
    const baseLocale = String(i18n?.baseLocale || dialog.properties.language || '').trim();
    const baseDict = (baseLocale && i18n?.locales?.[baseLocale]) || {};
    const localeDict = (locale && i18n?.locales?.[locale]) || baseDict;

    return (text: string): string => {
        const translationKey = String(text ?? '');
        const translated = localeDict[translationKey] ?? baseDict[translationKey];
        if (translated !== undefined) {
            return translated;
        }

        const sourceKey = Object.keys(baseDict).find(key => baseDict[key] === translationKey);
        if (sourceKey) {
            return localeDict[sourceKey] ?? baseDict[sourceKey] ?? translationKey;
        }

        return translationKey;
    };
};
