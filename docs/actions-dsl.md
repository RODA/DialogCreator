# Dialog Actions DSL (Draft)

A tiny, dialog‑independent meta‑language for wiring UI behavior without coding. It compiles to JS against a small runtime and can target different backends (e.g., R) via adapters.

This draft uses your existing element reference syntax with curly braces, for example {button1}. Properties use the dash form {element-prop}. For list/multiselect values, use the plural {element-values}.

Status: draft for review.

---

## 1) Core concepts

- Triggers: when something happens (init, click, change, input, select, etc.).
- Statements: simple verbs to update UI/state, validate input, and call services.
- References: curly‑brace tokens that point to elements and their properties.
- Expressions: small, readable expressions that can use element references and helpers.
- Services: named adapters (e.g., R.eval) the DSL can call.

The goal is to keep the vocabulary small and dialog‑independent.

---

## 2) References with { ... } tokens

Use curly braces to point to elements by nameid. Optionally add a dash and a property name.

- {element} resolves to the default property for that element type (see table below).
- {element-prop} resolves to a specific property.
- {element-values} is the plural form for multi‑select/list containers.

Examples
- {datasetList}          → value of the select/list (default property)
- {datasetList-value}    → explicit value
- {varList-values} → array of selected values (for multiselect/list)
- {runBtn-enabled}       → boolean enabled state
- {label1-text}          → text content for a Label
- {button1-label}        → visible label text of a Button

Property aliases map to your internal dataset fields; the runtime handles the translation.

### Default property by element type

- Label → value (text content)
- Button → label
- Input → value
- Select/List → value (single select) or values (multi)
- Checkbox → checked
- Radio → selected
- Slider/Separator/Container/Counter → value if applicable, otherwise none (explicit properties required)

### Standard property names (logical DSL view)

- value: string/number (Input, Select, Label, etc.)
- values: string[] (Select/List with multiple)
- label: string (Button)
- checked: boolean (Checkbox)
- selected: boolean (Radio)
- enabled: boolean
- visible: boolean
- left/top/width/height/maxWidth/maxHeight: numbers (px)
- items/options: string[] (lists/selects)

The runtime adapts these to the concrete attributes in your codebase (e.g., isEnabled ↔ enabled, isChecked ↔ checked, etc.).

---

## 3) Triggers (events)

YAML form keeps this ergonomic and easy to compile:

- init
- click on {element}
- change on {element}
- input on {element}
- select on {element}

Example

```yaml
on:
  - when: init
    do:
      - disable {runBtn}
  - when: change on {datasetList}
    do:
      - ...
```

---

## 4) Statements (verbs)

- let name = expr                       # define/update a local variable
- set {element-prop} = expr             # set element property
- enable {element} / disable {element}
- show {element} / hide {element}
- push var with expr                    # append to a list variable
- remove var at indexExpr               # remove from list variable
- clear var                             # clear a list variable
- if: expr then: ... else: ...          # conditional block
- guard: expr else 'message'            # validate and abort handler if false
- call Service.Method { k: v, ... } -> var # call an adapter; await result
- toast 'message'                       # show user feedback
- emit 'eventName' { ... }              # app‑internal event bus (optional)

Notes
- Variables (var) are simple names in the handler scope or shared state. By convention we use $rules in examples, but the leading $ is not required by the DSL; use plain names.
- For element property targets, prefer {element-prop}. Shorthands enable/disable/show/hide map to set {element-enabled/visible}.

---

## 5) Expressions

- Literals: numbers, strings in single quotes, booleans true/false, arrays [1,2,'a'].
- Element references: {name}, {name-prop}, {name-values}.
- Operators: + - * / % == != < <= > >= and or not.
- Helpers: number(x), string(x), trim(x), len(x), join(arr, sep), json(x), map(arr, fn), merge(a,b), now().
- Functions like map/merge can be implemented by the runtime; inline lambdas are simple arg names like r => describe(r).

The Conditions engine you already have can evaluate boolean/math parts; we extend with a few helpers.

---

## 6) Services (adapters)

Services are namespaced. You can provide any you like; two typical R adapters:

- R.eval { code: 'R code as string' } -> result
- R.vars { dataset: 'df_name' } -> string[]

These dispatch through your coms/ipc layer to the main process.

---

## 7) Example: Recode dialog flows (using {...} syntax)

Assumed nameids (example; adapt to your actual ids):
- datasetList, varList
- oldRadio, oldValue, oldLowestTo, oldRangeA, oldRangeB, oldMissing, oldOthers
- newRadio, newValue
- rulesList, addBtn, removeBtn, clearBtn, runBtn

```yaml
state:
  dataset: ''
  selected_variable: ''
  rules: []

commands:
  get_datasets()
  get_vars(dataset)

actions:
  - when: init
    do:
      - set items {datasetList} = get_datasets()
      - disable {runBtn}

  - when: change on {datasetsContainer}
    do:
      - reset {varsContainer}
      - reset {rulesContainer}
      - set items {varsContainer} = get_vars({datasetsContainer})
      - selected_variable = ''
      - rules = []
      - disable {runBtn}

  - when: change on {varsContainer}
    do:
      - reset {rulesContainer}
      - rules = []
      - set items {rulesContainer} = []
      - disable {runBtn}




  - when: click on {addBtn}
    do:
      - guard: {oldRadio} != '' else 'Choose an Old value option'
      - guard: {newRadio} != '' else 'Choose a New value option'

      - let rule =
          if {oldRadio} == 'value' then { when: { eq: number({oldValue}) } }
          else if {oldRadio} == 'lowest_to' then { when: { range: { low: 'min', high: number({oldLowestTo}) } } }
          else if {oldRadio} == 'range' then { when: { range: { low: number({oldRangeA}), high: number({oldRangeB}) } } }
          else if {oldRadio} == 'missing' then { when: { missing: true } }
          else { when: { others: true } }

      - let thenPart =
          if {newRadio} == 'value' then { value: number({newValue}) }
          else if {newRadio} == 'missing' then { value: 'NA' }
          else { copy: true }

      - let rule = merge(rule, { then: thenPart })

      - push rules with rule
      - set {rulesList-items} = map(rules, r => describe(r))
      - if: variable != '' and len(rules) > 0
        then: enable {runBtn}

  - when: click on {removeBtn}
    do:
      - if: {rulesList-selectedIndex} >= 0
        then:
          - remove rules at {rulesList-selectedIndex}
          - set {rulesList-items} = map(rules, r => describe(r))
          - if: len(rules) == 0
            then: disable {runBtn}

  - when: click on {clearBtn}
    do:
      - clear rules
      - set {rulesList-items} = []
      - disable {runBtn}

  - when: click on {runBtn}
    do:
      - guard: dataset != '' else 'Select a dataset'
      - guard: variable != '' else 'Select a variable'
      - guard: len(rules) > 0 else 'Add at least one rule'
      - let spec = json({ dataset: dataset, variable: variable, rules: rules })
      - call R.eval { code: "apply_recode_spec(\"" + spec + "\")" } -> result
      - toast 'Recode complete'
```

Notes
- {element} tokens are used consistently for reading/writing UI state.
- variables dataset, variable, rules are simple named variables in the state of the flow; they are optional if you prefer to always read from {...} tokens.
- describe(r) is a runtime helper that formats a rule for display in rulesList.

---

## 8) Mapping table (DSL → runtime → codebase)

The runtime resolves DSL properties to your internal fields. Defaults can be overridden if needed.

- {el-enabled}   ↔ dataset.isEnabled
- {el-visible}   ↔ dataset.isVisible
- {el-checked}   ↔ dataset.isChecked
- {el-selected}  ↔ dataset.isSelected
- {button-label} ↔ dataset.label
- {label-text} or {label-value} ↔ dataset.value
- {select-options}/{list-items} ↔ inner HTML option list
- {select-values} ↔ selected values array (if multi)

---

## 9) Error handling and validation

- guard: expr else 'message' aborts the current handler; the runtime may highlight related fields.
- call ... can reject; the runtime should surface an error toast or bubble to a global handler.

---

## 10) Compilation to JS (sketch)

- Parse YAML into an AST.
- Validate references: each {nameid} must exist; property supported for that type.
- Generate JS that attaches listeners and calls a small Action runtime:
  - Action.get('{nameid-prop}'), Action.set('{nameid-prop}', value), Action.enable('{nameid}'), ...
  - Action.var(name), Action.setVar(name, value) for state.
  - Action.call('R.eval', args).
- Keep the runtime small and testable.

---

## 11) Open points for review

- Are the default properties acceptable (e.g., Label → value)?
- Do you want to drop variables entirely and always use {...} tokens? The current design keeps variables optional.
- Confirm property names for list widgets: items vs options, and selectedIndex exposure.
- Service names and R entry points (JSON spec recommended over string‑built code).

---

## 12) Cheatsheet

- Read value: {input1}
- Read selected values: {list1-values}
- Set items: set {list1-items} = ['a','b']
- Enable/disable: enable {runBtn} / disable {runBtn}
- Show/hide: show {advancedBox} / hide {advancedBox}
- Validation: guard: trim({input1}) != '' else 'Enter a value'
- Service call: call R.eval { code: '1+1' } -> res





init:
  - disable {runBtn}
  - populate datasetList:
    with:
      datasets

on:
  - change {datasetList}
