// Presentation settings shared by the editor and the portable renderer.
// Hosts supply diagnostics; rendering does not import their transport.
export const rendererEnvironment = {
    fontSize: 12,
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
    log: (message: string): void => { console.log(message); },
    reportError: (message: string): void => { throw new Error(message); }
};
