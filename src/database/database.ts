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
            db.all(sql, [element], async (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const result: Record<string, string> = {};
                const existing = new Set<string>();
                for (const row of rows as { property: string; value: string }[]) {
                    result[row.property] = row.value;
                    existing.add(row.property);
                }

                const allowed = (DBElementsProps as any)[element] as string[] || [];
                const missing = allowed.filter(p => !existing.has(p));

                if (missing.length > 0) {
                    // Insert missing properties with defaults from modules/elements
                    const defaults = (elements as any)[element] || {};
                    const insSql = "INSERT INTO elements (element, property, value) VALUES (?, ?, ?)";
                    try {
                        await Promise.all(missing.map(p => new Promise<void>((res) => {
                            const v = defaults[p] !== undefined ? String(defaults[p]) : '';
                            db.run(insSql, [element, p, v], () => res());
                        })));
                    } catch (_e) {
                        // ignore insert errors; continue
                    }
                    // Re-read full set
                    db.all(sql, [element], (err2, rows2) => {
                        if (err2) {
                            reject(err2);
                        } else {
                            const out: Record<string, string> = {};
                            for (const r of rows2 as { property: string; value: string }[]) {
                                out[r.property] = r.value;
                            }
                            resolve(out);
                        }
                    });
                } else {
                    resolve(result);
                }
            });
        });
    },

    updateProperty: async (element, property, value) => {
        const updateSQL = "UPDATE elements SET value = ? WHERE element = ? AND property = ?";
        const insertSQL = "INSERT INTO elements (value, element, property) VALUES (?, ?, ?)";
        return new Promise<boolean>((resolve) => {
            db.run(updateSQL, [value, element, property], function (err) {
                if (err) {
                    console.error("Error updating property:", err);
                    resolve(false);
                } else if (this.changes > 0) {
                    resolve(true);
                } else {
                    // Property row might not exist yet; insert it
                    db.run(insertSQL, [value, element, property], function (err2) {
                        if (err2) {
                            console.error("Error inserting property:", err2);
                            resolve(false);
                        } else {
                            resolve(this.changes > 0);
                        }
                    });
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
                    [String(value), element, property],
                    function (err) {
                        if (err) {
                            console.log(err);
                            success = false;
                            return resolve();
                        }
                        if (this.changes === 0) {
                            // Insert if missing
                            db.run(
                                "INSERT INTO elements (element, property, value) VALUES (?, ?, ?)",
                                [element, property, String(value)],
                                function (_err2) {
                                    // ignore _err2 here; success flag remains accurate
                                    resolve();
                                }
                            );
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }
        return success ? Object.fromEntries(updates) : false;
    }
};
