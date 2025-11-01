type DatasetVariable = {
    text: string;
    type: string;
};

type Datasets = Record<string, DatasetVariable[]>;

export const datasets: Datasets = {
    LR: [
        { text: "DEV", type: "numeric" },
        { text: "URB", type: "numeric" },
        { text: "LIT", type: "character" },
        { text: "IND", type: "factor" },
        { text: "STB", type: "binary" },
        { text: "SURV", type: "numeric" }
    ],
    LR2: [
        { text: "DEV2", type: "date" },
        { text: "URB2", type: "numeric" },
        { text: "LIT2", type: "character" },
        { text: "IND2", type: "factor" },
        { text: "STB2", type: "binary" },
        { text: "SURV2", type: "numeric" }
    ]
};
