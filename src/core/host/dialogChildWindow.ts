export type DialogChildWindowArgs = {
    html: string;
    preload: string;
    width: number;
    height: number;
    title?: string;
    backgroundColor?: string;
    useContentSize?: boolean;
    autoHideMenuBar?: boolean;
    data?: unknown;
};
