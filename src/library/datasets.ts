import { Datasets } from "../interfaces/datasets";

// export const datasets: Datasets = {
//     LR: [
//         { name: "DEV", numeric: true },
//         { name: "URB", numeric: true },
//         { name: "LIT", numeric: true },
//         { name: "IND", numeric: true },
//         { name: "STB", numeric: true },
//         { name: "SURV", numeric: true }
//     ],
//     LR2: [
//         { name: "DEV2", numeric: true },
//         { name: "URB2", numeric: true },
//         { name: "LIT2", numeric: true },
//         { name: "IND2", numeric: true },
//         { name: "STB2", numeric: true },
//         { name: "SURV2", numeric: true }
//     ]
// };

export const datasets: Datasets = {
    PlantGrowth: [
        { name: "weight", numeric: true },
        { name: "group", factor: true, categorical: true }
    ],
    ToothGrowth: [
        { name: "len", numeric: true },
        { name: "supp", factor: true, categorical: true },
        { name: "dose", numeric: true }
    ],
    Survey: [
        { name: "age", numeric: true },
        { name: "gender", factor: true, categorical: true },
        { name: "education", factor: true, categorical: true },
        { name: "income", numeric: true },
        { name: "satisfaction", numeric: true },
        { name: "residence", factor: true, categorical: true }
    ]
};
