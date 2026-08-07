import type { App, MenuItemConstructorOptions } from "electron";
import { Menu } from "electron";

export interface ElectronApplicationMenuSession {
    buildMainMenuTemplate(): MenuItemConstructorOptions[];
}

export interface ElectronApplicationMenuHostOptions {
    app: App;
    getSession: () => ElectronApplicationMenuSession | null;
}

export class ElectronApplicationMenuHost {
    constructor(private readonly options: ElectronApplicationMenuHostOptions) {}

    rebuild(): void {
        if (!this.options.app.isReady()) {
            return;
        }

        const session = this.options.getSession();
        if (!session) {
            return;
        }

        const mainMenu = Menu.buildFromTemplate(session.buildMainMenuTemplate());
        Menu.setApplicationMenu(mainMenu);
    }
}
