type DatasetVariable = {
    name: string;
    numeric?: boolean;
    factor?: boolean;
    calibrated?: boolean;
    binary?: boolean;
    character?: boolean;
    categorical?: boolean;
    date?: boolean;
};

export type Datasets = Record<string, DatasetVariable[]>;
