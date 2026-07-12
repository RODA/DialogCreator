import type {
    HostCommandTransport,
    HostEventTransport
} from "./hostTransport";

export type AppUpdateButtonMode = "available" | "downloading" | "downloaded" | "hidden";

export interface AppUpdateState {
    mode: AppUpdateButtonMode;
    percent: number;
    version: string;
}

export interface AppUpdateService {
    checkForUpdates(): void;
    handleUpdateButton(): void;
}

export const appUpdateChannels = {
    state: 'dialogcreator-updater-state',
    button: 'app-update-button'
} as const;

export function sendAppUpdateButtonAction(
    transport: HostCommandTransport
): void {
    transport.sendTo('main', appUpdateChannels.button);
}

export function onAppUpdateState(
    transport: HostEventTransport,
    listener: (state: AppUpdateState) => void
): void {
    transport.on(appUpdateChannels.state, (payload) => {
        if (isAppUpdateState(payload)) {
            listener(payload);
        }
    });
}

export function isAppUpdateState(value: unknown): value is AppUpdateState {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const state = value as Record<string, unknown>;
    return state.mode === 'available'
        || state.mode === 'downloading'
        || state.mode === 'downloaded'
        || state.mode === 'hidden';
}
