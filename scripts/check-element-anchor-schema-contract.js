"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transformSync } = require("esbuild");

const root = path.resolve(__dirname, "..");
const sourceOption = process.argv.indexOf("--renderer-source");
const rendererSource = sourceOption < 0
    ? path.join(root, "src/library/renderutils.ts")
    : path.resolve(process.argv[sourceOption + 1]);

const loadSource = function(file, imports = {}) {
    const compiled = transformSync(fs.readFileSync(file, "utf8"), {
        loader: "ts", format: "cjs", target: "es2022"
    });
    const module = { exports: {} };
    const requireImport = function(name) {
        assert.ok(Object.hasOwn(imports, name), `Unexpected schema dependency: ${name}`);
        return imports[name];
    };
    new Function("module", "exports", "require", compiled.code)(
        module, module.exports, requireImport
    );
    return module.exports;
};

const anchorContract = loadSource(path.join(root, "src/core/layout/elementAnchoring.ts"));
const { elements } = loadSource(path.join(root, "src/modules/elements.ts"));
const catalogBefore = structuredClone(elements);

// Execute the actual schema methods and real catalog without initializing a renderer.
// These imports belong to unrelated DOM and host operations, which this check never calls.
const { renderutils } = loadSource(rendererSource, {
    "./utils": { utils: {} },
    "../modules/dialog": { dialog: {} },
    "../modules/elements": { elements },
    "../renderer/environment": { rendererEnvironment: { reportError() {} } },
    "../library/api": { EVENT_NAMES: new Set() },
    "../core/layout/elementAnchoring": anchorContract,
    "uuid": {},
    "tippy.js": {},
    "sortablejs": {},
    "./elementAnchoring": {}
});

const expectedTypes = {
    anchorTarget: "string",
    anchorPosition: "string",
    anchorGap: "number",
    anchorAlign: "string",
    anchorOffset: "number"
};
assert.deepEqual(anchorContract.ELEMENT_ANCHOR_PROPERTY_TYPES, expectedTypes);

const schema = renderutils.buildUniformSchema();
for (const [key, type] of Object.entries(expectedTypes)) {
    assert.equal(schema[key], type, `Uniform schema must recognize optional ${key}`);
}

const metadata = {
    anchorTarget: "001",
    anchorPosition: "right",
    anchorGap: -3.5,
    anchorAlign: "middle",
    anchorOffset: 2.25
};
const templates = Object.values(elements).filter((element) => element.type !== "Group");
assert.equal(templates.length, 11, "Every current non-group element must be covered");
for (const template of templates) {
    const attached = { ...structuredClone(template), ...metadata };
    for (const [key, value] of Object.entries(attached)) {
        if (["string", "number", "boolean"].includes(typeof value)) {
            assert.ok(Object.hasOwn(schema, key), `${template.type}: unknown primitive property ${key}`);
        }
    }
    assert.deepEqual(renderutils.assertTypes(attached, { collect: true }), [],
        `${template.type}: valid attachment metadata must pass the actual type assertion`);
    assert.equal(attached.anchorTarget, "001", `${template.type}: target ids are opaque strings`);
    assert.deepEqual(renderutils.assertTypes(structuredClone(template), { collect: true }), [],
        `${template.type}: legacy records must not require attachment properties`);
    for (const key of Object.keys(expectedTypes)) {
        assert.equal(Object.hasOwn(template, key), false,
            `${template.type}: attachment metadata must not become catalog defaults`);
        assert.equal(template.$persist?.includes(key) || false, false,
            `${template.type}: attachment metadata must not become database preferences`);
    }
}

const invalidMetadata = [
    ["anchorTarget", 12, /target must be an element id/],
    ["anchorTarget", true, /target must be an element id/],
    ["anchorTarget", null, /target must be an element id/],
    ["anchorTarget", {}, /target must be an element id/],
    ["anchorPosition", 12, /position must be left, right, above, or below/],
    ["anchorPosition", "diagonal", /position must be left, right, above, or below/],
    ["anchorAlign", null, /alignment must be start, middle, or end/],
    ["anchorAlign", "center", /alignment must be start, middle, or end/]
];
for (const key of ["anchorGap", "anchorOffset"]) {
    for (const value of [null, true, [], {}, NaN, Infinity, -Infinity, "", "12px"]) {
        invalidMetadata.push([key, value, /must be a finite number/]);
    }
}
for (const [key, value, reason] of invalidMetadata) {
    const data = { ...metadata, [key]: value };
    const before = structuredClone(data);
    assert.throws(() => renderutils.assertTypes(data), reason,
        `${key}: active malformed metadata must fail before general coercion`);
    assert.deepEqual(data, before, `${key}: rejected metadata must not be coerced`);
    const errors = renderutils.assertTypes(data, { collect: true });
    assert.ok(errors.some((message) => reason.test(message)), `${key}: collect must report metadata errors`);
}

for (const anchorTarget of [undefined, "", "   "]) {
    const inactive = {
        anchorTarget, anchorPosition: "diagonal", anchorAlign: null,
        anchorGap: Infinity, anchorOffset: { unused: true }
    };
    if (anchorTarget === undefined) {
        delete inactive.anchorTarget;
    }
    const before = structuredClone(inactive);
    assert.deepEqual(renderutils.assertTypes(inactive, { collect: true }), [],
        "Absolute records must ignore inactive attachment fields");
    assert.deepEqual(inactive, before, "Inactive metadata must remain untouched");
}

for (const anchorTarget of ["001", "1e3", "false", "12"]) {
    const data = { anchorTarget, anchorGap: "-2.5", anchorOffset: "+3.25" };
    assert.deepEqual(renderutils.assertTypes(data, { collect: true }), [],
        "Legacy finite numeric distances must remain accepted");
    assert.equal(data.anchorTarget, anchorTarget, "Numeric-looking target ids must remain strings");
    assert.equal(anchorContract.readElementAnchor(data).gap, -2.5);
}

const complete = Object.fromEntries(Object.entries(schema)
    .filter(([key]) => !Object.hasOwn(expectedTypes, key))
    .map(([key, type]) => [key, { string: "", number: 0, boolean: false }[type]]));
assert.deepEqual(renderutils.assertTypes(complete, { strictPresence: true, collect: true }), [],
    "Strict presence must not turn optional attachment fields into required properties");
const requiredKey = Object.keys(complete)[0];
delete complete[requiredKey];
assert.ok(renderutils.assertTypes(complete, { strictPresence: true, collect: true })
    .includes(`Missing expected key "${requiredKey}"`),
    "Strict presence must still enforce the original schema properties");

for (const [option, includedType] of [["includeNumbers", "string"], ["includeStrings", "number"]]) {
    const filtered = renderutils.buildUniformSchema({ [option]: false });
    for (const [key, type] of Object.entries(expectedTypes)) {
        assert.equal(Object.hasOwn(filtered, key), type === includedType,
            `${option}: attachment metadata must obey the schema type filter`);
    }
}
const skipped = renderutils.buildUniformSchema({ skipKeys: ["anchorTarget", "anchorGap"] });
assert.equal(Object.hasOwn(skipped, "anchorTarget"), false);
assert.equal(Object.hasOwn(skipped, "anchorGap"), false);
assert.equal(skipped.anchorOffset, "number");
assert.deepEqual(renderutils.buildUniformSchema({
    includeBooleans: false, includeNumbers: false, includeStrings: false
}), {});

const custom = { anchorGap: "-3.5" };
assert.deepEqual(renderutils.assertTypes(custom, {
    schema: { anchorGap: "number" }, collect: true
}), []);
assert.equal(custom.anchorGap, -3.5, "Caller schemas retain existing general coercion");
assert.throws(() => renderutils.assertTypes({}, {
    schema: { anchorGap: "number" }, strictPresence: true
}), /Missing expected key "anchorGap"/, "Caller schemas retain explicit presence requirements");
assert.deepEqual(elements, catalogBefore, "Schema construction must not mutate the catalog");

console.log("Element anchor schema passed: all 11 controls, optional metadata, validation and legacy records.");
