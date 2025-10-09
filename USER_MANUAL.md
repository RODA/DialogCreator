# Dialog Creator — User Manual

This document describes how to use the Dialog Creator editor window to design dialogs by adding and arranging UI elements on a canvas.

- Platform: Desktop (Electron)
- Primary file: `src/pages/editor.html`

## Overview of the interface

The editor window is divided into four main areas:

1. Elements panel (left)
   - Shows the list of available element types.
   - Click any item to add a new element instance to the dialog canvas.
   - A "Default values" button opens a window where default properties per element type can be managed.

2. Editor toolbar (top of center)
   - Provides arrange (Z-order) actions for the currently selected element:
     - Send to back
     - Send backward
     - Bring forward
     - Bring to front
   - Grouping actions:
     - Group selected (enabled when 2+ elements are selected)
     - Ungroup (enabled when a group is selected)
   - Buttons enable/disable contextually depending on the current selection.

3. Dialog canvas (center)
   - The working area where elements are placed and arranged.
   - Click an element to select it. Click the empty canvas to clear the selection.
   - Drag a selected element to reposition it. Movement is constrained within the canvas with a small padding.

4. Properties panel (right)
   - Displays properties for the selected element.
   - Only properties relevant to the selected element type are shown and enabled.
   - Includes an Actions section with a Conditions button and a Remove button.

## Keyboard shortcuts

Arrange (Z-order):
- Cmd/Ctrl + ↑: Bring forward
- Cmd/Ctrl + Shift + ↑: Bring to front
- Cmd/Ctrl + ↓: Send backward
- Cmd/Ctrl + Shift + ↓: Send to back

Grouping:
- Cmd/Ctrl + G: Group selected
- Cmd/Ctrl + Shift + G: Ungroup selected group

Movement (nudge):
- Arrow keys: Move selected element(s) by 1px
- Shift + Arrow keys: Move selected element(s) by 10px

Global:
- Cmd/Ctrl + A: Select all elements on the canvas (Editor window)
  - In the Conditions window, Cmd/Ctrl + A selects only the condition rules textarea.

Notes:
- Shortcuts only apply when at least one element is selected and focus is not inside a text field (unless stated otherwise).
- Cmd/Ctrl modifiers are reserved for arrange and grouping actions; nudging uses arrows without Cmd/Ctrl.
- When multiple elements are selected, nudging moves all selected elements together.

### Shortcuts cheatsheet

![Shortcuts cheatsheet](docs/shortcuts-cheatsheet.svg)

## Working with elements

### Add a new element
- In the Elements panel (left), click the element type you want to add. It will be inserted on the dialog canvas with default properties.

### Select an element
- Click an element on the canvas to select it.
- A selected element is highlighted with a dotted outline.
- The arrange toolbar buttons enable when an element is selected.

### Deselect elements
- Click on an empty area of the dialog canvas to clear the selection.
- The arrange toolbar buttons and the Remove button become disabled.

### Move an element
- Click and drag an element to reposition it.
- Movement is constrained within the dialog canvas with a small margin.
- Use Arrow keys to nudge by 1px; hold Shift for 10px steps (when an element is selected and focus is not in an input).
- The cursor changes to indicate dragging.

### Remove an element
- Press Delete/Backspace (when the focus is not inside a text field) to remove the selected element, or
- Click the Remove button in the Actions section of the Properties panel.

## Preview window
- Opens from the File menu (Preview) and renders the dialog with live interactions.
- Disabled elements remain fully visible, only greyed out (no opacity fade). Native inputs/selects retain the exact same size when disabled.
- ESC closes popovers (like color pickers) and also closes the Preview window.

### Custom JS code — quick start

Some dialogs have complex behaviors that require custom JavaScript code. The editor provides a code window for writing and testing such code. This code runs at the top level automatically, with a dedicated, provided `ui` API.

Elements can be referred to by their Name (ID) either quoted or not. For example, `ui.value(input1)` is the same as `ui.value('input1')`. If a name is not found, reads return `null` (or a safe default) and writes are ignored.

Common patterns you can copy/paste:

1) Log an input's value when it changes

```javascript
ui.on(input1, 'change', () => {
  ui.log('input1 changed to:', ui.value(input1));
});
```

2) Show or hide a label when a checkbox is toggled

```javascript
ui.on(checkbox1, 'click', () => {
  ui.show(label1, ui.checked(checkbox1));
});
```

Which is equivalent to:

```javascript
ui.on(checkbox1, 'click', () => {
  if (ui.checked(checkbox1)) {
    ui.show(label1);
  } else {
    ui.hide(label1);
  }
});
```

Note that this type of logic can also be done with Conditions (no code needed), for example the Conditions for the element label1 could be:

```
show if checkbox1 == checked;
hide if checkbox1 != checked;
```

Whenever the Conditions and the Custom JS code conflict, the Custom JS code takes precedence.

3) Read a select value
```javascript
ui.on(countrySelect, 'change', () => {
  ui.log('Country:', ui.value(countrySelect));
});
```

4) Update text programmatically
```javascript
ui.text(statusLabel, 'Ready');
// or
ui.value(statusLabel, 'Ready');
```

Events:
  - Buttons and custom checkboxes/radios usually use `'click'`.
  - Text inputs can use `'change'` (on blur) or `'input'` (as you type).
  - Selects use `'change'`.

Programmatic events:
  - You can simulate user events with `ui.trigger(name, 'click' | 'change')`.
    - `'click'` on a Checkbox/Radio behaves like a real click: it toggles the control and re-evaluates conditions.
    - `'change'` dispatches the event to inputs/selects without modifying the current value by itself.

Advanced (optional): lifecycle hooks
  - If you define `exports.init = (ui) => { ... }`, it's called after your top‑level code runs.
  - If you define `exports.dispose = (ui) => { ... }`, it's called when the Preview closes or re-renders.
  Use it if you set timers or attach your own global listeners.
  - Handlers added via `ui.on(...)` are cleaned up for you automatically.


### Scripting API (ui) — reference

Methods
- ui.el(name): HTMLElement | null
  - Returns the wrapper (outer) element for a named element.
  - Example: `const el = ui.el(myLabel);`

- ui.inner(name): HTMLElement | null
  - Returns the inner element (first child) inside the wrapper. Useful for native inputs/selects hosted inside wrappers.
  - Example: `const input = ui.inner(myInput);`

- ui.type(name): string | null
  - Returns the element type, e.g. "Input", "Label", "Select", "Checkbox", "Radio", "Counter", "Slider", "Button".

- ui.id(name): string | null
  - Returns the DOM id attribute of the wrapper.

- ui.log(...args): void
  - Logs to the Editor console (visible during Preview). Strings and objects are supported.

- ui.get(name, prop): unknown
  - Generic getter. Behavior depends on element type:
    - Input: returns the current text value
    - Label: returns the text content
    - Select: returns the selected value
    - Checkbox: returns a boolean for checked state
    - Radio: returns a boolean for selected state
    <!-- - Other types: returns `data-*` via dataset when present (e.g., `ui.get(el, 'isVisible')`) -->
  - Counter: `ui.get(counter, 'value')` returns the numeric value.

- ui.set(name, prop, value)
  - Generic setter. Supported combos:
    - Input: prop = 'value' sets the text
    - Label: prop = 'value' sets the text
    - Select: prop = 'value' selects by value
    - Checkbox: prop = 'checked' sets checked state (boolean)
    - Radio: prop = 'selected' sets selected state (boolean)
    - Counter: prop = 'value' sets the number within its min/max
  - Unsupported combos are ignored and a one-time warning is logged to the Editor console.

- ui.text(name) and ui.text(name, value)
  - Convenience for getting/setting an element's "value/text".
  - Equivalent to `ui.value(...)`.

- ui.value(name) and ui.value(name, value)
  - Same as `ui.text(...)` above. For Checkbox/Radio use `ui.checked(name)` to read state.
  - For Counter, `ui.value(counter)` returns a number.

- ui.checked(name): boolean
  - For Checkbox/Radio, returns the live checked/selected state.

- ui.check(name) / ui.uncheck(name)
  - Convenience methods for Checkbox and Radio elements to set on/off.
  - For Radio, `ui.check(name)` also unselects other radios in the same group.
  - These do not dispatch events by themselves; they only change state. If you want event handlers to run, use `ui.trigger(...)`.

- ui.isVisible(name): boolean
  - Returns whether the element is currently visible (display not set to 'none').

- ui.isEnabled(name): boolean
  - Returns whether the element is currently enabled (not marked as disabled).

- ui.show(name) / ui.show(name, on = true)
  - Shows the element by toggling its display. Hidden elements are not interactive.

- ui.hide(name)
  - Hides the element, similar to `ui.show(name, false)`.

- ui.enable(name) / ui.enable(name, on = true)
  - Enables the element. Disabled elements remain visible but are non-interactive.

- ui.disable(name)
  - Disables the element, similar to `ui.enable(name, false)`.

- ui.on(name, event, (ev, el) => { ... })
  - Add an event listener to the wrapper element. The handler receives the original event and the wrapper element.
  - Clean-up is automatic when the window re-renders or closes.

- ui.trigger(name, event)
  - Dispatch a synthetic event on the element without directly changing its state.
  - Supported events: `'click'`, `'change'`.
  - Notes:
    - For Checkbox/Radio, triggering `'click'` behaves like a user click (the control toggles via its built-in logic and conditions are re-evaluated).
    - Triggering `'change'` on inputs/selects notifies listeners but does not change the current value by itself.

Element-specific notes and examples
- Input
  - Read: `ui.value(myInput)` -> string
  - Write: `ui.value(myInput, 'hello')`
  - Events: 'change' (on blur) or 'input' (as you type)

- Label
  - Read: `ui.text(myLabel)` -> string
  - Write: `ui.text(myLabel, 'New text')`

- Select
  - Read: `ui.value(mySelect)` -> string
  - Write: `ui.value(mySelect, 'RO')`
  - Event: 'change'

- Checkbox
  - Read state: `ui.checked(myCheckbox)` -> boolean
  - Write state: `ui.check(myCheckbox)` and `ui.uncheck(myCheckbox)`
  - Event: 'click'

- Radio
  - Read state: `ui.checked(myRadio)` -> boolean
  - Write state: `ui.check(myRadio)` and `ui.uncheck(myRadio)`
  - Event: 'click'

- Counter
  - Set value within its min/max: `ui.value(myCounter, 7)` or `ui.set(myCounter, 'value', 7)`
  - Read current number: `ui.value(myCounter)` or `ui.get(myCounter, 'value')`

- Button
  - Pressed feedback is built-in in Preview; your handler can trigger other UI changes.
  - Event: 'click'

- Slider
  - Dragging is supported in Preview. To react to changes, listen on the wrapper or the handle's mouseup.

Practical patterns
- Show a panel when a checkbox is checked:
```javascript
ui.on(myCheckbox, 'click', () => {
  ui.show(myPanel, ui.checked(myCheckbox));
});
```

- Mirror an input's text to a label on change:
```javascript
ui.on(myInput, 'change', () => {
  ui.text(myLabel, ui.value(myInput));
});
```

Notes
- Conditions and Custom JS can both control visibility/enabled state. If they conflict at runtime, the last action wins; in practice, your Custom JS will take precedence right after it runs.
- Programmatic state changes (e.g., `ui.check`, `ui.value`, `ui.set`) do not automatically dispatch events. Use `ui.trigger` when you need to notify event handlers.

## Syntax window
- Opens from the File menu (Syntax) or via the dedicated button when enabled.
- Shows an Elements table; clicking a row inserts a token like {name} into the textarea for building commands.
- Text persists within the session; use Save & Close to send the text back to the editor.

## File menu actions
- New: Optionally saves current work, then clears the canvas.
- Load dialog: Load a dialog JSON file into the editor.
- Save dialog: Export the current dialog to JSON.
- Preview: Open the live preview window.

## Multi-selection and grouping

### Select multiple elements
- Shift + Click to add or remove elements from the current selection.
- Lasso selection: Click and drag on an empty area of the dialog canvas to draw a selection rectangle. All elements overlapping the rectangle are selected.
  - Hold Shift while lassoing to add to the existing selection instead of replacing it.

### Move multiple elements together (ephemeral selection)
- When two or more elements are selected (but not grouped), dragging any selected element will move all selected elements together.
- Arrow key nudging also moves all selected elements together.
- In the Properties panel, the Type field shows "Multiple selection" and only Left and Top are editable; changing these moves the whole selection.

### Group selection (persistent group)
- To lock a multi-selection into a single movable unit, click the Group button in the toolbar or press Cmd/Ctrl + G.
- A group container is created around the selected elements. Selecting a child of a group selects the whole group.
- Groups can be moved and nudged like individual elements.

### Ungroup
- Select the group container and click Ungroup in the toolbar or press Cmd/Ctrl + Shift + G to return the elements to the top level. The former members remain selected.

### Conditions (per element)
- With an element selected, click Conditions in the Actions section to open the conditions window.
- Use the conditions window to define dynamic behaviors for the selected element. (Details depend on the project's conditions UI.)

## Dialog-level properties

In the "Dialog's properties" area (above the Properties panel), you can edit:
- Name
- Title
- Width
- Height
- Font size

Behavior:
- Width and Height take effect when the field loses focus (after editing it, click elsewhere or press Enter to blur).
- Font size updates the typography of supported elements across the dialog.

## Element types and key properties

Below is a summary of element types supported by the editor and their notable properties. The Properties panel only shows fields relevant to the selected element type.

- Button
  - Label (text)
  - Color
  - Width (max)
  - Lines (max) — line clamp for the label text

- Input
  - Value (text)
  - Width, Height

- Select
  - Value(s)
  - Width
  - Arrow color (dropdown indicator)
  - Data source (Custom or R workspace)

- Checkbox
  - Checked
  - Fill (when checked)
  - Color
  - Size

- Radio
  - Size
  - Color
  - Group
  - Selected

- Counter
  - Start Val, Max val
  - Space (padding between arrows and value)
  - Color (affects arrows)

- Slider
  - Width, Height
  - Direction (horizontal/vertical)
  - Handle properties: Position (%), Shape (triangle or circle), Color, Size

- Label
  - Value (text)

- Separator
  - Width, Height
  - Color

- Container
  - Width, Height
  - Object class (Dataset or Variable)

## Arrange (Z-order) actions

Use the toolbar or keyboard shortcuts to change the stacking order of the selected element:
- Send to back: places the element behind all others in the canvas.
- Send backward: moves the element one step backward in stacking order.
- Bring forward: moves the element one step forward in stacking order.
- Bring to front: places the element above all others in the canvas.

These actions are disabled when no element is selected.

## Tips & notes

- Press Enter while editing a property field to commit changes (the editor will blur the field to trigger the update).
- Some numeric fields are constrained (e.g., size within the canvas, line clamp limited to a small maximum). If a value is out of range, the editor will adjust it automatically.
- Element Name (ID) must be unique. If a duplicate is entered, it will be rejected and an error shown.
- Visibility (isVisible) and Enabled (isEnabled) toggles affect how elements render and behave in the editor.
- Grouping is an editor convenience: when exporting or previewing, groups are flattened and only individual elements (with absolute positions) are saved.

## Troubleshooting

- Arrange buttons are disabled
  - Ensure an element is selected. Click an element on the canvas.

- Delete key doesn't remove the element
  - Make sure focus isn't inside a text field. Click on the canvas and try again.

- Property change seems ignored
  - Most properties apply on blur (when the input loses focus). Press Enter or click elsewhere to commit.

## Appendix: Icons used in the toolbar

The toolbar uses SVG icons from `src/assets/`:
- selection-bottom-symbolic.svg — Send to back
- selection-lower-symbolic.svg — Send backward
- selection-raise-symbolic.svg — Bring forward
- selection-top-symbolic.svg — Bring to front

