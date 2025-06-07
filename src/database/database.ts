import * as path from "path";
import * as DuckDB from "duckdb";
import { Database, DBElementsProps } from "../interfaces/database";
import { elements } from "../modules/elements";


const duckdbOptions: {
    access_mode: 'READ_WRITE' | 'READ_ONLY',
    max_memory?: string,
} = {
    'access_mode': 'READ_WRITE',
    'max_memory': '4096MB',
};

let dbDir = path.resolve("./src/database/");


if (process.env.NODE_ENV == 'production') {
    dbDir = path.join(path.resolve(__dirname), '../../../');
    duckdbOptions['access_mode'] = 'READ_WRITE';
    delete duckdbOptions.max_memory;
}

const dbFile = path.join(dbDir, "DialogCreator.duckdb");

export const db = new DuckDB.Database(dbFile, duckdbOptions,
    (error) => {
        if (error) {
            console.log('DB failed to open');
            console.log(error);
        }
    }
);

export const database: Database = {
    getProperties: async (element) => {
        return new Promise<Record<string, string>>((resolve) => {
            db.all(
                "SELECT property, value FROM elements WHERE element = ?",
                [element],
                (error, rows) => {
                    if (error) {
                        console.log(error);
                        resolve({});
                    } else {
                        const result: Record<string, string> = {};
                        for (const row of rows) {
                            result[row.property] = row.value;
                        }
                        resolve(result);
                    }
                }
            );
        });
    },

    updateProperty: async (element, property, value) => {
        return new Promise<boolean>((resolve, reject) => {
            db.run(
                "UPDATE elements SET value = '" + value + "' WHERE element = '" + element + "' AND property = '" + property + "'",
                (error) => {
                    if (error) {
                        console.log(error);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    },

    resetProperties: async (element: string) => {
        // Only update properties that exist for the element type in DBElementsProps
        const properties = elements[element as keyof typeof elements];

        const allowedProps = DBElementsProps[element] || [];
        const updates = Object.entries(properties)
            .filter(([property]) => allowedProps.includes(property));

        if (updates.length === 0) return false;

        let success = true;
        for (const [property, value] of updates) {
            db.run(
                "UPDATE elements SET value = '" + value + "' WHERE element = '" + element + "' AND property = '" + property + "'",
                (error) => {
                    if (error) {
                        console.log(error);
                        success = false;
                    }
                }
            );
        }

        return success ? Object.fromEntries(updates) : false;
    }
};
