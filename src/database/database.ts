import * as path from "path";
import * as sqlite3 from "sqlite3";
import { DBInterface, DBElementsProps } from "../interfaces/database";
import { elements } from "../modules/elements";
const sqlite = sqlite3.verbose();

let dbFile = '';
if (process.env.NODE_ENV == 'development') {
    dbFile = path.join(path.resolve('./src/database/DialogCreator.sqlite'));
} else {
    dbFile = path.join(path.resolve(__dirname, '../../../', 'DialogCreator.sqlite'));
    // dbFile = path.join(path.resolve(__dirname, '../src/database/DialogCreator.sqlite'));
}

export const db = new sqlite.Database(dbFile);

export const database: DBInterface = {
    getProperties: async (element) => {
        const sql = "SELECT property, value FROM elements WHERE element = ?";
        return new Promise<Record<string, string>>((resolve, reject) => {
            db.all(sql, [element], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const result: Record<string, string> = {};
                    for (const row of rows as { property: string; value: string }[]) {
                        result[row.property] = row.value;
                    }
                    resolve(result);
                }
            });
        });
    },

    updateProperty: async (element, property, value) => {
        const sql = "UPDATE elements SET value = ? WHERE element = ? AND property = ?";
        return new Promise<boolean>((resolve) => {
            db.run(sql, [value, element, property], function (err) {
                if (err) {
                    console.error("Error updating property:", err);
                    resolve(false);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    },

    resetProperties: async (element: string) => {
        const properties = elements[element as keyof typeof elements];
        const allowedProps = DBElementsProps[element] || [];
        const updates = Object.entries(properties)
            .filter(([property]) => allowedProps.includes(property));

        if (updates.length === 0) return false;

        let success = true;
        for (const [property, value] of updates) {
            await new Promise<void>((resolve) => {
                db.run(
                    "UPDATE elements SET value = ? WHERE element = ? AND property = ?",
                    [value, element, property],
                    function (err) {
                        if (err) {
                            console.log(err);
                            success = false;
                        }
                        resolve();
                    }
                );
            });
        }
        return success ? Object.fromEntries(updates) : false;
    }
};
