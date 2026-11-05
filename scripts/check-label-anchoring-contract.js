"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transformSync } = require("esbuild");

const sourcePath = path.resolve(__dirname, "../src/core/layout/elementAnchoring.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = transformSync(source, { loader: "ts", format: "cjs", target: "es2022" });
const contract = { exports: {} };
new Function("module", "exports", compiled.code)(contract, contract.exports);
const {
    readElementAnchor,
    validateElementAnchor,
    resolveElementAnchorPosition,
    planElementAnchors
} = contract.exports;

const defaultAnchor = {
    target: "input-id",
    position: "left",
    gap: 10,
    align: "middle",
    offset: 0
};

assert.equal(readElementAnchor({}), null);
assert.equal(readElementAnchor({ anchorTarget: "" }), null);
assert.equal(readElementAnchor({ anchorTarget: "  " }), null);
assert.equal(readElementAnchor({
    anchorTarget: "",
    anchorGap: Infinity,
    anchorPosition: "sideways",
    anchorAlign: null
}), null, "Absolute labels should ignore inactive anchoring fields");
assert.deepEqual(readElementAnchor({ anchorTarget: "input-id" }), defaultAnchor);
assert.deepEqual(readElementAnchor({
    anchorTarget: " input-id ",
    anchorPosition: " RIGHT ",
    anchorGap: "-2.5",
    anchorAlign: " END ",
    anchorOffset: "3.25"
}), { target: "input-id", position: "right", gap: -2.5, align: "end", offset: 3.25 });

for (const target of [null, 3, true, [], {}]) {
    assert.throws(() => readElementAnchor({ anchorTarget: target }), /target must be an element id/);
}
for (const position of ["", "sideways", null, 0, true, ["left"], {}]) {
    assert.throws(() => readElementAnchor({ anchorTarget: "input-id", anchorPosition: position }),
        /position must be left, right, above, or below/);
}
for (const align of ["", "center", null, 0, true, ["middle"], {}]) {
    assert.throws(() => readElementAnchor({ anchorTarget: "input-id", anchorAlign: align }),
        /alignment must be start, middle, or end/);
}
for (const field of ["anchorGap", "anchorOffset"]) {
    for (const value of ["", "  ", "12px", "Infinity", NaN, Infinity, -Infinity, null, true, [], {}]) {
        assert.throws(() => readElementAnchor({ anchorTarget: "input-id", [field]: value }),
            /must be a finite number/, `${field} should reject ${String(value)}`);
    }
    for (const value of [-50, 0, 0.5, "-2", "+3.5"]) {
        const anchor = readElementAnchor({ anchorTarget: "input-id", [field]: value });
        assert.equal(anchor[field === "anchorGap" ? "gap" : "offset"], Number(value));
    }
}

const label = { id: "label-id", type: "Label" };
const input = { id: "input-id", type: "Input" };
const elements = [label, input];
assert.doesNotThrow(() => validateElementAnchor(label, defaultAnchor, elements));
assert.doesNotThrow(() => validateElementAnchor(label, defaultAnchor, [{ ...input, parentId: "" }]));
assert.doesNotThrow(() => validateElementAnchor(
    { ...label, parentId: "group-id" },
    defaultAnchor,
    [{ ...input, parentId: "group-id" }]
));
for (const type of ["Label", "Input", "Button", "Select", "Checkbox", "Radio", "Counter", "Container", "Choice", "Slider", "Separator", "FutureControl"]) {
    const source = { id: "source-id", type };
    assert.doesNotThrow(() => validateElementAnchor(source, defaultAnchor, [source, input]),
        `${type} should support an attachment`);
    assert.doesNotThrow(() => validateElementAnchor(label, defaultAnchor, [{ ...input, type }]),
        `${type} should be a valid attachment target`);
}
for (const type of ["Group", ""]) {
    assert.throws(() => validateElementAnchor({ ...label, type }, defaultAnchor, elements), /Only non-group elements/);
}
assert.throws(() => validateElementAnchor(label, { ...defaultAnchor, target: label.id }, elements),
    /cannot be attached to itself/);
assert.throws(() => validateElementAnchor(label, { ...defaultAnchor, target: "deleted-id" }, elements),
    /target "deleted-id" was not found/);
for (const type of ["Group", ""]) {
    assert.throws(() => validateElementAnchor(label, defaultAnchor, [{ ...input, type }]),
        /targets must be non-group elements/);
}
for (const [labelParent, targetParent] of [["group-a", "group-b"], ["group-a", ""], ["", "group-a"]]) {
    assert.throws(() => validateElementAnchor(
        { ...label, parentId: labelParent },
        defaultAnchor,
        [{ ...input, parentId: targetParent }]
    ), /same group or both on the canvas/);
}

const labelRect = { left: 0, top: 0, width: 50, height: 20 };
const targetRect = { left: 100, top: 200, width: 120, height: 40 };
const cases = [
    ["left", "start", 40, 200],
    ["left", "middle", 40, 210],
    ["left", "end", 40, 220],
    ["right", "start", 230, 200],
    ["right", "middle", 230, 210],
    ["right", "end", 230, 220],
    ["above", "start", 100, 170],
    ["above", "middle", 135, 170],
    ["above", "end", 170, 170],
    ["below", "start", 100, 250],
    ["below", "middle", 135, 250],
    ["below", "end", 170, 250]
];

for (const [position, align, left, top] of cases) {
    assert.deepEqual(resolveElementAnchorPosition(labelRect, targetRect, {
        ...defaultAnchor, position, align
    }), { left, top }, `${position}/${align} should attach the correct own edge`);
}

const caption = { left: 0, top: 0, width: 80, height: 14 };
const field = { left: 200, top: 100, width: 160, height: 28 };
const beside = resolveElementAnchorPosition(caption, field, defaultAnchor);
assert.deepEqual(beside, { left: 110, top: 107 });
assert.equal(beside.left + caption.width, field.left - 10,
    "A left caption's right edge should remain ten pixels from its control");
assert.equal(beside.top + caption.height / 2, field.top + field.height / 2,
    "A middle caption should share its control's vertical center");

const translatedCaption = { ...caption, width: 140, height: 29 };
const translated = resolveElementAnchorPosition(translatedCaption, field, defaultAnchor);
assert.deepEqual(translated, { left: 50, top: 99.5 });
assert.equal(translated.left + translatedCaption.width, beside.left + caption.width);
assert.equal(translated.top + translatedCaption.height / 2, field.top + field.height / 2);
assert.deepEqual(resolveElementAnchorPosition(caption, { ...field, left: 250, top: 220 }, defaultAnchor),
    { left: 160, top: 227 }, "Moving the control should move its caption by the same amount");

assert.deepEqual(resolveElementAnchorPosition(labelRect, targetRect, {
    ...defaultAnchor, gap: -100, offset: -3.5
}), { left: 150, top: 206.5 }, "Signed distances should preserve a drag past the control");
assert.deepEqual(resolveElementAnchorPosition(labelRect, targetRect, {
    ...defaultAnchor, position: "below", gap: -10, offset: 3.5
}), { left: 138.5, top: 230 }, "Above/below offsets should affect the horizontal axis");

for (const rect of [
    { ...labelRect, left: NaN },
    { ...labelRect, top: Infinity },
    { ...labelRect, width: -1 },
    { ...labelRect, height: -1 }
]) {
    assert.throws(() => resolveElementAnchorPosition(rect, targetRect, defaultAnchor), /Element bounds/);
    assert.throws(() => resolveElementAnchorPosition(labelRect, rect, defaultAnchor), /Anchor target bounds/);
}
assert.throws(() => resolveElementAnchorPosition(labelRect, targetRect, { ...defaultAnchor, gap: Infinity }),
    /gap and offset must be finite/);
assert.throws(() => resolveElementAnchorPosition(labelRect, targetRect, { ...defaultAnchor, offset: NaN }),
    /gap and offset must be finite/);
assert.throws(() => resolveElementAnchorPosition(labelRect, targetRect, { ...defaultAnchor, align: "center" }),
    /alignment must be start, middle, or end/);
assert.throws(() => resolveElementAnchorPosition(labelRect, targetRect, { ...defaultAnchor, position: "sideways" }),
    /position must be left, right, above, or below/);
assert.throws(() => resolveElementAnchorPosition(labelRect, {
    ...targetRect, left: 1e308, width: 1e308
}, { ...defaultAnchor, position: "right", gap: 1e308 }), /resolved element anchor position must be finite/);

const inputs = structuredClone({ labelRect, targetRect, defaultAnchor, label, elements });
resolveElementAnchorPosition(labelRect, targetRect, defaultAnchor);
validateElementAnchor(label, defaultAnchor, elements);
assert.deepEqual({ labelRect, targetRect, defaultAnchor, label, elements }, inputs,
    "Resolving and validating an anchor should not mutate the document");

const attached = function(id, target, name = id, type = "Input") {
    return { id, type, name, anchor: { ...defaultAnchor, target } };
};
const base = { id: "base", type: "Label", name: "Base caption" };
const reverseChain = [
    attached("third", "second"),
    attached("second", "first"),
    attached("first", base.id),
    base
];
const beforePlan = structuredClone(reverseChain);
assert.deepEqual(planElementAnchors(reverseChain), {
    order: ["first", "second", "third"], issues: []
}, "A reverse-document-order chain must resolve targets before dependents");
assert.deepEqual(planElementAnchors(reverseChain.slice().reverse()).order, ["first", "second", "third"]);
assert.deepEqual(reverseChain, beforePlan, "Planning must not reorder or annotate document elements");
assert.deepEqual(planElementAnchors([base, { id: "group", type: "Group" }]), { order: [], issues: [] },
    "Absolute elements require no attachment layout");

for (const cycle of [
    [attached("alpha", "alpha", "Alpha")],
    [attached("alpha", "beta", "Alpha"), attached("beta", "alpha", "Beta")],
    [attached("alpha", "beta", "Alpha"), attached("beta", "gamma", "Beta"), attached("gamma", "alpha", "Gamma")]
]) {
    const plan = planElementAnchors(cycle);
    const names = cycle.map((element) => element.name).concat(cycle[0].name);
    assert.deepEqual(plan.order, []);
    assert.equal(plan.issues.length, cycle.length);
    for (const issue of plan.issues) {
        assert.ok(issue.message.includes(names.join(" → ")), "Cycle diagnostics must show the complete named path");
    }
}
const unnamedCycle = planElementAnchors([
    { id: "a", type: "Input", anchor: { ...defaultAnchor, target: "b" } },
    { id: "b", type: "Label", anchor: { ...defaultAnchor, target: "a" } }
]);
assert.match(unnamedCycle.issues[0].message, /a → b → a/,
    "Cycle paths should fall back to stable ids when names are absent");

const mixedGraph = [
    attached("downstream-second", "downstream-first"),
    attached("downstream-first", "alpha"),
    attached("alpha", "beta", "Alpha"),
    attached("beta", "alpha", "Beta"),
    attached("valid-child", "valid-parent"),
    attached("valid-parent", base.id),
    base
];
const mixed = planElementAnchors(mixedGraph);
assert.deepEqual(mixed.order, ["valid-parent", "valid-child"],
    "A cycle must not suppress an independent valid branch");
assert.deepEqual(new Set(mixed.issues.map((issue) => issue.elementId)),
    new Set(["alpha", "beta", "downstream-first", "downstream-second"]));
assert.match(mixed.issues.find((issue) => issue.elementId === "downstream-first").message, /Cannot attach to "Alpha"/);
assert.match(mixed.issues.find((issue) => issue.elementId === "downstream-second").message, /attachment is invalid/);

const badSource = { id: "bad", type: "Input", name: "Bad input", anchorError: "Gap metadata is malformed." };
const blocked = planElementAnchors([attached("follower", badSource.id), badSource, base]);
assert.deepEqual(blocked.order, []);
assert.equal(blocked.issues.find((issue) => issue.elementId === badSource.id).message, badSource.anchorError);
assert.match(blocked.issues.find((issue) => issue.elementId === "follower").message, /Cannot attach to "Bad input"/);
for (const malformed of [false, 0, "left", [], {}, { ...defaultAnchor, gap: NaN }]) {
    const plan = planElementAnchors([
        attached("follower", "bad"), { id: "bad", type: "Input", anchor: malformed }, input
    ]);
    assert.deepEqual(plan.order, []);
    assert.ok(plan.issues.some((issue) => issue.elementId === "bad"), "Malformed planned metadata needs an explicit issue");
    assert.ok(plan.issues.some((issue) => issue.elementId === "follower"), "Malformed targets must block dependents");
}
const missing = planElementAnchors([attached("follower", "missing"), attached("child", "follower"), base]);
assert.deepEqual(missing.order, []);
assert.match(missing.issues.find((issue) => issue.elementId === "follower").message, /not found/);
assert.match(missing.issues.find((issue) => issue.elementId === "child").message, /attachment is invalid/);
const crossParent = planElementAnchors([
    { ...attached("follower", base.id), parentId: "group-id" }, base
]);
assert.deepEqual(crossParent.order, []);
assert.match(crossParent.issues[0].message, /same group or both on the canvas/);

const proposedGraph = [attached("alpha", "beta", "Alpha"), { id: "beta", type: "Label", name: "Beta" }];
assert.throws(() => validateElementAnchor(proposedGraph[1], { ...defaultAnchor, target: "alpha" }, proposedGraph),
    /Alpha → Beta → Alpha/, "Choosing a dependent as target must reject the proposed cycle");
const repair = { ...badSource, anchor: { ...defaultAnchor, target: "missing" } };
const repairSnapshot = structuredClone(repair);
assert.doesNotThrow(() => validateElementAnchor(repair, { ...defaultAnchor, target: base.id }, [repair, base]),
    "A valid proposed edge must clear its own previous parse error for repair");
assert.deepEqual(repair, repairSnapshot);
assert.doesNotThrow(() => validateElementAnchor(
    { id: "independent", type: "Input" }, { ...defaultAnchor, target: base.id }, mixedGraph
), "An unrelated cycle must not prevent editing a valid branch");

console.log("Element anchoring contract passed: geometry, all element types, dependency order, cycles, blocked dependents and repair.");
