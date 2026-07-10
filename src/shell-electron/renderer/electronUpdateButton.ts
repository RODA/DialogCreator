import { coms } from "../../modules/coms";

interface AppUpdateState {
    mode: "available" | "downloading" | "downloaded" | "hidden";
    percent: number;
    version: string;
}

const styleId = "dialogcreator-electron-update-button-styles";

function isAppUpdateState(value: unknown): value is AppUpdateState {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const state = value as Record<string, unknown>;
    return state.mode === 'available'
        || state.mode === 'downloading'
        || state.mode === 'downloaded'
        || state.mode === 'hidden';
}

function installStyles(): void {
    if (document.getElementById(styleId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .editor-toolbar .toolbar-spacer {
            flex: 1 1 auto;
        }

        .app-update-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 24px;
            padding: 0;
            background: #1677ff;
            color: #ffffff;
            border: 1px solid #0b5ed7;
            border-radius: 6px;
            box-shadow: 0 1px 0 rgba(255, 255, 255, 0.25) inset;
            cursor: pointer;
        }

        .app-update-button:hover {
            background: #0b66e4;
        }

        .app-update-button:active {
            background: #0958c7;
            box-shadow: none;
        }

        .app-update-button:disabled {
            opacity: 0.75;
            cursor: progress;
        }

        .app-update-button.hidden {
            display: none;
        }

        .app-update-button .codicon {
            font-size: 16px;
            line-height: 1;
        }
    `;

    document.head.appendChild(style);
}

function createUpdateButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'app-update-button';
    button.className = 'app-update-button hidden';
    button.title = 'Update';
    button.setAttribute('aria-label', 'Update');

    const icon = document.createElement('span');
    icon.className = 'codicon codicon-download';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    return button;
}

export function installElectronUpdateButton(): void {
    const attachButton = function(): void {
        const toolbar = document.getElementById('editor-toolbar');
        if (!toolbar || document.getElementById('app-update-button')) {
            return;
        }

        installStyles();

        const spacer = document.createElement('span');
        spacer.className = 'toolbar-spacer';
        spacer.setAttribute('aria-hidden', 'true');

        const button = createUpdateButton();

        const showButton = function(disabled: boolean): void {
            button.classList.remove('hidden');
            button.disabled = disabled;
        };

        const hideButton = function(): void {
            button.classList.add('hidden');
            button.disabled = false;
            button.removeAttribute('data-update-mode');
        };

        button.addEventListener('click', () => {
            if (!button.disabled) {
                coms.sendTo('main', 'app-update-button');
            }
        });

        coms.on('dialogcreator-updater-state', (payload) => {
            if (!isAppUpdateState(payload)) {
                return;
            }

            button.dataset.updateMode = payload.mode;

            if (payload.mode === 'hidden') {
                hideButton();
                return;
            }

            if (payload.mode === 'downloading') {
                showButton(true);
                return;
            }

            showButton(false);
        });

        toolbar.appendChild(spacer);
        toolbar.appendChild(button);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachButton, { once: true });
        return;
    }

    attachButton();
}
