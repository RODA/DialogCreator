import { Datasets } from "../interfaces/datasets";

// export const datasets: Datasets = {
//     LR: [
//         { text: "DEV", type: "numeric" },
//         { text: "URB", type: "numeric" },
//         { text: "LIT", type: "numeric" },
//         { text: "IND", type: "numeric" },
//         { text: "STB", type: "numeric" },
//         { text: "SURV", type: "numeric" }
//     ],
//     LR2: [
//         { text: "DEV2", type: "numeric" },
//         { text: "URB2", type: "numeric" },
//         { text: "LIT2", type: "numeric" },
//         { text: "IND2", type: "numeric" },
//         { text: "STB2", type: "numeric" },
//         { text: "SURV2", type: "numeric" }
//     ]
// };

export const datasets: Datasets = {
    PlantGrowth: [
        { text: "weight", type: "numeric" },
        { text: "group", type: "categorical" }
    ],
    ToothGrowth: [
        { text: "len", type: "numeric" },
        { text: "supp", type: "categorical" },
        { text: "dose", type: "numeric" }
    ],
    Survey: [
        { text: "age", type: "numeric" },
        { text: "gender", type: "categorical" },
        { text: "education", type: "categorical" },
        { text: "income", type: "numeric" },
        { text: "satisfaction", type: "numeric" },
        { text: "residence", type: "categorical" }
    ]
};
