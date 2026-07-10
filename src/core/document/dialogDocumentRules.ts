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

export function validateDialogJsonForSave(json: string): void {
    dialogNameFromJson(json);
}

export function defaultDialogPackageFileName(json?: string): string {
    const dialogName = json ? dialogNameFromJson(json) : '';
    return `${dialogName || 'dialog'}.dc.zip`;
}
