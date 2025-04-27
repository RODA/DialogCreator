
export interface Handlers {
    [key: string]: {
        // filename of the module, searched in ../modules
        module: string,

        // exported function in the module
        method: string
    }
}

export interface EventHandler {
    module: string;
    method: string;
}