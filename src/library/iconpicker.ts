import { renderutils } from "./renderutils";

type IconPickerMode = 'editor' | 'defaults';

type CodiconMeta = {
    tags?: string[];
    category?: string;
    description?: string;
};

type CodiconEntry = {
    name: string;
    tags: string[];
    category: string;
    description: string;
};

type IconPickerOptions = {
    mode: IconPickerMode;
};

const COMMON_ICONS = [
    'arrow-left',
    'arrow-right',
    'arrow-up',
    'arrow-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevron-down',
    'triangle-left',
    'triangle-right',
    'triangle-up',
    'triangle-down',
    'add',
    'dash',
    'close',
    'check',
    'warning',
    'info',
    'play',
    'stop-circle',
    'search',
    'settings-gear',
    'home',
    'trash',
    'edit',
    'folder',
    'file'
];

let metadataPromise: Promise<CodiconEntry[]> | null = null;

const normalizeIconValue = (value: string): string => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw || raw === 'none') return 'none';
    if (raw === 'minus' || raw === 'remove') return 'dash';
    if (raw === 'x') return 'close';
    return raw;
};

const loadCodiconMetadata = async (): Promise<CodiconEntry[]> => {
    if (metadataPromise) return metadataPromise;
    metadataPromise = fetch('../assets/codicons/metadata.json')
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Failed to load codicon metadata: ${response.status}`);
            }
            const raw = await response.json() as Record<string, CodiconMeta>;
            return Object.entries(raw).map(([name, meta]) => ({
                name,
                tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
                category: String(meta.category || ''),
                description: String(meta.description || '')
            })).sort((a, b) => a.name.localeCompare(b.name));
        })
        .catch((error) => {
            console.error(error);
            return [];
        });
    return metadataPromise;
};

const updateIconPreview = (input: HTMLInputElement | null): void => {
    if (!input) return;
    const control = input.closest('.icon-property-control') as HTMLElement | null;
    if (!control) return;
    const icon = normalizeIconValue(input.value);
    input.value = icon;
};

const commitIconValue = (input: HTMLInputElement, value: string, mode: IconPickerMode): void => {
    input.value = value;
    updateIconPreview(input);
    if (mode === 'editor') {
        input.dispatchEvent(new FocusEvent('blur'));
    } else {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

const createIconCard = (entry: CodiconEntry, activeName: string, onSelect: (value: string) => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-picker__item';
    button.dataset.iconName = entry.name;
    button.title = entry.description || entry.name;
    if (entry.name === activeName) {
        button.classList.add('is-active');
    }

    const glyph = document.createElement('span');
    glyph.className = `icon-picker__glyph codicon codicon-${entry.name}`;
    glyph.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'icon-picker__label';
    label.textContent = entry.name;

    button.appendChild(glyph);
    button.appendChild(label);
    button.addEventListener('click', () => onSelect(entry.name));
    return button;
};

const ensurePickerShell = (): HTMLDivElement => {
    let shell = document.getElementById('iconPickerModal') as HTMLDivElement | null;
    if (shell) return shell;

    shell = document.createElement('div');
    shell.id = 'iconPickerModal';
    shell.className = 'icon-picker-modal hidden';
    shell.innerHTML = `
        <div class="icon-picker-modal__backdrop" data-action="close"></div>
        <div class="icon-picker-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="iconPickerTitle">
            <div class="icon-picker-modal__header">
                <div>
                    <h2 id="iconPickerTitle">Choose Icon</h2>
                    <p>Search Codicons and pick one for the selected element.</p>
                </div>
                <button type="button" class="icon-picker-modal__action custombutton" data-action="close">Close</button>
            </div>
            <div class="icon-picker-modal__controls">
                <input type="text" id="iconPickerSearch" placeholder="Search icons" aria-label="Search icons" />
                <button type="button" class="icon-picker-modal__action custombutton" id="iconPickerClear">None</button>
            </div>
            <div class="icon-picker-modal__body">
                <section class="icon-picker-section" id="iconPickerCommonSection">
                    <h3>Common</h3>
                    <div class="icon-picker-grid" id="iconPickerCommonGrid"></div>
                </section>
                <section class="icon-picker-section">
                    <h3>All Icons</h3>
                    <div class="icon-picker-grid" id="iconPickerAllGrid"></div>
                </section>
            </div>
        </div>
    `;
    document.body.appendChild(shell);
    renderutils.enhanceButtons(shell);
    return shell;
};

const filterEntries = (entries: CodiconEntry[], query: string): CodiconEntry[] => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
        return entry.name.includes(q)
            || entry.category.toLowerCase().includes(q)
            || entry.description.toLowerCase().includes(q)
            || entry.tags.some(tag => tag.toLowerCase().includes(q));
    });
};

const renderPicker = (
    shell: HTMLDivElement,
    entries: CodiconEntry[],
    activeValue: string,
    onSelect: (value: string) => void,
    query = ''
): void => {
    const commonGrid = shell.querySelector('#iconPickerCommonGrid') as HTMLDivElement;
    const allGrid = shell.querySelector('#iconPickerAllGrid') as HTMLDivElement;
    const commonSection = shell.querySelector('#iconPickerCommonSection') as HTMLElement;

    const filtered = filterEntries(entries, query);
    const commonSet = new Set(COMMON_ICONS.map(normalizeIconValue));
    const commonEntries = filtered.filter(entry => commonSet.has(entry.name));
    const allEntries = filtered.filter(entry => !commonSet.has(entry.name));

    commonGrid.innerHTML = '';
    allGrid.innerHTML = '';
    commonSection.style.display = commonEntries.length ? '' : 'none';

    commonEntries.forEach((entry) => commonGrid.appendChild(createIconCard(entry, activeValue, onSelect)));
    allEntries.forEach((entry) => allGrid.appendChild(createIconCard(entry, activeValue, onSelect)));
};

const openPicker = async (input: HTMLInputElement, mode: IconPickerMode): Promise<void> => {
    const shell = ensurePickerShell();
    const search = shell.querySelector('#iconPickerSearch') as HTMLInputElement;
    const clear = shell.querySelector('#iconPickerClear') as HTMLButtonElement;
    const closeButtons = shell.querySelectorAll<HTMLElement>('[data-action="close"]');
    const entries = await loadCodiconMetadata();
    const active = normalizeIconValue(input.value);

    const close = (): void => {
        shell.classList.add('hidden');
        document.removeEventListener('keydown', handleEscape);
    };

    const select = (value: string): void => {
        commitIconValue(input, value, mode);
        close();
    };

    const rerender = (): void => {
        renderPicker(shell, entries, active, select, search.value);
    };

    const handleEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            close();
        }
    };

    search.value = '';
    rerender();

    clear.onclick = () => select('none');
    closeButtons.forEach((btn) => {
        btn.onclick = () => close();
    });
    search.oninput = () => {
        renderPicker(shell, entries, active, select, search.value);
    };

    shell.classList.remove('hidden');
    search.focus();
    document.addEventListener('keydown', handleEscape);
};

export function attachIconPickers(options: IconPickerOptions, root?: ParentNode): void {
    const scope = root || document;
    const input = scope.querySelector('#elicon') as HTMLInputElement | null;
    const trigger = scope.querySelector('#iconPickerChoose') as HTMLButtonElement | null;
    if (!input || !trigger || input.dataset.hasIconPicker === 'true') return;

    input.dataset.hasIconPicker = 'true';
    input.readOnly = true;
    trigger.addEventListener('click', () => {
        if (trigger.disabled || input.disabled) return;
        void openPicker(input, options.mode);
    });
    updateIconPreview(input);
}

export function syncIconPickers(root?: ParentNode): void {
    const scope = root || document;
    scope.querySelectorAll<HTMLInputElement>('#elicon').forEach((input) => updateIconPreview(input));
}
