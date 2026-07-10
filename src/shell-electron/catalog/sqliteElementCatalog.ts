import * as path from "path";
import * as sqlite3 from "sqlite3";
import * as fs from "fs";

import type { ElementCatalog } from "../../core/catalog/elementCatalog";
import { DBElementsProps } from "../../interfaces/database";
import { elements } from "../../modules/elements";
import { utils } from "../../library/utils";
import { AnyElement, StringNumber } from '../../interfaces/elements';

const sqlite = sqlite3.verbose();

let dbFile = '';
if (process.env.NODE_ENV == 'development') {
    dbFile = path.join(path.resolve('./src/database/DialogCreator.sqlite'));
} else {
    const candidatePaths = [
        ...(process.resourcesPath ? [path.join(process.resourcesPath, 'DialogCreator.sqlite')] : []),
        path.join(path.resolve(__dirname, '../../', 'DialogCreator.sqlite')),
        path.join(path.resolve(__dirname, '../../../', 'DialogCreator.sqlite')),
        path.join(path.resolve('./src/database/DialogCreator.sqlite')),
    ];

    const existing = candidatePaths.find(p => {
        if (!fs.existsSync(p)) return false;
        try {
            const stats = fs.statSync(p);
            return stats.size > 0;
        } catch {
            return false;
        }
    });
    dbFile = existing ?? candidatePaths[candidatePaths.length - 1];
}

export const db = new sqlite.Database(dbFile);

export const elementCatalog: ElementCatalog = {
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

                const allowed = DBElementsProps[element] as string[] || [];
                const missing = allowed.filter(p => !existing.has(p));

                if (missing.length > 0) {
                    if (!utils.isKeyOf(elements, element)) {
                        reject(new Error(`Unknown element: ${element}`));
                        return;
                    }

                    type DefaultsType = AnyElement & StringNumber & { $persist?: readonly string[] };
                    const defaults = (elements[element] || {}) as DefaultsType;
                    const insSql = "INSERT INTO elements (element, property, value) VALUES (?, ?, ?)";
                    try {
                        await Promise.all(missing.map(p => new Promise<void>((res) => {
                            const v = String(defaults[p]);
                            db.run(insSql, [element, p, v], () => res());
                        })));
                    } catch {
                        // Missing default inserts are non-fatal; continue with a fresh read.
                    }

                    db.all(sql, [element], (err2, rows2) => {
                        if (err2) {
                            reject(err2);
                            return;
                        }

                        const out: Record<string, string> = {};
                        for (const r of rows2 as { property: string; value: string }[]) {
                            out[r.property] = r.value;
                        }
                        resolve(out);
                    });
                } else {
                    resolve(result);
                }
            });
        });
    },

    updateProperty: async (element, property, value) => {
        const deleteSQL = "DELETE FROM elements WHERE element = ? AND property = ?";
        const insertSQL = "INSERT INTO elements (element, property, value) VALUES (?, ?, ?)";

        return new Promise<boolean>((resolve) => {
            db.serialize(() => {
                db.run(deleteSQL, [element, property], function (delErr) {
                    if (delErr) {
                        console.error("Error deleting existing property:", delErr);
                        resolve(false);
                        return;
                    }

                    db.run(insertSQL, [element, property, value], function (insErr) {
                        if (insErr) {
                            console.error("Error inserting property:", insErr);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                });
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
                            db.run(
                                "INSERT INTO elements (element, property, value) VALUES (?, ?, ?)",
                                [element, property, String(value)],
                                function () {
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
