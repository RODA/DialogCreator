
# Dialog Creator — API Reference

Use this reference when writing custom JavaScript for Dialog Creator. It contains information about window helpers, event utilities, and data APIs available in the preview runtime.


## Scripting API — reference

`showMessage(message, detail?, type?)`

- Shows an application message dialog via the host app.
- message is the visible header; detail is the body text; type (optional) controls icon: 'info' | 'warning' | 'error' | 'question'.
- Examples:
- `showMessage('Hello')`
- `showMessage('Low disk space', 'Please free up 1GB', 'warning')`
- `showMessage('Save failed', 'The dialog failed to save your changes.', 'error')`

`getValue(name)`

- Get the element's value/text.
- Input/Label/Select/Counter return their current value; Checkbox/Radio return their current boolean state.
- Returns `null` if the element doesn't exist.

`setValue(name, value)`

- Set the value/text.
- Input/Label: set string; Counter: set number within its min/max; Select: set selected option by value; Checkbox/Radio: set boolean state.
- No-op if the element doesn't exist. Does not dispatch events automatically.

`isChecked(name)`

- For Checkbox/Radio, returns the live checked/selected state as a boolean.

`check(name)` / `uncheck(name)`

- Convenience methods for Checkbox and Radio elements to set on/off.
- For Radio, `check(name)` also unselects other radios in the same group.
- These do not dispatch events by themselves; for the handlers to run, use `triggerChange()` or `triggerClick()`.

`getSelected(name)`

- Read the current selection(s) as an array of values.
- For Select, returns a single-item array (or empty array if nothing selected).
- For Container, returns labels of all selected rows.

`isVisible(name)`: boolean

  - Returns whether the element is currently visible (display not set to 'none').

`isHidden(name)`: boolean

  - Logical complement of `isVisible(name)`.

`isEnabled(name)`: boolean

  - Returns whether the element is currently enabled (not marked as disabled).

`isDisabled(name)`: boolean

  - Logical complement of `isEnabled(name)`.

`show(name, on = true)`

  - Show or hide by boolean. Use `show(name, true)` to show; `show(name, false)` to hide.

`hide(name, on = true)`

  - Convenience inverse of show: `hide(name)` hides, `hide(name, false)` shows. Internally calls `show(name, !on)`.

`enable(name, on = true)`

  - Enable or disable by boolean. Use `enable(name, true)` to enable; `enable(name, false)` to disable.

`disable(name, on = true)`

  - Convenience inverse of enable: `disable(name)` disables, `disable(name, false)` enables. Internally calls `enable(name, !on)`.

`onClick(name, handler)`

  - Shortcut for `on(name, 'click', handler)`.

`onChange(name, handler)`

  - Shortcut for `on(name, 'change', handler)`.

`onInput(name, handler)`

  - Shortcut for `on(name, 'input', handler)`.

`setSelected(name, value)`

  - Programmatically set selection.
  - For Select elements: sets the selected option by value (single-choice).
  - For Container elements: accepts a string or array of strings and replaces the current selection with exactly those labels.
  - Does not dispatch a `change` event automatically. For the handlers to run, call `triggerChange(name)` after changing selection.
  - Throws a SyntaxError if the element doesn't exist, the control is missing, the option/row is not found, or the element type doesn't support selection.

`clearContent(element)`

  - Clears the content/value of supported elements.
  - Supported: Input (clears the text), Container (removes all rows).
  - Throws an error if used on unsupported types.

`setLabel(name, label)`

  - Set the visible label text of a Button element.
  - Throws a SyntaxError if the element doesn't exist or isn't a Button.

`changeValue(name, oldValue, newValue)`

  - Rename a specific item within a Container from `oldValue` to `newValue`.
  - If the item is currently selected, the container's selection mirror is updated accordingly.
  - No event is dispatched automatically; call `triggerChange(name)` for the change handlers to run.
  - Throws a SyntaxError if the element doesn't exist or isn't a Container.

`updateSyntax(command)`

  - Updates the Syntax Panel with the provided command string. The panel remains open alongside the Preview window and mirrors its width; closing either window also closes the other.
  - Content is rendered with preserved whitespace/line breaks in a monospace font.
  - If the floating Syntax Panel cannot be created, a fallback inline panel appears immediately below the Preview canvas inside the Preview window.
  - Example:

```javascript
const sel = getSelected(radiogroup1);
const cmd = construct_command(sel);
updateSyntax(cmd);
```

`run(command)`

  - Legacy no-op retained for backward compatibility. Use `updateSyntax(command)` to show commands.


Validation and highlight helpers

`addError(name, message)`

  - Show a tooltip-like validation message attached to the element and apply a visual highlight (glow). Multiple distinct messages on the same element are de-duplicated and the first one is shown. The highlight is removed automatically when all messages are cleared.

`clearError(name, message?)`

  - Clear a previously added validation message. If `message` is provided, only that message is removed; otherwise, all messages for the element are cleared.

## Element-specific notes and examples

- Input

  - Read: `getValue(myInput)`: returns a string
  - Write: `setValue(myInput, 'hello')`
  - Events: 'change' (on blur) or 'input' (as you type)

- Label

  - Read: `getValue(myLabel)`: returns a string
  - Write: `setValue(myLabel, 'New text')`

- Select

  - Read: `getValue(mySelect)`: returns a string
  - Write: `setValue(mySelect, 'RO')`
  - Event: 'change'

- Checkbox

  - Read state: `isChecked(myCheckbox)`: returns a boolean
  - Write state: `check(myCheckbox)` and `uncheck(myCheckbox)`
  - Event: 'click'

- Radio

  - Read state: `isChecked(myRadio)`: returns a boolean
  - Write state: `check(myRadio)` and `uncheck(myRadio)`
  - Event: 'click'

- Counter

  - Set value within its min/max: `setValue(myCounter, 7)`
  - Read current number: `getValue(myCounter)`

- Button

  - Pressed feedback is built-in in Preview; the handler can trigger other UI changes.
  - Event: 'click'

- Slider
  - Dragging is supported in Preview, and sliders react to changes.


Practical patterns

- Conditional show a panel when a checkbox is checked:

```javascript
onClick(myCheckbox, () => {
  show(myPanel, isChecked(myCheckbox));
  // or: hide(myPanel, isUnchecked(myCheckbox))
});
```

- Mirror an input's text to a label on change:

```javascript
onChange(myInput, () => setValue(myLabel, getValue(myInput)) );
```

- Select a value in a Select (no auto-dispatch), then notify listeners:

```javascript
setSelected(countrySelect, "RO");
triggerChange(countrySelect);
```

- Conditional enable/disable situations:

```javascript
onClick(lockCheckbox, () => {
  disable(saveBtn, isChecked(lockCheckbox)); // disable when locked
  // Equivalent forms:
  // enable(saveBtn, isUnchecked(lockCheckbox));

  // Unconditional forms:
  // enable(saveBtn);             // just enable
  // disable(saveBtn);            // just disable
});
```

- Replace a Container's selection (multi-select) and notify listeners:

```javascript
setSelected(variablesContainer, ["Sepal.Width"]);
triggerChange(variablesContainer);
```

- Add or remove items in a Container:

```javascript
addValue(variablesContainer, "Sepal.Length");
clearValue(variablesContainer, "Sepal.Width");
```

- Update a Button label and rename a Container item:

```javascript
setLabel(runBtn, "Run Analysis");
changeValue(variablesContainer, "Sepal.Length", "Sepal Len");
```

Notes

- Programmatic state changes (e.g., `check`, `setValue`) do not automatically dispatch events. Use `triggerChange()` or `triggerClick()` if the dialog should behave as if the user had interacted with the element.
- The selection command (`setSelected`) also does not auto-dispatch, but it can be paired with `triggerChange(name)` to trigger a change event.
- Validation helpers (`addError`, `clearError`) are purely visual aids in Preview; they do not block execution or change element values.

## Populate container contents

Containers can show rows populated via API. For example:

```javascript

setValue(container1, listDatasets());

onChange(container1, () => setValue(
  container2,
  listVariables(getSelected(container1))
));
```

`listVariables()` returns objects with both the variable label and its data type, so passing its output straight into `setValue` preserves the metadata required for type filtering.

- `setValue(container, array)` accepts an array of strings or objects shaped like `{ text, type, active }` and renders each entry as a row.
- Rows automatically adopt the container's `fontColor`, `activeBackgroundColor`, and `activeFontColor`.
- If the container's Item type is restricted, rows whose `type` metadata does not match are rendered disabled and cannot be selected.
- Containers scroll automatically when the row list exceeds the container height.

Multi-selection containers support range selection: click an item, then Shift-click another to select or deselect the entire range. Single containers toggle a single active row.

