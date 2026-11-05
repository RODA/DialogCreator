# Element anchoring package contract

Absolute `left` and `top` positioning remains the default. Any individual
non-Group element can optionally attach to another element using these fields
in `dialog.json`:

| Field | Value | Default when attached |
| --- | --- | --- |
| `anchorTarget` | Stable element `id` of the target | Empty or absent means absolute |
| `anchorPosition` | `left`, `right`, `above`, `below` | `left` |
| `anchorGap` | Finite signed distance in pixels | `10` |
| `anchorAlign` | `start`, `middle`, `end` | `middle` |
| `anchorOffset` | Finite signed cross-axis distance in pixels | `0` |

`ElementAnchorProperties` and `ELEMENT_ANCHOR_PROPERTY_TYPES` in
`src/core/layout/elementAnchoring.ts` declare these optional fields. The runtime
property schema includes them, while active values use the shared attachment
parser for validation. They are document-instance metadata, not catalog defaults.

For example, this Label stays 10px to the left of `input-id`, with their vertical
centres aligned:

```json
{
    "id": "caption-id",
    "type": "Label",
    "nameid": "caption",
    "value": "Dataset name",
    "left": 30,
    "top": 50,
    "anchorTarget": "input-id",
    "anchorPosition": "left",
    "anchorGap": 10,
    "anchorAlign": "middle",
    "anchorOffset": 0
}
```

Sources and targets can be Button, Input, Select, Checkbox, Radio, Counter,
Slider, Label, Separator, Container, or Choice elements. The source and target
must have the same immediate parent: both on the canvas, or both in the same
persistent group. Groups cannot be sources or targets. Renaming a target's
`nameid` leaves its stable `id` reference intact. Duplicating a group remaps its
internal references to the duplicated elements.

## Dependencies and validation

An attached element can itself be a target. For example, a Label can follow an
Input that follows a Button. The graph is resolved in target-first order so
the Label follows the Input's final measured position.

Self-references and direct or transitive cycles are invalid. If `A` follows
`B`, and `B` follows `C`, then attaching `C` to `A` is rejected. The authoring
dropdown retains such candidates as disabled options marked
`(circular reference)`, with the dependency path in the tooltip. Other invalid
dependencies are marked `(unavailable)` with their reason.

An authoring change is validated before any metadata is changed. A rejected
change preserves the previous model and displays its error. Imported invalid
relationships remain visible for repair, including the current invalid target;
they never silently become absolute positioning. Cyclic elements and elements
that depend on an invalid relationship retain their fallback or last position.
Unrelated valid components continue to resolve. Save requires a valid graph or
detaching the affected elements.

## Geometry

The pure resolver is `src/core/layout/elementAnchoring.ts`. All coordinates are
local to the common parent. Let `E` be the measured attached element box and `T` the target
box, and let `f` be 0, 0.5, or 1 for start, middle, or end:

- Left: `x = T.left - gap - E.width`.
- Right: `x = T.left + T.width + gap`.
- Left/right: `y = T.top + (T.height - E.height) * f + offset`.
- Above: `y = T.top - gap - E.height`.
- Below: `y = T.top + T.height + gap`.
- Above/below: `x = T.left + (T.width - E.width) * f + offset`.

Fractional positions and negative distances are supported. Resolved positions
are not clamped to the canvas. A Label's own H/V text alignment remains a
separate property. Text uses its displayed clamped box when measured; attaching
or detaching does not change an element's dimensions.

A Label's `maxWidth` is a limit. Wrapped text that fits within its line limit
uses the widest displayed line plus the normal label insets, preserving the
same line breaks. Text that exceeds the line limit keeps enough width for its
clamping and ellipsis. Attachment gaps apply to these measured control boxes.

The shared DOM controller, `src/library/elementAnchoring.ts`, applies this resolver
in both the editor and Preview after measuring the current text, fonts, and
controls. Translation, text changes, font changes, target resizing, and group
movement therefore follow the same rules. Hidden controls retain layout
geometry; target visibility does not control an attached element's visibility.

## Editing and persistence

While attached, Left/Top display the calculated position and are read-only.
Dragging or nudging the element changes its gap and offset. Moving linked
elements together preserves their attachment distances. Detaching retains the
current calculated position as the new absolute Left/Top.

An attached element's serialized Left/Top remain its authored fallback position.
Measured coordinates are never written back during layout or Preview. Absolute
elements omit all five anchoring fields on new writes. Existing packages without
these fields retain their positioning behavior.

Malformed active metadata is rejected before normal package loading can coerce
it into DOM strings. Missing, cyclic, or otherwise invalid relationships can
be opened for repair with explicit errors. Attachment fields belong to the
dialog document and are not element-catalog defaults.

## Verification and consumer adoption

- `npm run test:anchoring`: pure geometry, graph validation, metadata, package
  reads, and browser save validation.
- `npm run test:rendered:anchoring`: browser editor interactions, package
  save/reopen, translated Preview geometry, intrinsic and hidden controls, and
  fractional layout settlement, mixed dependency chains, and cycle handling.
- `npm run test:rendered:electron:anchoring`: native editor and Preview checks
  using a private catalog copy and application profile.

DialogForge adoption is a separate change. A consumer must implement this same
package and geometry contract, with translated measured text and its actual
control boxes, before using attached elements. It must not add dialog-specific
position corrections. Older consumers that ignore these optional fields will
render the authored fallback Left/Top instead.
