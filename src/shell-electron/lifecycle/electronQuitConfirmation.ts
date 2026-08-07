import type { App } from "electron";

export interface ElectronQuitConfirmationSession {
    isQuitting(): boolean;
    confirmQuitIfDirty(): Promise<boolean>;
    markQuitting(): void;
}

export async function handleEditorWindowCloseRequest(
    app: App,
    session: ElectronQuitConfirmationSession,
    event: Electron.Event
): Promise<void> {
    if (session.isQuitting()) {
        return;
    }

    event.preventDefault();

    const ok = await session.confirmQuitIfDirty();
    if (ok) {
        session.markQuitting();
        app.quit();
    }
}

export function installElectronQuitConfirmation(
    app: App,
    getSession: () => ElectronQuitConfirmationSession
): void {
    app.on('before-quit', (event) => {
        const session = getSession();
        if (session.isQuitting()) {
            return;
        }

        event.preventDefault();

        session.confirmQuitIfDirty()
            .then((ok) => {
                if (ok) {
                    session.markQuitting();
                    app.quit();
                }
            })
            .catch(() => {
                session.markQuitting();
                app.quit();
            });
    });
}
