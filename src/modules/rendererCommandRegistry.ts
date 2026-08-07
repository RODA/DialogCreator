export type RendererCommandHandler = (...args: unknown[]) => unknown | Promise<unknown>;

export type RendererCommandName =
    | 'addCover'
    | 'removeCover'
    | 'addAvailableElementsTo'
    | 'previewDialog';

const registry: Record<RendererCommandName, RendererCommandHandler> = {
    addCover: async () => {
        const { cover } = await import('./cover');
        return cover.addCover();
    },

    removeCover: async () => {
        const { cover } = await import('./cover');
        return cover.removeCover();
    },

    addAvailableElementsTo: async (targetWindow) => {
        const { editor } = await import('./editor');
        return editor.addAvailableElementsTo(String(targetWindow ?? ''));
    },

    previewDialog: async () => {
        const { editor } = await import('./editor');
        return editor.previewDialog();
    }
};

export const rendererCommandNames = Object.keys(registry) as RendererCommandName[];

export async function runRendererCommand(
    eventName: string,
    ...args: unknown[]
): Promise<unknown> {
    const command = registry[eventName as RendererCommandName];
    if (!command) {
        console.error(`No handler for event: ${eventName}`);
        return undefined;
    }

    try {
        return await command(...args);
    } catch (error: any) {
        const message = String(error && error.message ? error.message : error);
        const { showError } = await import('./coms');
        showError(`Error handling ${eventName}: ${message}`);
        return undefined;
    }
}
