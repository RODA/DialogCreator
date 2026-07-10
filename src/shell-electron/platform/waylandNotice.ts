import { app, dialog } from "electron";
import * as fs from "fs";
import * as path from "path";

export function maybeShowWaylandNotice(): void {
    if (!app.isPackaged || process.platform !== 'linux') return;
    const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase();
    const onWayland = sessionType === 'wayland' || !!process.env.WAYLAND_DISPLAY;
    if (!onWayland) return;

    const noticeFile = path.join(app.getPath('userData'), 'wayland_notice_seen');
    if (fs.existsSync(noticeFile)) return;

    const detail = [
        'Window positioning works best under X11.',
        'On Wayland, preview/syntax windows may not stay aligned.',
        'For best results, launch with X11 compatibility:',
        'ELECTRON_OZONE_PLATFORM_HINT=x11 OZONE_PLATFORM=x11 XDG_SESSION_TYPE=x11 ./DialogCreator_1.0.0.AppImage'
    ].join('\n');

    const res = dialog.showMessageBoxSync({
        type: 'info',
        buttons: ['OK', "Don't show again"],
        defaultId: 0,
        cancelId: 0,
        title: 'Wayland positioning notice',
        message: 'Window positioning is limited on Wayland.',
        detail,
        normalizeAccessKeys: true
    });

    if (res === 1) {
        try { fs.writeFileSync(noticeFile, 'seen'); } catch { /* ignore */ }
    }
}
