import { AnyElement, AssertOptions, BuildOptions, StringNumber, UniformSchema } from './elements';
import { DialogProperties } from "./dialog";
// Use relative path to avoid module resolution duplication issues
import { ElementsWithPersist } from '../modules/elements';

export interface RenderUtils {
    unselectRadioGroup: (element: HTMLElement) => void;
    makeUniqueNameID: (type: string) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    setInputFilter: (textbox: HTMLInputElement | null, inputFilter: (value: string) => boolean) => void;
    setIntegers: (items: string[] | HTMLInputElement[], prefix?: string) => void;
    setSignedIntegers: (items: string[] | HTMLInputElement[], prefix?: string) => void;
    setDouble: (items: string[] | HTMLInputElement[], prefix?: string) => void;
    setSignedDouble: (items: string[] | HTMLInputElement[], prefix?: string) => void;
    getDialogInfo: () => { elements: string[]; selected: HTMLElement | undefined };
    makeElement: (data: AnyElement) => HTMLElement;
    updateElement: (element: HTMLElement, properties?: StringNumber) => void;
    updateButton: (
        button: HTMLDivElement,
        text: string,
        fontSize: number,
        lineClamp: number,
        widthMax: number
    ) => void;
    updateLabel: (element: HTMLElement, properties?: AnyElement) => void;
    updateHandleStyle: (handle: HTMLDivElement, properties: StringNumber) => void;
    // Group helpers
    getSelectedIds: () => string[];
    ungroupGroup: (groupId: string) => string[];
    // Selection/grouping utilities
    makeGroupFromSelection: (ids: string[], persistent?: boolean) => string | null;
    updateMultiOutline: (canvas: HTMLElement, ids: string[], outlineEl?: HTMLDivElement | null) => HTMLDivElement | null;
    clearMultiOutline: (outlineEl?: HTMLDivElement | null) => null;
    computeBounds: (ids: string[]) => { left: number; top: number; width: number; height: number } | null;
    moveElementsBy: (ids: string[], dx: number, dy: number) => void;
    updateCheckboxColor: (uuid: string, color: string) => void;
    handleEvent(eventName: string, ...args: unknown[]): Promise<void>;
    contentTypeValid: (currentElement: HTMLElement) => boolean;
    collectDialogProperties: () => DialogProperties;
    updateFont: (fontSize: number, fontFamily?: string) => void;
    buildUniformSchema: (
        templates: Record<string, any>,
        opts?: BuildOptions
    ) => UniformSchema;
    assertTypes: (
        data: Record<string, unknown>,
        templates: Record<string, any>,
        options?: AssertOptions
    ) => void | string[];
    // Return non-persist keys for a given element template name
    getNonPersistKeys: (name: keyof ElementsWithPersist) => string[];
}
