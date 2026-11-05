export type ElementAnchorSide = 'left' | 'right' | 'above' | 'below';
export type ElementAnchorAlignment = 'start' | 'middle' | 'end';

export type ElementAnchorProperties = {
    anchorTarget?: string;
    anchorPosition?: ElementAnchorSide;
    anchorGap?: number;
    anchorAlign?: ElementAnchorAlignment;
    anchorOffset?: number;
};

export const ELEMENT_ANCHOR_PROPERTY_TYPES = {
    anchorTarget: 'string',
    anchorPosition: 'string',
    anchorGap: 'number',
    anchorAlign: 'string',
    anchorOffset: 'number'
} as const satisfies Readonly<Record<keyof ElementAnchorProperties, 'string' | 'number'>>;

export interface ElementAnchor {
    target: string;
    position: ElementAnchorSide;
    gap: number;
    align: ElementAnchorAlignment;
    offset: number;
}

export interface ElementAnchorElement {
    id: string;
    type: string;
    parentId?: string;
    name?: string;
    anchor?: ElementAnchor | null;
    anchorError?: string;
}

export interface ElementAnchorIssue {
    elementId: string;
    message: string;
}

export interface ElementAnchorPlan {
    order: string[];
    issues: ElementAnchorIssue[];
}

export interface ElementAnchorPosition {
    left: number;
    top: number;
}

export interface ElementAnchorRect extends ElementAnchorPosition {
    width: number;
    height: number;
}

function readElementAnchorDistance(
    value: unknown,
    property: string,
    fallback: number
): number {
    if (value === undefined) {
        return fallback;
    }

    if (
        typeof value !== 'number'
        && (typeof value !== 'string' || value.trim() === '')
    ) {
        throw new Error(`Element anchor ${property} must be a finite number.`);
    }

    const distance = Number(value);
    if (!Number.isFinite(distance)) {
        throw new Error(`Element anchor ${property} must be a finite number.`);
    }

    return distance;
}

export function readElementAnchor(
    record: Readonly<Record<string, unknown>>
): ElementAnchor | null {
    if (record.anchorTarget === undefined || record.anchorTarget === '') {
        return null;
    }

    if (typeof record.anchorTarget !== 'string') {
        throw new Error('Element anchor target must be an element id.');
    }

    const target = record.anchorTarget.trim();
    if (!target) {
        return null;
    }

    const requestedPosition = record.anchorPosition === undefined
        ? 'left'
        : record.anchorPosition;
    if (typeof requestedPosition !== 'string') {
        throw new Error('Element anchor position must be left, right, above, or below.');
    }

    const position = requestedPosition.trim().toLowerCase();
    if (
        position !== 'left'
        && position !== 'right'
        && position !== 'above'
        && position !== 'below'
    ) {
        throw new Error('Element anchor position must be left, right, above, or below.');
    }

    const requestedAlignment = record.anchorAlign === undefined
        ? 'middle'
        : record.anchorAlign;
    if (typeof requestedAlignment !== 'string') {
        throw new Error('Element anchor alignment must be start, middle, or end.');
    }

    const align = requestedAlignment.trim().toLowerCase();
    if (align !== 'start' && align !== 'middle' && align !== 'end') {
        throw new Error('Element anchor alignment must be start, middle, or end.');
    }

    return {
        target,
        position,
        gap: readElementAnchorDistance(record.anchorGap, 'gap', 10),
        align,
        offset: readElementAnchorDistance(record.anchorOffset, 'offset', 0)
    };
}

function elementAnchorName(element: ElementAnchorElement): string {
    return element.name?.trim() || element.id;
}

function readPlannedElementAnchor(anchor: ElementAnchor): ElementAnchor {
    if (!anchor || typeof anchor !== 'object' || Array.isArray(anchor)) {
        throw new Error('Element anchor metadata must describe an attachment.');
    }

    const parsed = readElementAnchor({
        anchorTarget: anchor.target,
        anchorPosition: anchor.position,
        anchorGap: anchor.gap,
        anchorAlign: anchor.align,
        anchorOffset: anchor.offset
    });
    if (!parsed) {
        throw new Error('Element anchor target must be an element id.');
    }

    return parsed;
}

function validateElementAnchorRelationship(
    element: ElementAnchorElement,
    anchor: ElementAnchor,
    elements: readonly ElementAnchorElement[]
): void {
    if (!element.id.trim()) {
        throw new Error('An attached element must have an id.');
    }

    const sourceType = element.type.trim().toLowerCase();
    if (!sourceType || sourceType === 'group') {
        throw new Error('Only non-group elements can use relative positioning.');
    }

    if (element.id === anchor.target) {
        const name = elementAnchorName(element);
        throw new Error(`Attachment cycle: ${name} → ${name}. An element cannot be attached to itself.`);
    }

    const target = elements.find((element) => element.id === anchor.target);
    if (!target) {
        throw new Error(`Element anchor target "${anchor.target}" was not found.`);
    }

    const targetType = target.type.trim().toLowerCase();
    if (!targetType || targetType === 'group') {
        throw new Error('Element anchor targets must be non-group elements.');
    }

    const elementParent = (element.parentId || '').trim();
    const targetParent = (target.parentId || '').trim();
    if (elementParent !== targetParent) {
        throw new Error('The element and its anchor target must be in the same group or both on the canvas.');
    }
}

export function planElementAnchors(elements: readonly ElementAnchorElement[]): ElementAnchorPlan {
    const byId = new Map<string, ElementAnchorElement>();
    const anchors = new Map<string, ElementAnchor>();
    const errors = new Map<string, string>();
    const states = new Map<string, 'visiting' | 'complete'>();
    const path: string[] = [];
    const order: string[] = [];

    for (const element of elements) {
        if (byId.has(element.id)) {
            errors.set(element.id, `Element id "${element.id}" is not unique.`);
        } else {
            byId.set(element.id, element);
        }
        if (element.anchorError?.trim()) {
            errors.set(element.id, element.anchorError);
        }
    }

    for (const element of byId.values()) {
        if (element.anchor === undefined || element.anchor === null) {
            continue;
        }

        try {
            const anchor = readPlannedElementAnchor(element.anchor);
            anchors.set(element.id, anchor);
            validateElementAnchorRelationship(element, anchor, elements);
        } catch (error) {
            if (!errors.has(element.id)) {
                errors.set(element.id, error instanceof Error ? error.message : String(error));
            }
        }
    }

    function visit(id: string): boolean {
        const state = states.get(id);
        if (state === 'complete') {
            return !errors.has(id);
        }
        if (state === 'visiting') {
            const cycle = path.slice(path.indexOf(id));
            const names = [...cycle, id].map((member) => elementAnchorName(byId.get(member)!));
            const message = `Attachment cycle: ${names.join(' → ')}.`;
            for (const member of cycle) {
                errors.set(member, message);
            }
            return false;
        }

        states.set(id, 'visiting');
        path.push(id);
        const anchor = anchors.get(id);
        if (!errors.has(id) && anchor && !visit(anchor.target)) {
            if (!errors.has(id)) {
                const target = byId.get(anchor.target)!;
                errors.set(id, `Cannot attach to "${elementAnchorName(target)}": its attachment is invalid.`);
            }
        }
        path.pop();
        states.set(id, 'complete');

        if (errors.has(id)) {
            return false;
        }
        if (anchor) {
            order.push(id);
        }
        return true;
    }

    for (const id of byId.keys()) {
        visit(id);
    }

    const issues = Array.from(errors, ([elementId, message]) => ({ elementId, message }));
    return { order, issues };
}

export function validateElementAnchor(
    element: ElementAnchorElement,
    anchor: ElementAnchor,
    elements: readonly ElementAnchorElement[]
): void {
    const proposed = readPlannedElementAnchor(anchor);
    validateElementAnchorRelationship(element, proposed, elements);
    const replacement = { ...element, anchor: proposed, anchorError: undefined };
    let found = false;
    const graph = elements.map((candidate) => {
        if (candidate.id !== element.id) {
            return candidate;
        }
        found = true;
        return replacement;
    });
    if (!found) {
        graph.push(replacement);
    }

    const issue = planElementAnchors(graph).issues.find((candidate) => candidate.elementId === element.id);
    if (issue) {
        throw new Error(issue.message);
    }
}

function validateElementAnchorRect(rect: ElementAnchorRect, name: string): void {
    if (
        ![rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
        || rect.width < 0
        || rect.height < 0
    ) {
        throw new Error(`${name} bounds must be finite, with non-negative width and height.`);
    }
}

export function resolveElementAnchorPosition(
    element: ElementAnchorRect,
    target: ElementAnchorRect,
    anchor: ElementAnchor
): ElementAnchorPosition {
    validateElementAnchorRect(element, 'Element');
    validateElementAnchorRect(target, 'Anchor target');
    if (!Number.isFinite(anchor.gap) || !Number.isFinite(anchor.offset)) {
        throw new Error('Element anchor gap and offset must be finite numbers.');
    }

    let fraction = 0;
    if (anchor.align === 'middle') {
        fraction = 0.5;
    } else if (anchor.align === 'end') {
        fraction = 1;
    } else if (anchor.align !== 'start') {
        throw new Error('Element anchor alignment must be start, middle, or end.');
    }

    let left: number;
    let top: number;
    if (anchor.position === 'left' || anchor.position === 'right') {
        left = anchor.position === 'left'
            ? target.left - anchor.gap - element.width
            : target.left + target.width + anchor.gap;
        top = target.top + (target.height - element.height) * fraction + anchor.offset;
    } else if (anchor.position === 'above' || anchor.position === 'below') {
        left = target.left + (target.width - element.width) * fraction + anchor.offset;
        top = anchor.position === 'above'
            ? target.top - anchor.gap - element.height
            : target.top + target.height + anchor.gap;
    } else {
        throw new Error('Element anchor position must be left, right, above, or below.');
    }

    if (!Number.isFinite(left) || !Number.isFinite(top)) {
        throw new Error('The resolved element anchor position must be finite.');
    }

    return { left, top };
}
