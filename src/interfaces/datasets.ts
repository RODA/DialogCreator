type DatasetVariable = {
    text: string;
    type: string;
};

export type Datasets = Record<string, DatasetVariable[]>;