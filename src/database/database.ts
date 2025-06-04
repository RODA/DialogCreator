import * as path from "path";
import * as DuckDB from "duckdb";
import { DBElements } from "../interfaces/database";


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

export const database = {
    getProperties: async <K extends keyof DBElements>(element: K): Promise<Partial<DBElements[K]>> => {
        return new Promise<Partial<DBElements[K]>>((resolve) => {
            db.all(
                "SELECT property, value FROM elements WHERE element = ?",
                [element],
                (error, rows) => {
                    if (error) {
                        console.log(error);
                        resolve({} as Partial<DBElements[K]>);
                    } else {
                        const result: any = {};
                        for (const row of rows) {
                            result[row.property] = row.value;
                        }
                        resolve(result as Partial<DBElements[K]>);
                    }
                }
            );
        });
    },
    updateProperty: async <K extends keyof DBElements>(element: K, property: string, value: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            db.run(
                "UPDATE elements SET value = ? WHERE element = ? AND property = ?",
                [value, element, property],
                (error) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};
