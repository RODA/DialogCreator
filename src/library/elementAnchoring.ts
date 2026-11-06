import {
    readElementAnchor,
    planElementAnchors,
    resolveElementAnchorPosition,
    validateElementAnchor,
    type ElementAnchorElement,
    type ElementAnchorRect
} from '../core/layout/elementAnchoring';

export interface ElementAnchorIssue {
    elementId: string;
    message: string;
}

interface ElementAnchorController {
    refresh(): ElementAnchorIssue[];
    schedule(): void;
    dispose(): void;
}

const controllers = new WeakMap<HTMLElement, ElementAnchorController>();
const lastBounds = new WeakMap<HTMLElement, ElementAnchorRect>();
const anchorErrors = new WeakMap<HTMLElement, string>();

export function hasElementAnchor(element: HTMLElement): boolean {
    return element.dataset.type?.trim().toLowerCase() !== 'group'
        && !element.classList.contains('element-group')
        && Boolean(element.dataset.anchorTarget?.trim());
}

export function getElementAnchorError(element: HTMLElement): string {
    return anchorErrors.get(element) || '';
}

function anchoringElements(canvas: HTMLElement): HTMLElement[] {
    return Array.from(canvas.querySelectorAll<HTMLElement>(
        '.element-wrapper, .element-group'
    ));
}

function anchorElement(element: HTMLElement, canvas: HTMLElement): ElementAnchorElement {
    const description: ElementAnchorElement = {
        id: element.id,
        type: element.dataset.type || '',
        name: element.dataset.nameid || element.id,
        parentId: element.parentElement === canvas ? '' : element.parentElement?.id
    };
    try {
        description.anchor = readElementAnchor(element.dataset);
    } catch (reason) {
        description.anchorError = reason instanceof Error ? reason.message : String(reason);
    }
    return description;
}

function readCoordinate(style: string, fallback: number): number {
    const value = parseFloat(style);
    return Number.isFinite(value) ? value : fallback;
}

function measureElementAnchorElement(element: HTMLElement): DOMRect {
    if (element.getClientRects().length) {
        return element.getBoundingClientRect();
    }

    // Hidden controls still define an attachment position. Measure a copy outside
    // the observed canvas so visibility changes cannot create a layout loop.
    const canvas = element.closest<HTMLElement>('#dialog, .preview-canvas');
    const surface = canvas?.cloneNode(false) as HTMLElement | undefined;
    if (!canvas || !surface || !canvas.parentElement) {
        return element.getBoundingClientRect();
    }

    surface.removeAttribute('id');
    surface.style.position = 'fixed';
    surface.style.left = '-100000px';
    surface.style.top = '0px';
    surface.style.visibility = 'hidden';
    surface.style.pointerEvents = 'none';
    surface.style.display = 'block';

    const copy = element.cloneNode(true) as HTMLElement;
    copy.style.removeProperty('display');
    copy.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
        radio.removeAttribute('name');
    });
    const core = copy.firstElementChild as HTMLElement | null;
    if (core?.style.display === 'none') {
        core.style.removeProperty('display');
    }
    surface.appendChild(copy);
    canvas.parentElement.appendChild(surface);
    try {
        return copy.getBoundingClientRect();
    } finally {
        surface.remove();
    }
}

function elementBounds(element: HTMLElement): ElementAnchorRect {
    const measured = measureElementAnchorElement(element);
    const previous = lastBounds.get(element);
    const bounds = {
        left: readCoordinate(element.style.left, Number(element.dataset.left) || 0),
        top: readCoordinate(element.style.top, Number(element.dataset.top) || 0),
        width: measured.width || readCoordinate(
            element.style.width,
            previous?.width ?? (Number(element.dataset.width) || 0)
        ),
        height: measured.height || readCoordinate(
            element.style.height,
            previous?.height ?? (Number(element.dataset.height) || 0)
        )
    };
    lastBounds.set(element, bounds);
    return bounds;
}

function canvasForElement(element: HTMLElement): HTMLElement | null {
    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
        if (controllers.has(parent)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}

function applyElementAnchors(canvas: HTMLElement): ElementAnchorIssue[] {
    const elements = anchoringElements(canvas);
    const descriptions = elements.map((element) => anchorElement(element, canvas));
    const byId = new Map(elements.map((element) => [element.id, element]));
    const plan = planElementAnchors(descriptions);
    const issues: ElementAnchorIssue[] = plan.issues.map((issue) => {
        const element = byId.get(issue.elementId)!;
        return {
            elementId: issue.elementId,
            message: `${element.dataset.nameid || element.id}: ${issue.message}`
        };
    });
    const positionStyle = document.createElement('div').style;

    for (const id of plan.order) {
        const element = byId.get(id)!;
        try {
            const anchor = readElementAnchor(element.dataset);
            if (anchor) {
                const target = byId.get(anchor.target)!;
                const position = resolveElementAnchorPosition(
                    elementBounds(element),
                    elementBounds(target),
                    anchor
                );
                // Compare the browser's serialized CSS, including fractional rounding.
                positionStyle.left = position.left + 'px';
                positionStyle.top = position.top + 'px';
                if (element.style.left !== positionStyle.left) {
                    element.style.left = positionStyle.left;
                }
                if (element.style.top !== positionStyle.top) {
                    element.style.top = positionStyle.top;
                }
            }
        } catch (reason) {
            const error = reason instanceof Error ? reason.message : String(reason);
            const name = element.dataset.nameid || element.id;
            issues.push({ elementId: element.id, message: `${name}: ${error}` });
        }
    }

    const errors = new Map(issues.map((issue) => [issue.elementId, issue.message]));
    for (const element of elements) {
        const error = errors.get(element.id) || '';
        anchorErrors.set(element, error);
        element.classList.toggle('element-anchor-invalid', Boolean(error));
    }

    return issues;
}

export function refreshElementAnchors(canvas: HTMLElement): ElementAnchorIssue[] {
    const controller = controllers.get(canvas);
    return controller ? controller.refresh() : applyElementAnchors(canvas);
}

export function requestElementAnchorLayout(element: HTMLElement): void {
    const canvas = canvasForElement(element);
    if (canvas) {
        controllers.get(canvas)?.schedule();
    }
}

export function setElementAnchorProperties(
    element: HTMLElement,
    properties: Readonly<Record<string, string | number | undefined>>
): void {
    const canvas = canvasForElement(element);
    const candidate: Record<string, unknown> = { ...element.dataset };
    Object.entries(properties).forEach(([key, value]) => {
        if (value !== undefined) {
            candidate[key] = value;
        }
    });
    const anchor = readElementAnchor(candidate);
    if (anchor && canvas) {
        validateElementAnchor(
            anchorElement(element, canvas),
            anchor,
            anchoringElements(canvas).map((node) => anchorElement(node, canvas))
        );
    }

    if (hasElementAnchor(element) && properties.anchorTarget === '') {
        element.dataset.left = String(readCoordinate(element.style.left, 0));
        element.dataset.top = String(readCoordinate(element.style.top, 0));
    }

    Object.entries(properties).forEach(([key, value]) => {
        if (value !== undefined) {
            element.dataset[key] = String(value);
        }
    });

    if (canvas) {
        refreshElementAnchors(canvas);
    }
}

export function canElementAnchorTo(element: HTMLElement, target: HTMLElement): string {
    const canvas = canvasForElement(element);
    if (!canvas) {
        return 'The element is not on an authoring canvas.';
    }

    try {
        const anchor = readElementAnchor({ ...element.dataset, anchorTarget: target.id })!;
        validateElementAnchor(
            anchorElement(element, canvas),
            anchor,
            anchoringElements(canvas).map((node) => anchorElement(node, canvas))
        );
        return '';
    } catch (reason) {
        return reason instanceof Error ? reason.message : String(reason);
    }
}

export function followsSelectedAnchor(element: HTMLElement, selectedIds: ReadonlySet<string>): boolean {
    const canvas = canvasForElement(element);
    if (!canvas) {
        return false;
    }

    const byId = new Map(anchoringElements(canvas).map((node) => [node.id, node]));
    const visited = new Set<string>();
    let current: HTMLElement | undefined = element;
    while (current && hasElementAnchor(current) && !visited.has(current.id)) {
        visited.add(current.id);
        const target = current.dataset.anchorTarget?.trim() || '';
        if (selectedIds.has(target)) {
            return true;
        }
        current = byId.get(target);
    }
    return false;
}

export function moveAnchoredElement(
    element: HTMLElement,
    left: number,
    top: number
): boolean {
    if (!hasElementAnchor(element)) {
        return false;
    }

    const canvas = canvasForElement(element);
    if (!canvas) {
        return false;
    }

    try {
        const anchor = readElementAnchor(element.dataset)!;
        const elements = anchoringElements(canvas);
        validateElementAnchor(
            anchorElement(element, canvas),
            anchor,
            elements.map((candidate) => anchorElement(candidate, canvas))
        );
        const target = elements.find((candidate) => candidate.id === anchor.target)!;
        const origin = resolveElementAnchorPosition(
            elementBounds(element),
            elementBounds(target),
            { ...anchor, gap: 0, offset: 0 }
        );

        if (anchor.position === 'left' || anchor.position === 'right') {
            element.dataset.anchorGap = String(
                anchor.position === 'left' ? origin.left - left : left - origin.left
            );
            element.dataset.anchorOffset = String(top - origin.top);
        } else {
            element.dataset.anchorGap = String(
                anchor.position === 'above' ? origin.top - top : top - origin.top
            );
            element.dataset.anchorOffset = String(left - origin.left);
        }

        refreshElementAnchors(canvas);
        return true;
    } catch {
        return false;
    }
}

export function installElementAnchors(
    canvas: HTMLElement,
    options: { updateLabel?: (label: HTMLElement) => void } = {}
): () => void {
    controllers.get(canvas)?.dispose();

    const warning = document.createElement('div');
    warning.className = 'element-anchor-warning';
    warning.setAttribute('role', 'alert');
    warning.hidden = true;
    canvas.parentElement?.appendChild(warning);

    let frame = 0;
    let disposed = false;
    let previousErrors = '';
    const observed = new Set<HTMLElement>();
    const resizeObserver = new ResizeObserver(() => schedule());

    function refresh(): ElementAnchorIssue[] {
        if (disposed) {
            return [];
        }

        const elements = anchoringElements(canvas);
        for (const element of observed) {
            if (!canvas.contains(element)) {
                resizeObserver.unobserve(element);
                observed.delete(element);
            }
        }
        for (const element of elements) {
            if (!observed.has(element)) {
                resizeObserver.observe(element);
                observed.add(element);
            }
        }

        const issues = applyElementAnchors(canvas);
        const errors = issues.map((issue) => issue.message).join('\n');
        if (errors !== previousErrors) {
            warning.textContent = errors;
            warning.hidden = !errors;
            previousErrors = errors;
        }
        canvas.dispatchEvent(new CustomEvent('element-anchors-updated', {
            bubbles: true,
            detail: { issues }
        }));
        return issues;
    }

    function schedule(): void {
        if (!frame && !disposed) {
            frame = requestAnimationFrame(() => {
                frame = 0;
                refresh();
            });
        }
    }

    function refreshTypography(): void {
        if (disposed) {
            return;
        }
        if (options.updateLabel) {
            const elements = anchoringElements(canvas);
            const targets = new Set(elements.map((element) => element.dataset.anchorTarget?.trim()));
            elements.filter((element) => {
                return element.dataset.type === 'Label'
                    && (
                        hasElementAnchor(element)
                        || targets.has(element.id)
                        || element.dataset.valign === 'optical-middle'
                    );
            }).forEach(options.updateLabel);
        }
        refresh();
    }

    const observer = new MutationObserver(schedule);
    observer.observe(canvas, { attributes: true, childList: true, subtree: true });
    document.fonts.addEventListener('loadingdone', refreshTypography);
    void document.fonts.ready.then(refreshTypography);

    const dispose = (): void => {
        disposed = true;
        observer.disconnect();
        resizeObserver.disconnect();
        document.fonts.removeEventListener('loadingdone', refreshTypography);
        if (frame) {
            cancelAnimationFrame(frame);
        }
        warning.remove();
        controllers.delete(canvas);
    };
    controllers.set(canvas, { refresh, schedule, dispose });
    refresh();
    return dispose;
}
