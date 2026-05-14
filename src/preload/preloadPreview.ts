/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";
import { AnyElement, StringNumber } from "../interfaces/elements";
import { PreviewDialog, PreviewScriptExports, PreviewUI, PreviewUIEnv } from "../interfaces/preview";
import type { DialogLocaleDictionary } from "../interfaces/dialog";

import { API_NAMES, createPreviewUI } from '../library/api';

let initialPreviewDialog: PreviewDialog | null = null;
let activePreviewLocale = '';
const previewLastSelectedContainerItem = new WeakMap<HTMLElement, HTMLElement | null>();
const previewShiftWheelContainerTargets = new WeakSet<HTMLElement>();
let previewHoveredContainer: HTMLElement | null = null;
let previewSearchContainer: HTMLElement | null = null;
let previewSearchInput: HTMLInputElement | null = null;

const isPreviewContainerSearchable = (host: HTMLElement | null): host is HTMLElement => {
    if (!(host instanceof HTMLElement)) {
        return false;
    }

    if (String(host.dataset.type || '') !== 'Container') {
        return false;
    }

    if (host.style.display === 'none' || !utils.isTrue(host.dataset.isVisible ?? 'true')) {
        return false;
    }

    if (!utils.isTrue(host.dataset.isEnabled ?? 'true')) {
        return false;
    }

    if (!utils.isTrue(host.dataset.autoSearchEnabled ?? 'false')) {
        return false;
    }

    return Boolean(host.querySelector('.container-content'));
};

const syncPreviewContainerSearchQuery = (host: HTMLElement, query: string) => {
    const trimmed = String(query || '').trim();
    if (trimmed) {
        host.dataset.searchQuery = trimmed;
    } else if ('searchQuery' in host.dataset) {
        delete host.dataset.searchQuery;
    }
    renderutils.applyContainerItemFilter(host);
};

const closePreviewContainerSearch = (clearQuery = true) => {
    const host = previewSearchContainer;
    const input = previewSearchInput;

    if (input && input.parentElement) {
        input.parentElement.remove();
    }

    document.querySelectorAll('.preview-container-search').forEach((node) => {
        if (node.parentElement) {
            node.parentElement.removeChild(node);
        }
    });

    if (clearQuery && host) {
        syncPreviewContainerSearchQuery(host, '');
    }

    if (host) {
        delete host.dataset.searchActive;
    }

    previewSearchInput = null;
    previewSearchContainer = null;
};

const openPreviewContainerSearch = (host: HTMLElement) => {
    if (!isPreviewContainerSearchable(host)) {
        return;
    }

    document.querySelectorAll('.preview-container-search').forEach((node) => {
        if (node.parentElement && node.parentElement !== host) {
            node.parentElement.removeChild(node);
        }
    });

    if (previewSearchContainer && previewSearchContainer !== host) {
        closePreviewContainerSearch(true);
    }

    if (previewSearchContainer === host && previewSearchInput) {
        previewSearchInput.focus();
        previewSearchInput.select();
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'preview-container-search';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'preview-container-search-input';
    input.placeholder = 'Search';
    input.value = String(host.dataset.searchQuery || '');
    input.setAttribute('aria-label', 'Search in container');

    input.addEventListener('input', () => {
        syncPreviewContainerSearchQuery(host, input.value);
    });

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' || ev.key === 'Esc') {
            ev.preventDefault();
            ev.stopPropagation();
            closePreviewContainerSearch(true);
        }
    });

    input.addEventListener('blur', () => {
        if (!String(input.value || '').trim()) {
            closePreviewContainerSearch(true);
        }
    });

    overlay.appendChild(input);
    host.appendChild(overlay);
    host.dataset.searchActive = 'true';
    previewSearchContainer = host;
    previewSearchInput = input;
    syncPreviewContainerSearchQuery(host, input.value);

    queueMicrotask(() => {
        input.focus();
        input.select();
    });
};

const splitPreviewList = (raw: unknown): string[] => {
    return String(raw ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
};

const normalizePreviewOrderList = (values: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    values.forEach((value) => {
        const next = String(value || '').trim();
        if (!next || seen.has(next)) return;
        seen.add(next);
        out.push(next);
    });
    return out;
};

const mergePreviewSelectionOrder = (host: HTMLElement, activeItems: string[]): string[] => {
    const prev = normalizePreviewOrderList(splitPreviewList(host.dataset.selectedOrder));
    const activeSet = new Set(activeItems);
    const next = prev.filter((value) => activeSet.has(value));
    const seen = new Set(next);
    activeItems.forEach((value) => {
        if (!seen.has(value)) {
            next.push(value);
            seen.add(value);
        }
    });
    return next;
};

const applyPreviewContainerItemStyle = (host: HTMLElement, item: HTMLElement, active: boolean) => {
    const label = item.querySelector('.container-text') as HTMLElement | null;
    const normalBg = host.dataset.backgroundColor || '#ffffff';
    const normalFg = host.dataset.fontColor || '#000000';
    const activeBg = host.dataset.activeBackgroundColor || '#589658';
    const activeFg = host.dataset.activeFontColor || '#ffffff';
    const disabledBg = host.dataset.disabledColor || '#d8d8d8';

    if (item.dataset.disabled === 'true' || item.classList.contains('container-item-disabled')) {
        item.style.backgroundColor = disabledBg;
        if (label) label.style.color = normalFg;
        return;
    }

    if (active) {
        item.style.backgroundColor = activeBg;
        if (label) label.style.color = activeFg;
    } else {
        item.style.backgroundColor = normalBg;
        if (label) label.style.color = normalFg;
    }
};

const syncPreviewContainerSelection = (host: HTMLElement, target: HTMLElement, core?: HTMLElement | null) => {
    const activeItems = Array.from(target.querySelectorAll<HTMLElement>('.container-item.active'))
        .map((item) => item.dataset.value || '')
        .map((value) => String(value).trim())
        .filter(Boolean);
    const joined = activeItems.join(',');

    host.dataset.activeValues = joined;
    host.dataset.selected = joined;
    if (core) {
        core.dataset.activeValues = joined;
        core.dataset.selected = joined;
    }

    if (utils.isTrue(host.dataset.itemOrder)) {
        const ordered = mergePreviewSelectionOrder(host, activeItems);
        host.dataset.selectedOrder = ordered.join(',');
        if (core) {
            core.dataset.selectedOrder = host.dataset.selectedOrder;
        }
    } else {
        delete host.dataset.selectedOrder;
        if (core && 'selectedOrder' in core.dataset) {
            delete core.dataset.selectedOrder;
        }
    }
};

const attachPreviewContainerHandlers = (host: HTMLElement, core: HTMLElement) => {
    const target = host.querySelector('.container-content') as HTMLElement | null;
    if (!target) {
        return;
    }

    host.addEventListener('mouseenter', () => {
        if (isPreviewContainerSearchable(host)) {
            previewHoveredContainer = host;
        }
    });

    host.addEventListener('mouseleave', () => {
        if (previewHoveredContainer === host) {
            previewHoveredContainer = null;
        }
    });

    if (!previewShiftWheelContainerTargets.has(target)) {
        previewShiftWheelContainerTargets.add(target);
        target.addEventListener('wheel', (ev) => {
            if (
                String(host.dataset.selection || 'single').toLowerCase() !== 'multiple' ||
                !utils.isTrue(host.dataset.pinontop) ||
                !ev.shiftKey ||
                !utils.isTrue(host.dataset.isEnabled)
            ) {
                return;
            }
            const verticalDelta = ev.deltaY !== 0 ? ev.deltaY : ev.deltaX;
            if (verticalDelta === 0) {
                return;
            }
            target.scrollTop += verticalDelta;
            ev.preventDefault();
        }, { passive: false });
    }

    const items = Array.from(target.querySelectorAll<HTMLElement>('.container-item'));
    items.forEach((item) => {
        applyPreviewContainerItemStyle(host, item, item.classList.contains('active'));
        item.addEventListener('click', (ev) => {
            if (!utils.isTrue(host.dataset.isEnabled)) {
                ev.preventDefault();
                return;
            }

            if (item.dataset.disabled === 'true' || item.classList.contains('container-item-disabled')) {
                ev.preventDefault();
                return;
            }

            const selectionMode = String(host.dataset.selection || 'single').toLowerCase();
            const forcedSingle = selectionMode === 'single-radio';
            const multiple = selectionMode === 'multiple';
            let deferPinOnTop = false;

            if (multiple && ev instanceof MouseEvent && ev.shiftKey) {
                const all = Array.from(target.querySelectorAll<HTMLElement>('.container-item'));
                const previous = previewLastSelectedContainerItem.get(host);
                const last = previous && previous.classList.contains('active') ? previous : null;
                const lastIndex = last ? all.indexOf(last) : -1;
                const currentIndex = all.indexOf(item);

                if (lastIndex !== -1 && currentIndex !== -1) {
                    const [start, end] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
                    const shouldActivate = !item.classList.contains('active');
                    all.slice(start, end + 1).forEach((candidate) => {
                        if (candidate.dataset.disabled === 'true' || candidate.classList.contains('container-item-disabled')) {
                            candidate.classList.remove('active');
                            applyPreviewContainerItemStyle(host, candidate, false);
                            return;
                        }
                        candidate.classList.toggle('active', shouldActivate);
                        applyPreviewContainerItemStyle(host, candidate, shouldActivate);
                    });
                } else {
                    deferPinOnTop = true;
                    const shouldActivate = !item.classList.contains('active');
                    item.classList.toggle('active', shouldActivate);
                    applyPreviewContainerItemStyle(host, item, shouldActivate);
                }
            } else if (multiple) {
                const shouldActivate = !item.classList.contains('active');
                item.classList.toggle('active', shouldActivate);
                applyPreviewContainerItemStyle(host, item, shouldActivate);
            } else {
                const wasActive = item.classList.contains('active');
                target.querySelectorAll<HTMLElement>('.container-item.active').forEach((other) => {
                    if (other !== item || (wasActive && !forcedSingle)) {
                        other.classList.remove('active');
                        applyPreviewContainerItemStyle(host, other, false);
                    }
                });
                if (!wasActive) {
                    item.classList.add('active');
                    applyPreviewContainerItemStyle(host, item, true);
                }
            }

            previewLastSelectedContainerItem.set(host, item.classList.contains('active') ? item : null);

            if (deferPinOnTop) {
                host.dataset.deferPinOnTop = 'true';
            } else if ('deferPinOnTop' in host.dataset) {
                delete host.dataset.deferPinOnTop;
            }

            syncPreviewContainerSelection(host, target, core);
            host.dispatchEvent(new Event('change', { bubbles: true }));
            renderutils.applyContainerItemFilter(host);
        });
    });

    syncPreviewContainerSelection(host, target, core);
    renderutils.applyContainerItemFilter(host);
};

const clonePreviewDialog = (input: PreviewDialog): PreviewDialog => {
    try {
        return JSON.parse(JSON.stringify(input));
    } catch {
        return input;
    }
};

const uniqueLocales = (dialog: PreviewDialog): string[] => {
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

const formatLocaleName = (locale: string): string => {
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

const localizePreviewDialog = (input: PreviewDialog, locale: string): PreviewDialog => {
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
                    next.__baseValue = next.value;
                }
                next.value = value;
            }
        }

        const itemText = translateDelimitedItems(baseDict, localeDict, next, next.items);
        if (itemText !== undefined) {
            next.items = itemText;
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

const createDialogTranslator = (dialog: PreviewDialog, locale: string) => {
    const i18n = dialog.i18n;
    const baseLocale = String(i18n?.baseLocale || dialog.properties.language || '').trim();
    const baseDict = (baseLocale && i18n?.locales?.[baseLocale]) || {};
    const localeDict = (locale && i18n?.locales?.[locale]) || baseDict;

    return (key: string, fallback?: string): string => {
        const translationKey = String(key ?? '').trim();
        if (!translationKey) {
            return String(fallback ?? '');
        }
        const translated = localeDict[translationKey] ?? baseDict[translationKey];
        if (translated !== undefined) {
            return translated;
        }
        return fallback !== undefined ? String(fallback) : translationKey;
    };
};

const renderLanguageSwitcher = (root: HTMLElement, dialog: PreviewDialog) => {
    const locales = uniqueLocales(dialog);
    if (locales.length <= 1) {
        return;
    }

    const hoverArea = document.createElement('div');
    hoverArea.className = 'preview-language-hover-area';

    const panel = document.createElement('div');
    panel.className = 'preview-language-panel';

    const select = document.createElement('select');
    select.className = 'preview-language-select';
    select.setAttribute('aria-label', 'Preview language');

    locales.forEach((locale) => {
        const option = document.createElement('option');
        option.value = locale;
        option.textContent = formatLocaleName(locale);
        select.appendChild(option);
    });

    select.value = locales.includes(activePreviewLocale) ? activePreviewLocale : locales[0];
    const applySelectedLocale = () => {
        if (!initialPreviewDialog) {
            return;
        }
        if (activePreviewLocale === select.value) {
            return;
        }
        activePreviewLocale = select.value;
        renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
    };
    select.addEventListener('input', applySelectedLocale);
    select.addEventListener('change', applySelectedLocale);

    panel.appendChild(select);
    hoverArea.appendChild(panel);
    root.appendChild(hoverArea);
};


function resetPreview() {
    if (!initialPreviewDialog) {
        return;
    }
    renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
}

function buildUI(canvas: HTMLElement, dialog: PreviewDialog): PreviewUI {
    const env: PreviewUIEnv = {
        findWrapper: (name: string) => renderutils.findWrapper(name, canvas),
        findRadioGroupMembers: (group: string) => renderutils.findRadioGroupMembers(group, canvas),
        updateElement: (el, props) => renderutils.updateElement(el, props),
        showRuntimeError: (msg: string) => renderutils.showRuntimeError(msg, canvas),
        logToEditor: (msg: string) => coms.sendTo('editorWindow', 'consolog', msg),
        showDialogMessage: (type, message, detail) => coms.sendTo(
            'main',
            'showDialogMessage',
            type,
            message,
            detail
        ),
        callExternal: async (_name: string, _parameters?: unknown) => undefined,
        translate: createDialogTranslator(dialog, activePreviewLocale),
        openSyntaxPanel: (command: string) => coms.sendTo('main', 'openSyntaxPanel', command),
        resetDialog: resetPreview,
        closeDialog: () => coms.sendTo('main', 'close-previewWindow')
    };

    return createPreviewUI(env);
}


function renderPreview(dialog: PreviewDialog) {
    closePreviewContainerSearch(false);
    previewHoveredContainer = null;

    const root = document.getElementById("preview-root");
    if (!root) return;
    const existingPanel = root.querySelector('.preview-syntax-panel') as HTMLElement | null;
    Array.from(root.children).forEach((child) => {
        if (child === existingPanel) {
            return;
        }
        child.remove();
    });

    if (initialPreviewDialog) {
        renderLanguageSwitcher(root, initialPreviewDialog);
    }

    const width = Number(dialog.properties.width) || 640;
    const height = Number(dialog.properties.height) || 480;
    const background = dialog.properties.background || "#ffffff";

    // Keep the viewport tightly aligned to the dialog size to avoid scrollbars on Linux
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;

    // Reflect dialog title in the window/document title for user clarity
    try {
        const title = String((dialog as any)?.properties?.title || (dialog as any)?.properties?.name || 'Preview');
        if (title && typeof title === 'string') {
            document.title = title;
        }
    } catch { /* no-op */ }

    const canvas = document.createElement("div");
    canvas.className = "preview-canvas";
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.backgroundColor = String(background);

    // Align typography with editor
    const fs = Number(dialog.properties.fontSize);
    if (Number.isFinite(fs) && fs > 0) {
        coms.fontSize = fs;
    }

    const created: HTMLElement[] = [];
    // Dispose previous user handlers if any
    window.__userHandlers?.forEach((fn: () => void) => {
        fn();
    });

    window.__userHandlers = [] as Array<() => void>;
    // First pass: render only non-Group elements. Groups are reconstructed after.
    const allElements = Array.from((dialog as any).elements || []) as AnyElement[];
    for (const data of allElements) {
        const t = String((data as any)?.type || '').trim();
        if (t === 'Group') {
            continue; // skip groups in first pass
        }
        // Preserve the saved id from JSON; makeElement mutates data.id to a new uuid
        const savedId = String((data as any)?.id || '');
        const core = renderutils.makeElement({ ...data } as AnyElement);

        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.style.position = 'absolute';

        const desiredId = savedId || String(core.id);
        const desiredType = String(data.type || core.dataset.type || '').trim();
        const desiredNameId = String(data.nameid || core.dataset.nameid || '');

        const left = Number(data.left ?? core.dataset.left ?? 0);
        const top = Number(data.top ?? core.dataset.top ?? 0);

        wrapper.id = desiredId;
        wrapper.style.left = `${left}px`;
        wrapper.style.top = `${top}px`;
        wrapper.dataset.left = String(left);
        wrapper.dataset.top = String(top);
        wrapper.style.width = `${Number((data as any).width ?? core.clientWidth ?? 0)}px`;
        wrapper.style.height = `${Number((data as any).height ?? core.clientHeight ?? 0)}px`;
        if (desiredType) wrapper.dataset.type = desiredType;
        if (desiredNameId) wrapper.dataset.nameid = desiredNameId;

        // Mirror all dataset properties from the inner element onto the wrapper
        // so Preview UI helpers read the same values as in the Editor.
        try {
            const ds = (core as HTMLElement).dataset || {} as DOMStringMap;
            Object.keys(ds).forEach((key) => {
                const val = ds[key as keyof DOMStringMap];
                if (typeof val === 'string') {
                    wrapper.dataset[key] = val;
                }
            });
        } catch { /* no-op */ }

        core.id = `${desiredId}-inner`;
        core.style.left = '0px';
        core.style.top = '0px';
        if (desiredType === 'Button') core.style.position = 'relative';
        if (desiredType === 'Input' && core instanceof HTMLTextAreaElement) {
            core.style.width = '100%';
            core.style.height = '100%';
            core.style.minHeight = '100%';
            core.style.maxHeight = '100%';
        }

        // Ensure child control ids track the restored wrapper id (so helpers that query by id work)
        try {
            if (desiredType === 'Checkbox') {
                const custom = core.querySelector('.custom-checkbox') as HTMLElement | null;
                if (custom) custom.id = `checkbox-${desiredId}`;
            } else if (desiredType === 'Radio') {
                const custom = core.querySelector('.custom-radio') as HTMLElement | null;
                if (custom) custom.id = `radio-${desiredId}`;
            } else if (desiredType === 'Counter') {
                const display = core.querySelector('.counter-value') as HTMLDivElement | null;
                const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
                const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
                if (display) display.id = `counter-value-${desiredId}`;
                if (inc) inc.id = `counter-increase-${desiredId}`;
                if (dec) dec.id = `counter-decrease-${desiredId}`;
            } else if (desiredType === 'Slider') {
                const handle = core.querySelector('.slider-handle') as HTMLDivElement | null;
                if (handle) {
                    handle.id = `slider-handle-${desiredId}`;
                    renderutils.updateHandleStyle(handle, {
                        handleshape: String((data as any).handleshape ?? core.dataset.handleshape ?? 'triangle'),
                        direction: String((data as any).direction ?? core.dataset.direction ?? 'horizontal'),
                        handlesize: String((data as any).handlesize ?? core.dataset.handlesize ?? '8'),
                        handleColor: String((data as any).handleColor ?? core.dataset.handleColor ?? '#558855'),
                        handlepos: String((data as any).handlepos ?? core.dataset.handlepos ?? '50')
                    } as StringNumber);
                }
            }
        } catch {}

        // Remove the drag-protection overlay used in the editor so interactions work in preview
        const cover = core.querySelector('.elementcover');
        if (cover && cover.parentElement) {
            cover.parentElement.removeChild(cover);
        }

        wrapper.appendChild(core);
        canvas.appendChild(wrapper);
        if (core instanceof HTMLTextAreaElement && desiredType === 'Input') {
            requestAnimationFrame(() => renderutils.syncInputOverflow(core));
        }
        created.push(wrapper);

        const element = wrapper;

        // Select: populate options from value (comma/semicolon separated)
        if (desiredType === 'Select') {
            // In our factory, the core element for Select is the <select> itself,
            // not a container with a nested <select>.
            const select = (core instanceof HTMLSelectElement)
                ? core
                : (core.querySelector('select') as HTMLSelectElement | null);
            if (select) {
                const raw = core.dataset.value ?? '';
                const text = String(raw);
                const tokens = text.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
                const localizedRaw = String((data as any).__localizedValue ?? '');
                const localizedTokens = localizedRaw
                    ? localizedRaw.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0)
                    : [];
                select.innerHTML = '';
                if (tokens.length === 0) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = '';
                    select.appendChild(opt);
                } else {
                    tokens.forEach((t, index) => {
                        const opt = document.createElement('option');
                        opt.value = t;
                        opt.textContent = localizedTokens[index] || t;
                        select.appendChild(opt);
                    });
                }
            }
        }

        // Label: normalize sizing/ellipsis by reflowing with updateLabel once in Preview
        if (desiredType === 'Label') {
            try {
                const baseValue = (data as any).__baseValue;
                const align = String((data as any).align || core.dataset.align || '').toLowerCase();
                let anchoredFromBaseValue = false;
                let baseCenterY: number | null = null;
                const translatedValue = core.dataset.value ?? '';
                if (baseValue !== undefined && String(baseValue) !== String(translatedValue)) {
                    core.dataset.value = String(baseValue ?? '');
                    wrapper.dataset.value = String(baseValue ?? '');
                    renderutils.updateLabel(wrapper);
                    const baseTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || '0', 10) || 0));
                    const baseHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
                    if (baseHeight > 0) {
                        baseCenterY = baseTop + (baseHeight / 2);
                    }
                    core.dataset.value = translatedValue;
                    wrapper.dataset.value = translatedValue;
                    anchoredFromBaseValue = align === 'right' || align === 'center' || baseCenterY !== null;
                }
                renderutils.updateLabel(wrapper);
                if (baseCenterY !== null) {
                    const translatedHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
                    if (translatedHeight > 0) {
                        const centeredTop = Math.round(baseCenterY - (translatedHeight / 2));
                        wrapper.style.top = `${centeredTop}px`;
                        wrapper.dataset.top = String(centeredTop);
                    }
                } else if (!anchoredFromBaseValue) {
                    wrapper.style.left = `${left}px`;
                    wrapper.style.top = `${top}px`;
                    wrapper.dataset.left = String(left);
                    wrapper.dataset.top = String(top);
                }
            } catch {}
        }

        // Checkbox: reflect isChecked
        if (desiredType === 'Checkbox') {
            const custom = core.querySelector('.custom-checkbox') as HTMLElement | null;
            if (custom) {
                const checked = utils.isTrue(core.dataset.isChecked);
                custom.setAttribute('aria-checked', String(checked));
                custom.classList.toggle('checked', checked);
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).click();
                    }
                });
            }
        }

        // Radio: reflect isSelected and make it interactive in preview
        if (desiredType === 'Radio') {
            const desiredGroup = String(core.dataset.group || '').trim();
            if (desiredGroup) {
                wrapper.dataset.group = desiredGroup;
            }
            const custom = core.querySelector('.custom-radio') as HTMLElement | null;
            const native = core.querySelector('input[type="radio"]') as HTMLInputElement | null;

            const syncState = (checked: boolean) => {
                const flag = checked ? 'true' : 'false';
                wrapper.dataset.isSelected = flag;
                custom?.setAttribute('aria-checked', flag);
                custom?.classList.toggle('selected', checked);
            };

            const ensureGroupConsistency = () => {
                const group = custom?.getAttribute('group') || native?.name || '';
                if (!group) return;
                document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
                    const node = el as HTMLElement;
                    if (node === custom) return;
                    node.setAttribute('aria-checked', 'false');
                    node.classList.remove('selected');
                    const host = node.closest('.element-wrapper') as HTMLElement | null;
                    if (host) host.dataset.isSelected = 'false';
                });
            };

            const selected = utils.isTrue(core.dataset.isSelected);
            if (native) {
                native.checked = selected;
            }
            syncState(selected);
            ensureGroupConsistency();

            if (custom) {
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        native?.click();
                    }
                });
            }

            if (native) {
                native.addEventListener('change', () => {
                    ensureGroupConsistency();
                    syncState(native.checked);
                });
                native.addEventListener('click', () => {
                    // click already handled by change; no-op to avoid duplicate triggers
                });
            }
        }

        // Counter: wire increase/decrease within [minval, maxval]
        if (desiredType === 'Counter') {
            const display = core.querySelector('.counter-value') as HTMLDivElement | null;
            const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
            const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
            const rawMin = Number(core.dataset.minval ?? core.dataset.startval ?? 0);
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const rawMax = Number(core.dataset.maxval ?? min);
            const max = Number.isFinite(rawMax) ? rawMax : min;

            const getValue = () => Number(display?.textContent ?? min);
            const setValue = (v: number) => { if (display) display.textContent = String(v); };

            inc?.addEventListener('click', () => {
                const curr = getValue();
                if (curr < max) setValue(curr + 1);
            });

            dec?.addEventListener('click', () => {
                const curr = getValue();
                if (curr > min) setValue(curr - 1);
            });
        }

        // Button: prevent text selection and add pressed/click feedback
        if (desiredType === 'Button') {
            const doPress = () => core.classList.add('btn-active');
            const clearPress = () => core.classList.remove('btn-active');
            core.addEventListener('mousedown', doPress);
            core.addEventListener('mouseup', clearPress);
            core.addEventListener('mouseleave', clearPress);
        }

        // Slider: make handle draggable within the track in preview
        if (desiredType === 'Slider') {
            const handle = core.querySelector('.slider-handle') as HTMLDivElement | null;
            if (!handle) continue;

            let dragging = false;
            const direction = (core.dataset.direction || 'horizontal').toLowerCase();

            const onMove = (ev: MouseEvent) => {
                if (!dragging) return;
                const rect = core.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return;
                let percent = 0;
                if (direction === 'vertical') {
                    const relY = ev.clientY - rect.top;
                    const clamped = Math.max(0, Math.min(rect.height, relY));
                    percent = Math.round(100 - (clamped / rect.height) * 100);
                } else {
                    const relX = ev.clientX - rect.left;
                    const clamped = Math.max(0, Math.min(rect.width, relX));
                    percent = Math.round((clamped / rect.width) * 100);
                }
                wrapper.dataset.handlepos = String(percent);
                renderutils.updateHandleStyle(handle, {
                    handleshape: core.dataset.handleshape || 'triangle',
                    direction: core.dataset.direction || 'horizontal',
                    handlesize: core.dataset.handlesize || '8',
                    handleColor: core.dataset.handleColor || '#558855',
                    handlepos: String(percent)
                } as StringNumber);
            };

            const onUp = () => {
                dragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            handle.addEventListener('mousedown', (ev: MouseEvent) => {
                if (core.classList.contains('disabled-div') || !utils.isTrue(data.isEnabled)) return;
                dragging = true;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                ev.preventDefault();
            });
        }

        // Container: enable preview-time single/multi selection, including Shift range selection.
        if (desiredType === 'Container') {
            attachPreviewContainerHandlers(wrapper, core);
        }

        // Visibility / Enabled
        if (!utils.isTrue(data.isVisible)) {
            wrapper.style.display = 'none';
        }

        if (!utils.isTrue(data.isEnabled)) {
            renderutils.updateElement(wrapper, { isEnabled: 'false' });
        }
    }

    // Recreate persistent groups after individual elements exist in the DOM
    try {
        const groups = (allElements || []).filter((e: any) => String(e?.type || '').trim() === 'Group');
        for (const g of groups) {
            const elementIds: string[] = Array.isArray((g as any).elementIds)
                ? (g as any).elementIds
                : String((g as any).elementIds || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s.length > 0);

            if (!elementIds.length) continue;

            const gl = Number((g as any).left ?? 0);
            const gt = Number((g as any).top ?? 0);
            const gid = String((g as any).id || `group-${Date.now()}-${Math.random().toString(36).slice(2)}`);
            const gname = String((g as any).nameid || '').trim();

            const group = document.createElement('div');
            group.id = gid;
            group.className = 'element-group';
            group.style.position = 'absolute';
            group.style.left = `${gl}px`;
            group.style.top = `${gt}px`;
            group.dataset.type = 'Group';
            if (gname) group.dataset.nameid = gname;
            group.dataset.left = String(gl);
            group.dataset.top = String(gt);

            // Move each child under the group container; convert to relative positions
            let moved = 0;
            elementIds.forEach(cid => {
                // Look up within the unattached canvas subtree
                let child = canvas.querySelector(`[id="${cid}"]`) as HTMLElement | null;
                if (!child) {
                    const inner = canvas.querySelector(`[id="${cid}-inner"]`) as HTMLElement | null;
                    if (inner) child = inner.closest('.element-wrapper') as HTMLElement | null;
                }
                if (!child) return;
                const absLeft = Number(child.dataset.left ?? (parseInt(child.style.left || '0', 10) || 0));
                const absTop = Number(child.dataset.top ?? (parseInt(child.style.top || '0', 10) || 0));
                const relLeft = absLeft - gl;
                const relTop = absTop - gt;
                child.style.left = `${relLeft}px`;
                child.style.top = `${relTop}px`;
                child.dataset.left = String(relLeft);
                child.dataset.top = String(relTop);
                group.appendChild(child);
                moved++;
            });

            // Optionally compute group size to wrap children
            try {
                const bounds = renderutils.computeBounds(elementIds);
                if (bounds) {
                    group.style.width = `${bounds.width}px`;
                    group.style.height = `${bounds.height}px`;
                }
            } catch { /* ignore sizing issues */ }

            canvas.appendChild(group);
        }
    } catch { /* ignore group reconstruction errors */ }

    // Note: customJS runs later (post-render block below)

    // Conditions window and engine removed: interactions now only update datasets and fire change events.
    // Hook changes on interactive elements to fire change notifications for custom JS
    created.forEach(el => {
        const type = String(el.dataset?.type || '').toLowerCase();
        if (type === 'checkbox') {
            const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
            custom?.addEventListener('click', () => {
                const now = custom?.getAttribute('aria-checked') === 'true';
                el.dataset.isChecked = String(now);
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
        } else if (type === 'radio') {
            const native = el.querySelector('input[type="radio"]') as HTMLInputElement | null;
            if (native) {
                native.addEventListener('change', () => {
                    el.dataset.isSelected = String(native.checked);
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        } else if (type === 'select') {
            if (el instanceof HTMLSelectElement) {
                el.addEventListener('change', () => {
                    el.dataset.value = String(el.value || '');
                });
            } else {
                const sel = el.querySelector('select') as HTMLSelectElement | null;
                sel?.addEventListener('change', () => {
                    el.dataset.value = String(sel.value || '');
                });
            }
        } else if (type === 'input') {
            const input = el.querySelector('textarea') as HTMLTextAreaElement | null;
            if (input) {
                const normalizeValue = () => input.value.replace(/\r?\n+/g, ' ');
                let focusValue = input.value;

                input.addEventListener('focus', () => {
                    focusValue = normalizeValue();
                });

                input.addEventListener('input', () => {
                    const normalized = normalizeValue();
                    if (normalized !== input.value) {
                        input.value = normalized;
                    }
                    el.dataset.value = normalized;
                    renderutils.syncInputOverflow(input);
                });

                input.addEventListener('change', () => {
                    const normalized = normalizeValue();
                    if (normalized !== input.value) {
                        input.value = normalized;
                    }
                    el.dataset.value = normalized;
                    focusValue = normalized;
                    renderutils.syncInputOverflow(input);
                });

                input.addEventListener('keydown', (ev: KeyboardEvent) => {
                    if (ev.key !== 'Enter' || ev.isComposing) {
                        return;
                    }

                    ev.preventDefault();
                    ev.stopPropagation();

                    const normalized = normalizeValue();
                    if (normalized !== input.value) {
                        input.value = normalized;
                    }
                    el.dataset.value = normalized;
                    focusValue = normalized;
                    renderutils.syncInputOverflow(input);
                    input.blur();
                });
            }
        } else if (type === 'counter') {
            const display = document.querySelector(`#counter-value-${el.id}`) as HTMLDivElement | null;
            const inc = document.querySelector(`#counter-increase-${el.id}`) as HTMLDivElement | null;
            const dec = document.querySelector(`#counter-decrease-${el.id}`) as HTMLDivElement | null;
            const sync = () => {
                el.dataset.startval = String(Number(display?.textContent || el.dataset.startval || 0));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            };
            inc?.addEventListener('click', sync);
            dec?.addEventListener('click', sync);
        } else if (type === 'slider') {
            const handle = el.querySelector('.slider-handle') as HTMLDivElement | null;
            const onUp = () => {
                el.dataset.handlepos = String(el.dataset.handlepos || '50');
            };
            handle?.addEventListener('mouseup', onUp);
        }
    });

    document.addEventListener('keydown', (ev: KeyboardEvent) => {
        const key = ev.key || ev.code;
        const lowerKey = String(key || '').toLowerCase();
        if ((ev.metaKey || ev.ctrlKey) && lowerKey === 'f') {
            ev.preventDefault();
            ev.stopPropagation();
            if (previewHoveredContainer) {
                openPreviewContainerSearch(previewHoveredContainer);
                return;
            }
            if (previewSearchContainer) {
                openPreviewContainerSearch(previewSearchContainer);
            }
            return;
        }

        if (key === 'Escape' || key === 'Esc') {
            if (previewSearchContainer) {
                closePreviewContainerSearch(true);
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }

            // Dismiss color pickers
            Array.from(document.querySelectorAll('.color-popover')).forEach((el) => {
                (el as HTMLElement).style.display = 'none';
            });

            // If a runtime/customJS error overlay is visible, remove it and stay in Preview
            const overlay = document.querySelector('.preview-canvas .customjs-error') as HTMLDivElement | null;
            if (overlay && overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }

            // Otherwise, close the Preview window
            coms.sendTo('main', 'close-previewWindow');

            ev.preventDefault();
            ev.stopPropagation();
        }
    }, true);

    // Attach canvas to DOM before executing custom code, so style/computedStyle work reliably
    if (existingPanel) {
        root.insertBefore(canvas, existingPanel);
    } else {
        root.appendChild(canvas);
    }

    canvas.querySelectorAll<HTMLElement>('.element-wrapper[data-type="Label"]').forEach((wrapper) => {
        const baseValue = wrapper.dataset.__baseValue;
        const translatedValue = wrapper.dataset.value ?? '';
        if (baseValue === undefined || String(baseValue) === String(translatedValue)) {
            return;
        }

        const core = wrapper.firstElementChild as HTMLElement | null;
        if (!core) {
            return;
        }

        const originalLeft = Number(wrapper.dataset.left ?? (parseInt(wrapper.style.left || '0', 10) || 0));
        const originalTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || '0', 10) || 0));

        core.dataset.value = String(baseValue ?? '');
        wrapper.dataset.value = String(baseValue ?? '');
        renderutils.updateLabel(wrapper);
        const baseTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || '0', 10) || 0));
        const baseHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);

        core.dataset.value = translatedValue;
        wrapper.dataset.value = translatedValue;
        renderutils.updateLabel(wrapper);

        const translatedHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
        if (baseHeight > 0 && translatedHeight > 0) {
            const centeredTop = Math.round(baseTop + (baseHeight / 2) - (translatedHeight / 2));
            wrapper.style.top = `${centeredTop}px`;
            wrapper.dataset.top = String(centeredTop);
            return;
        }

        wrapper.style.left = `${originalLeft}px`;
        wrapper.style.top = `${originalTop}px`;
        wrapper.dataset.left = String(originalLeft);
        wrapper.dataset.top = String(originalTop);
    });

    // Execute custom code after elements (and groups) are in the DOM
    try {
        const rawTop = (dialog as any)?.customJS;
        const code = String(typeof rawTop === 'string' && rawTop.length ? rawTop : '');
        // coms.sendTo('editorWindow', 'consolog', `Preview: customJS detected (${code.trim().length} chars, post-render)`);
        if (code && code.trim().length) {
            const ui = buildUI(canvas, dialog);
            renderutils.exposeNameGlobals(canvas);
            renderutils.exposeEventNameGlobals();

            const exports: PreviewScriptExports = {};
            const preludeList = API_NAMES.join(', ');

            // Build safe local bindings for element name IDs and radio groups, so
            // bare identifiers in customJS (e.g., getValue(datasets)) are always
            // defined in the function scope regardless of existing window globals.
            const elementsWithName = Array.from(canvas.querySelectorAll<HTMLElement>('[data-nameid]'));
            const nameIds = Array.from(new Set(
                elementsWithName
                    .map(el => String(el.dataset?.nameid || '').trim())
                    .filter(n => n && utils.isIdentifier(n))
            ));

            const groupNamesSet = new Set<string>();
            const customRadios = Array.from(canvas.querySelectorAll<HTMLElement>('.custom-radio[group]'));
            customRadios.forEach(node => {
                const g = (node.getAttribute('group') || '').trim();
                if (g) groupNamesSet.add(g);
            });
            const wrappers = Array.from(canvas.querySelectorAll<HTMLElement>('.element-wrapper[data-group]'));
            wrappers.forEach(w => {
                const t = String(w.dataset?.type || '').trim();
                if (t !== 'Radio') return;
                const g = (w.dataset.group || '').trim();
                if (g) groupNamesSet.add(g);
            });

            const groupNames = Array.from(groupNamesSet).filter(n => n && utils.isIdentifier(n));

            const allBareNames = Array.from(new Set([...nameIds, ...groupNames]));
            // try {
            //     coms.sendTo('editorWindow', 'consolog', `Preview: bare identifiers available -> ${allBareNames.join(', ')}`);
            // } catch { /* ignore */ }

            // Note: base-name aliasing (e.g., mapping datasets -> 'datasets1')
            // can collide with user-declared variables and cause TDZ errors.
            // To keep customJS predictable, we only expose the exact name IDs
            // present in the dialog.

            const namePrelude = allBareNames
                .map(n => `const ${n} = ${JSON.stringify(n)};`)
                .join('\n');

            const bindings = `const { ${preludeList} } = ui;\nconst log = ui.log.bind(ui);\n${namePrelude}`;
            let fn: Function | null = null;
            try {
                fn = new Function('ui', 'exports', bindings + '\n' + code);
            } catch (e: any) {
                const msg = `Code syntax error: ${String(e && e.message ? e.message : e)}`;
                coms.sendTo('editorWindow', 'consolog', msg);
            }

            if (fn) {
                try {
                    fn(ui, exports);
                    // coms.sendTo('editorWindow', 'consolog', 'Preview: customJS executed after render.');
                } catch (e: any) {
                    const msg = `Action code runtime error: ${String(e && e.message ? e.message : e)}`;
                    const overlay = document.createElement('div');
                    overlay.className = 'customjs-error';
                    overlay.textContent = msg;
                    canvas.appendChild(overlay);
                }
            }

            if (fn && typeof exports.init === 'function') {
                try { exports.init(ui); } catch {}
            }

            window.__userHandlers!.push(() => {
                try { if (typeof exports.dispose === 'function') exports.dispose(ui); } finally { ui.__disposeAll?.(); }
            });
        } else {
            coms.sendTo('editorWindow', 'consolog', 'Preview: no customJS to execute (post-render).');
        }
    } catch {}
}

// Hot-reload linked CSS stylesheets in the Preview window
coms.on('reload-css', () => {
    try {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        const ts = Date.now();
        links.forEach((link) => {
            try {
                const base = link.href.split('?')[0];
                link.href = `${base}?v=${ts}`;
            } catch { /* ignore per-link errors */ }
        });
    } catch { /* ignore */ }
});


// Render a snapshot of the dialog using the exact same element factory as the editor
window.addEventListener("DOMContentLoaded", () => {
    coms.on("renderPreview", (data: unknown) => {
        try {
            const payload = typeof data === "string" ? JSON.parse(data as string) : data;
            initialPreviewDialog = clonePreviewDialog(payload as PreviewDialog);
            const locales = uniqueLocales(initialPreviewDialog);
            activePreviewLocale = locales.includes(String(initialPreviewDialog.properties.language ?? ''))
                ? String(initialPreviewDialog.properties.language ?? '')
                : (locales[0] || '');
            renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
        } catch (e) {
            coms.sendTo(
                'editorWindow',
                'consolog',
                `Failed to parse preview data: ${String(utils.isRecord(e) && e.message ? e.message : e)}`
            );
        }
    });
});
