import { readElementAnchor, planElementAnchors } from '../layout/elementAnchoring';

const DIALOG_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function parseDialogJsonForSave(json: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Dialog JSON must contain an object.');
        }

        return parsed as Record<string, unknown>;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Dialog JSON is invalid: ${message}`);
    }
}

export function dialogNameFromJson(json: string): string {
    const parsed = parseDialogJsonForSave(json);
    const properties = parsed.properties;

    if (!properties || typeof properties !== 'object') {
        throw new Error('Dialog properties are missing.');
    }

    const name = String((properties as Record<string, unknown>).name || '').trim();
    if (!DIALOG_NAME_PATTERN.test(name)) {
        throw new Error(
            'Dialog name must be one word using only letters, numbers, and underscores, and it cannot start with a number.'
        );
    }

    return name;
}

function dialogAnchorElements(dialog: Readonly<Record<string, unknown>>): Record<string, unknown>[] {
    return Array.isArray(dialog.elements)
        ? dialog.elements.filter((element): element is Record<string, unknown> => {
            return Boolean(element) && typeof element === 'object' && !Array.isArray(element);
        })
        : [];
}

export function validateDialogElementAnchorMetadata(dialog: Readonly<Record<string, unknown>>): void {
    for (const element of dialogAnchorElements(dialog)) {
        try {
            const anchor = readElementAnchor(element);
            const type = String(element.type || '').trim().toLowerCase();
            if (anchor && (!type || type === 'group')) {
                throw new Error('Only non-group elements can use relative positioning.');
            }
        } catch (error) {
            const name = String(element.nameid || element.id || 'Element');
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`${name}: ${message}`);
        }
    }
}

export function validateDialogJsonForSave(json: string): void {
    dialogNameFromJson(json);

    const parsed = parseDialogJsonForSave(json);
    validateDialogElementAnchorMetadata(parsed);
    const elements = dialogAnchorElements(parsed);
    const parents = new Map<string, string>();
    for (const element of elements) {
        if (String(element.type || '').trim().toLowerCase() !== 'group') {
            continue;
        }
        const members = Array.isArray(element.elementIds)
            ? element.elementIds : String(element.elementIds || '').split(',');
        for (const member of members) {
            parents.set(String(member).trim(), String(element.id || ''));
        }
    }
    const descriptions = elements.map((element) => ({
        id: String(element.id || ''),
        type: String(element.type || ''),
        name: String(element.nameid || element.id || 'Element'),
        parentId: parents.get(String(element.id || '')) || '',
        anchor: readElementAnchor(element)
    }));

    const plan = planElementAnchors(descriptions);
    if (plan.issues.length) {
        const errors = plan.issues.map((issue) => {
            const element = descriptions.find((candidate) => candidate.id === issue.elementId);
            return `${element?.name || issue.elementId}: ${issue.message}`;
        });
        throw new Error(errors.join('\n'));
    }
}

export function defaultDialogPackageFileName(json?: string): string {
    const dialogName = json ? dialogNameFromJson(json) : '';
    return `${dialogName || 'dialog'}.dc.zip`;
}
