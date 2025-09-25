import { db } from "./database";
import { elements } from "../modules/elements";

// Simple runtime migration to align DB with current code defaults
// - Renames property 'fillWhenChecked' -> 'fill' wherever found
// - Ensures a default 'fill' value exists for 'checkboxElement'
export async function runMigrations(): Promise<void> {
  await ensureElementsTable();
  await renameFillWhenChecked();
  await ensureCheckboxFillDefault();
}

function exec(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params as any, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function get<T = any>(sql: string, params: unknown[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    db.get(sql, params as any, (err: any, row: T) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function ensureElementsTable() {
  // In case the DB file is new or missing the table, create it
  await exec(
    `CREATE TABLE IF NOT EXISTS elements (
      element TEXT NOT NULL,
      property TEXT NOT NULL,
      value TEXT NOT NULL
    )`
  );
}

async function renameFillWhenChecked() {
  // Rename legacy property to the new name
  await exec(`UPDATE elements SET property = 'fill' WHERE property = 'fillWhenChecked'`);
}

async function ensureCheckboxFillDefault() {
  // Make sure checkboxElement has a 'fill' property row; insert default if missing
  const row = await get<{ c: number }>(
    `SELECT COUNT(*) as c FROM elements WHERE element = ? AND property = ?`,
    ['checkboxElement', 'fill']
  );
  if (!row || !row.c) {
    const def = elements.checkboxElement.fill ? 'true' : 'false';
    await exec(
      `INSERT INTO elements (element, property, value) VALUES (?, ?, ?)`,
      ['checkboxElement', 'fill', def]
    );
  }
}
