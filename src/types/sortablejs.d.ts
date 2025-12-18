declare module 'sortablejs' {
    namespace Sortable {
        interface SortableEvent {
            item: HTMLElement;
            from: HTMLElement;
            to: HTMLElement;
            oldIndex?: number;
            newIndex?: number;
            originalEvent?: Event;
        }
        interface SortableOptions extends Record<string, unknown> {
            animation?: number;
            draggable?: string;
            ghostClass?: string;
            chosenClass?: string;
            dragClass?: string;
            direction?: 'vertical' | 'horizontal';
            forceFallback?: boolean;
            fallbackOnBody?: boolean;
            fallbackBoundingClientRect?: { left: number; top: number; width: number; height: number };
            scroll?: boolean;
            group?: string | { name?: string; pull?: boolean | 'clone'; put?: boolean | string[] };
            onStart?: (evt: SortableEvent) => void;
            onEnd?: (evt: SortableEvent) => void;
            onMove?: (evt: SortableEvent & { related?: HTMLElement | null }) => boolean | undefined;
        }
    }

    class Sortable {
        constructor(el: HTMLElement, options?: Sortable.SortableOptions);
        destroy(): void;
    }

    export = Sortable;
}
