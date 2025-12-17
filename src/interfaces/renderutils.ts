import { AnyElement, AssertOptions, BuildOptions, StringNumber, UniformSchema } from './elements';
import { DialogProperties } from "./dialog";
// Use relative path to avoid module resolution duplication issues
import { ElementsWithPersist } from '../modules/elements';
import { EventName } from '../library/api';

export interface RenderUtils {
    previewWindow: () => boolean;
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
    syncCounterSize: (wrapper: HTMLElement) => void;
    // Group helpers
    getSelectedIds: () => string[];
    ungroupGroup: (groupId: string) => string[];
    // Selection/grouping utilities
    makeGroupFromSelection: (ids: string[], persistent?: boolean) => string | null;
    updateMultiOutline: (canvas: HTMLElement, ids: string[], outlineEl?: HTMLDivElement | null) => HTMLDivElement | null;
    clearMultiOutline: (outlineEl?: HTMLDivElement | null) => null;
    computeBounds: (ids: string[]) => {
        left: number;
        top: number;
        width: number;
        height: number;
    } | null;
    moveElementsBy: (ids: string[], dx: number, dy: number) => void;
    updateCheckboxColor: (uuid: string, color: string) => void;
    // Button UX helpers
    enhanceButton: (btn: HTMLButtonElement) => void;
    enhanceButtons: (root?: ParentNode) => void;
    handleEvent(eventName: string, ...args: unknown[]): Promise<void>;
    collectDialogProperties: () => DialogProperties;
    updateFont: (fontSize: number, fontFamily?: string) => void;
    buildUniformSchema: (opts?: BuildOptions) => UniformSchema;
    assertTypes: (data: Record<string, unknown>, options?: AssertOptions) => void | string[];
    // Return non-persist keys for a given element template name
    getNonPersistKeys: (name: keyof ElementsWithPersist) => string[];
    // Propagate element name changes across customJS
    propagateNameChange: (oldName: string, newName: string) => void;
    findWrapper: (name: string, canvas: HTMLElement) => HTMLElement | null;
    findRadioGroupMembers: (groupName: string, canvas: HTMLElement) => HTMLElement[];
    showRuntimeError: (msg: string, canvas: HTMLElement) => void;
    exposeNameGlobals: (canvas: HTMLElement) => void;
    exposeRadioGroupGlobals: (canvas: HTMLElement) => void;
    exposeEventNameGlobals: () => void;
    normalizeEventName: (ev: unknown) => EventName | null;
    normalizeContainerItemType: (value: unknown) => string;
    applyContainerItemFilter: (host: HTMLElement | null) => void;
}

export interface ValidationMessage {
    [element: string]: {
        name: string;
        errors: string[];
    }
}

export interface ErrorTippy {
    [element: string]: Array<any>
}
