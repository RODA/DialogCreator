"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { buildSync } = require("esbuild");

const root = path.resolve(__dirname, "..");
const compiled = buildSync({
    stdin: {
        resolveDir: root,
        contents: [
            'export { validateDialogJsonForSave, validateDialogElementAnchorMetadata }',
            '    from "./src/core/document/dialogDocumentRules";',
            'export { createDialogPackage, readDialogPackage, readDialogFiles }',
            '    from "./src/core/dialog-package/dialogPackageFormat";',
            'export { createBrowserDialogPackage, readBrowserDialogPackage }',
            '    from "./src/shell-web/browserDialogFileStore";'
        ].join("\n")
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "es2022",
    write: false
});
const contract = { exports: {} };
new Function("module", "exports", compiled.outputFiles[0].text)(contract, contract.exports);
const {
    validateDialogJsonForSave,
    validateDialogElementAnchorMetadata,
    createDialogPackage,
    readDialogPackage,
    readDialogFiles,
    createBrowserDialogPackage,
    readBrowserDialogPackage
} = contract.exports;

const input = { id: "input-id", type: "Input", nameid: "field" };
const label = {
    id: "label-id",
    type: "Label",
    nameid: "caption",
    value: "A caption",
    anchorTarget: input.id
};
const makeDialog = function(elements) {
    return { properties: { name: "AnchorDocument", title: "Anchor document" }, elements };
};
const valid = makeDialog([input, label]);

const checkRejectedSave = function(dialog, reason) {
    const json = JSON.stringify(dialog);
    assert.throws(() => validateDialogJsonForSave(json), reason);
    for (const requestedName of [undefined, "ExistingName.dc.zip"]) {
        const result = createBrowserDialogPackage(json, requestedName);
        assert.equal(result.ok, false, "Browser Save must use the shared document validator");
        assert.match(result.reason, reason);
    }
};

const main = async function() {
    const legacy = makeDialog([{ ...input }, {
        id: "absolute-id", type: "Label", nameid: "absolute", left: 30, top: 40
    }]);
    assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(legacy)));
    assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(valid)));
    assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(makeDialog([
        input,
        { ...label, anchorTarget: "", anchorGap: null, anchorPosition: "sideways" }
    ]))), "Inactive anchor fields must not invalidate legacy absolute labels");

    for (const groupMembers of [[input.id, label.id], `${input.id},${label.id}`]) {
        const grouped = makeDialog([
            { id: "group-id", type: "Group", elementIds: groupMembers }, input, label
        ]);
        assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(grouped)),
            "A same-group attachment should accept array and legacy comma-separated membership");
    }

    const invalidRelations = [
        [makeDialog([input, { ...label, anchorTarget: "missing-id" }]), /caption: .*missing-id.*not found/],
        [makeDialog([input, { ...label, anchorTarget: label.id }]), /caption: .*attached to itself/],
        [makeDialog([input, label, {
            id: "group-id", type: "Group", elementIds: [label.id]
        }]), /caption: .*same group or both on the canvas/],
        [makeDialog([input, label, {
            id: "group-a", type: "Group", elementIds: [label.id]
        }, {
            id: "group-b", type: "Group", elementIds: [input.id]
        }]), /caption: .*same group or both on the canvas/],
        [makeDialog([{ ...input, type: "Group" }, label]), /caption: .*targets must be non-group elements/]
    ];
    for (const [dialog, reason] of invalidRelations) {
        checkRejectedSave(dialog, reason);

        // A repairable relationship must remain inspectable when opening a
        // package. Its active metadata is valid; Save requires the repair.
        assert.doesNotThrow(() => readDialogFiles(JSON.stringify(dialog)));
        assert.doesNotThrow(() => readDialogPackage(createDialogPackage(JSON.stringify(dialog))));
    }

    const malformedMetadata = [
        ["anchorTarget", [input.id], /target must be an element id/],
        ["anchorTarget", null, /target must be an element id/],
        ["anchorTarget", 12, /target must be an element id/],
        ["anchorPosition", ["left"], /position must be/],
        ["anchorPosition", "sideways", /position must be/],
        ["anchorAlign", ["middle"], /alignment must be/],
        ["anchorAlign", "center", /alignment must be/],
        ["anchorGap", null, /gap must be a finite number/],
        ["anchorGap", true, /gap must be a finite number/],
        ["anchorOffset", "invalid", /offset must be a finite number/]
    ];
    for (const [field, value, reason] of malformedMetadata) {
        const dialog = makeDialog([input, { ...label, [field]: value }]);
        const json = JSON.stringify(dialog);
        checkRejectedSave(dialog, reason);
        assert.throws(() => validateDialogElementAnchorMetadata(dialog), reason);
        assert.throws(() => readDialogFiles(json), reason,
            "Native directory reads must validate raw metadata before dataset conversion");

        const bytes = createDialogPackage(json);
        assert.throws(() => readDialogPackage(bytes), reason,
            "Archive reads must validate raw metadata before dataset conversion");
        const result = await readBrowserDialogPackage(new File([bytes], "Malformed.dc.zip"));
        assert.equal(result.ok, false);
        assert.match(result.reason, reason);
    }
    checkRejectedSave(makeDialog([{ ...input, type: "Group", anchorTarget: label.id }, label]), /Only non-group elements/);
    assert.throws(() => readDialogFiles(JSON.stringify(makeDialog([
        { ...input, type: "Group", anchorTarget: label.id }, label
    ]))), /Only non-group elements/);

    const labelTarget = { id: "label-target", type: "Label", nameid: "rootCaption", value: "Target" };
    const validGraphs = [];
    for (const type of ["Input", "Button", "Select", "Checkbox", "Radio", "Counter", "Container", "Choice", "Slider", "Separator", "Label"]) {
        const attached = { id: "attached-id", type, nameid: "attachedControl", anchorTarget: labelTarget.id };
        const dialog = makeDialog([attached, labelTarget]);
        assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(dialog)),
            `${type} should be allowed to attach to a label`);
        validGraphs.push(dialog);
    }
    const chain = makeDialog([
        { id: "last", type: "Input", nameid: "last", anchorTarget: "button" },
        { id: "button", type: "Button", nameid: "button", anchorTarget: label.id },
        label,
        input
    ]);
    assert.doesNotThrow(() => validateDialogJsonForSave(JSON.stringify(chain)),
        "A reverse-document-order mixed control/label chain should save");
    validGraphs.push(chain);

    const cycles = [
        makeDialog([{ ...input, anchorTarget: label.id }, label]),
        makeDialog([
            { id: "a", type: "Label", nameid: "Alpha", anchorTarget: "b" },
            { id: "b", type: "Button", nameid: "Beta", anchorTarget: "c" },
            { id: "c", type: "Input", nameid: "Gamma", anchorTarget: "a" }
        ])
    ];
    for (const dialog of cycles) {
        checkRejectedSave(dialog, /Attachment cycle:/);
        assert.doesNotThrow(() => validateDialogElementAnchorMetadata(dialog),
            "A cycle has readable metadata even though its graph must be repaired");
        assert.doesNotThrow(() => readDialogFiles(JSON.stringify(dialog)));
        const opened = await readBrowserDialogPackage(new File([
            createDialogPackage(JSON.stringify(dialog))
        ], "CycleForRepair.dc.zip"));
        assert.equal(opened.ok, true, "Cycles must remain openable for repair");
    }
    assert.throws(() => validateDialogJsonForSave(JSON.stringify(cycles[1])),
        /Alpha → Beta → Gamma → Alpha/, "Save errors should identify the complete named cycle");
    const mixedGraph = makeDialog([
        { id: "dependent", type: "Input", nameid: "Dependent", anchorTarget: "a" },
        ...cycles[1].elements,
        { id: "independent", type: "Button", nameid: "Independent", anchorTarget: labelTarget.id },
        labelTarget
    ]);
    assert.throws(() => validateDialogJsonForSave(JSON.stringify(mixedGraph)), (error) => {
        assert.match(error.message, /Dependent: Cannot attach/);
        assert.match(error.message, /Attachment cycle:/);
        assert.doesNotMatch(error.message, /Independent:/,
            "A valid independent branch must not be included in graph diagnostics");
        return true;
    });

    for (const dialog of [legacy, valid, ...validGraphs]) {
        const json = JSON.stringify(dialog);
        const saved = createBrowserDialogPackage(json, "ExistingName.dc.zip");
        assert.equal(saved.ok, true);
        assert.equal(saved.fileName, "ExistingName.dc.zip");
        const loaded = await readBrowserDialogPackage(new File([saved.bytes], saved.fileName));
        assert.equal(loaded.ok, true);
        assert.deepEqual(JSON.parse(loaded.json).elements, dialog.elements,
            "Valid legacy and attached packages should preserve authored element metadata");
    }

    const missingTarget = invalidRelations[0][0];
    const repairable = await readBrowserDialogPackage(new File([
        createDialogPackage(JSON.stringify(missingTarget))
    ], "Repairable.dc.zip"));
    assert.equal(repairable.ok, true, "Browser Open must allow missing-target attachments for repair");

    console.log("Element anchor document rules passed: all control types, graph validation, repairable Open, raw metadata and legacy packages.");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
