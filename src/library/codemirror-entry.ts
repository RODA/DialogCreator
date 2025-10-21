import { EditorState } from '@codemirror/state';
import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter
} from '@codemirror/view';
import {
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab,
    indentLess
} from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, indentUnit, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { linter, lintGutter, Diagnostic, forceLinting } from '@codemirror/lint';
import * as acorn from 'acorn';
import { API_NAMES, EVENT_NAMES, ELEMENT_FIRST_ARG_CALLS } from './api';
import { tags } from '@lezer/highlight';

type CMInstance = {
    view: EditorView;
    getValue(): string;
    setValue(v: string): void;
    focus(): void;
    destroy(): void;
};

type CMOptions = {
    value?: string;
    onChange?: (value: string) => void
};

// Dialog metadata used for semantic linting in the Code window
type DialogMetaElement = {
    name: string;
    type: string;
    options?: string[]; // for Select elements, when known
};

type DialogMetaInput = {
    elements?: Array<DialogMetaElement>;
    radioGroups?: string[];
};

type DialogMeta = {
    elements: DialogMetaElement[];
    radioGroups: Set<string>;
};

let currentDialogMeta: DialogMeta | null = null;

const dialogHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: '#005cc5' },
    { tag: [tags.string, tags.special(tags.string)], color: '#22863a' },
    { tag: tags.number, color: '#e36209' },
    { tag: tags.bool, color: '#e36209' },
    { tag: tags.comment, color: '#6a737d', fontStyle: 'italic' },
    { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#ae4545' },
    { tag: tags.variableName, color: '#1a7f9d' },
    { tag: tags.operator, color: '#005cc5' },
    { tag: tags.punctuation, color: '#6a737d' }
]);

function setDialogMeta(meta: DialogMetaInput | null | undefined) {
    if (meta && Array.isArray(meta.elements)) {
        const elements = meta.elements
            .map(e => {
                const name = String(e?.name ?? '').trim();
                const type = String(e?.type ?? '').trim();
                const options = Array.isArray(e?.options) ? e.options.map(v => String(v)) : undefined;
                return { name, type, options };
            })
            .filter(e => e.name.length > 0 && e.type.length > 0);

        const radioGroups = new Set<string>();
        if (Array.isArray(meta.radioGroups)) {
            for (const g of meta.radioGroups) {
                const name = String(g ?? '').trim();
                if (name) {
                    radioGroups.add(name);
                }
            }
        }

        currentDialogMeta = { elements, radioGroups };
        return;
    }

    currentDialogMeta = null;
}

function createCodeEditor(mount: HTMLElement, options?: CMOptions) : CMInstance {
    const startDoc = options?.value || '';
    const onChange = options?.onChange;

    // Simple JS line comment toggle for Mod-/ without external package
    const toggleLineComment = (view: EditorView): boolean => {
        const { state } = view;
        const doc = state.doc;
        // Collect affected unique line numbers
        const lineNums = new Set<number>();
        for (const r of state.selection.ranges) {
            const fromLine = doc.lineAt(r.from).number;
            const toLine = doc.lineAt(r.to).number;
            for (let n = fromLine; n <= toLine; n++) {
                lineNums.add(n);
            }
        }

        if (lineNums.size === 0) return true;

        // Determine if all lines are already commented (// after indentation)
        let allCommented = true;
        for (const n of lineNums) {
            const line = doc.line(n);
            const text = line.text;
            const indentMatch = text.match(/^(\s*)/);
            const i = (indentMatch ? indentMatch[1].length : 0);
            if (!(text.slice(i, i + 2) === '//')) {
                allCommented = false;
                break;
            }
        }

        const changes = [] as { from: number; to?: number; insert?: string }[];
        for (const n of lineNums) {
            const line = doc.line(n);
            const text = line.text;
            const indentMatch = text.match(/^(\s*)/);
            const i = (indentMatch ? indentMatch[1].length : 0);
            if (allCommented) {
                if (text.slice(i, i + 2) === '//') {
                    changes.push({ from: line.from + i, to: line.from + i + 2 });
                }
            } else {
                changes.push({ from: line.from + i, insert: '//' });
            }
        }

        if (changes.length) {
            view.dispatch({ changes });
        }
        return true;
    };

    // SSOT: allowed events exported by api.ts
    const allowedEvents = new Set(Array.from(EVENT_NAMES));

    // Helpers for semantic linting
    const findElement = (name: string | undefined | null) => {
        if (!name || !currentDialogMeta) return null;
        const n = String(name).trim();
        if (!n) return null;
        return currentDialogMeta.elements.find(e => e.name === n) || null;
    };

    const radioGroupExists = (name: string | undefined | null) => {
        if (!name || !currentDialogMeta) {
            return false;
        }

        const nm = String(name).trim();
        if (!nm) {
            return false;
        }

        return currentDialogMeta.radioGroups.has(nm);
    };

    // Linter: warn about unsupported ui.on/ui.trigger events while typing and dialog-aware issues
    const uiApiLinter = linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const code = view.state.doc.toString();
        const doc = view.state.doc;
        let ast: any = null;
        try {
            ast = acorn.parse(code, {
                ecmaVersion: 'latest',
                sourceType: 'script',
                allowReturnOutsideFunction: true,
                allowAwaitOutsideFunction: true
            } as any);
        } catch (syntaxError: any) {
            // Report syntax errors via lint diagnostics so gutter markers render
            const message = String(syntaxError && syntaxError.message ? syntaxError.message : syntaxError);
            const position = typeof syntaxError?.pos === 'number' ? syntaxError.pos : 0;
            const line = doc.lineAt(Math.min(Math.max(position, 0), doc.length));
            diagnostics.push({
                from: line.from,
                to: line.to,
                severity: 'error',
                message: `Syntax error: ${message}`
            });
            return diagnostics;
        }

        const walk = (node: any, fn: (n: any) => void) => {
            fn(node);
            for (const k in node) {
                if (k === 'start' || k === 'end') continue;
                const v = (node as any)[k];
                if (!v) continue;
                if (Array.isArray(v)) {
                    for (const it of v) {
                        if (it && typeof it.type === 'string') walk(it, fn);
                    }
                } else if (v && typeof v.type === 'string') {
                    walk(v, fn);
                }
            }
        };

        const addDiagnostic = (node: any, message: string) => {
            diagnostics.push({
                from: node.start ?? 0,
                to: node.end ?? node.start ?? 0,
                severity: 'warning',
                message
            });
        };

        walk(ast, (n) => {
            if (n.type !== 'CallExpression') return;
            const callee = n.callee;

            // Determine call shape and name: ui.on(...)/ui.trigger(...)/ui.select(...) OR bare onChange(...), on(...), trigger(...), select(...)
            let callName = '';
            if (callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier' && callee.object.name === 'ui') {
                if (callee.property?.type === 'Identifier') {
                    callName = callee.property.name;
                } else if (callee.property?.type === 'Literal') {
                    callName = String(callee.property.value);
                }
            } else if (callee?.type === 'Identifier') {
                callName = callee.name;
            } else {
                return;
            }

            const args = n.arguments || [];
            // Calls that use element name as first arg
            const elementFirstArgCalls = new Set(Array.from(ELEMENT_FIRST_ARG_CALLS as readonly string[]));

            // Minimal allowlist of ui API methods for bare identifiers (prelude destructuring)
            const knownApi = new Set(Array.from(API_NAMES as readonly string[]));
            // If it's a ui.* call with unknown property, flag it early
            if (callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier' && callee.object.name === 'ui') {
                if (callName && !elementFirstArgCalls.has(callName) && !knownApi.has(callName)) {
                    addDiagnostic(callee.property, `Unknown ui API '${callName}'.`);
                }
                // Soft warn for ui.log: available in runtime but considered debug/internal
                if (callName === 'log') {
                    addDiagnostic(callee.property, `ui.log is for debugging only and not part of the public API.`);
                }
            } else if (callee?.type === 'Identifier') {
                // Bare prelude use (const { ... } = ui)
                if (callName && !knownApi.has(callName)) {
                    // Heuristically warn only for common mistaken names
                    if (['get', 'set', 'checked'].includes(callName)) {
                        addDiagnostic(callee, `Unknown API '${callName}'. Did you mean '${callName === 'checked' ? 'isChecked' : (callName + 'Value')}'?`);
                    }
                }
                // Soft warn for bare log: provided as debug alias in Preview only
                if (callName === 'log') {
                    addDiagnostic(callee, `log(...) is a debug-only alias in Preview and not part of the public API.`);
                }
            }

            if (!elementFirstArgCalls.has(callName) && callName !== 'onChange') return;

            // Element existence for all supported calls when first arg present
            if (args.length >= 1) {
                const elNode = args[0];
                let elName: string | null = null;
                if (elNode.type === 'Literal' && typeof elNode.value === 'string') {
                    elName = String(elNode.value);
                } else if (elNode.type === 'Identifier') {
                    // Allow bare identifiers (name globals) to represent their own string
                    elName = String(elNode.name);
                }
                if (elName) {
                    if (callName === 'onChange') {
                        // Accept either element names or radio groups
                        const el = findElement(elName);
                        if (el) {
                            // ok
                        } else if (!radioGroupExists(elName)) {
                            addDiagnostic(
                                elNode,
                                `Element or radio group '${elName}' does not exist in the dialog`
                            );
                        }
                    } else {
                        const el = findElement(elName);
                        if (!el) {
                            if (radioGroupExists(elName)) {
                                addDiagnostic(
                                    elNode,
                                    `Radio groups are not supported with ${callName}.`
                                );
                            } else {
                                addDiagnostic(
                                    elNode,
                                    `Element '${elName}' does not exist in the dialog`
                                );
                            }
                        }
                    }
                }
            }

            // Event validation
            if (callName === 'on' && args.length >= 2) {
                const evNode = args[1];
                if (evNode.type === 'Literal' && typeof evNode.value === 'string') {
                    const ev = evNode.value.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiagnostic(
                            evNode,
                            `Unsupported event '${ev}'. Allowed: ${Array.from(allowedEvents).join(', ')}`
                        );
                    }
                } else if (evNode.type === 'Identifier') {
                    const ev = evNode.name.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiagnostic(
                            evNode,
                            `Unknown event identifier ${ev}. Use a string like 'click'. Allowed: ${Array.from(allowedEvents).join(', ')}`
                        );
                    }
                } else {
                    addDiagnostic(
                        evNode,
                        `Event must be a string literal or one of: ${Array.from(allowedEvents).join(', ')}`
                    );
                }
            }

            if (callName === 'trigger' && args.length >= 2) {
                const evNode = args[1];
                if (evNode.type === 'Literal' && typeof evNode.value === 'string') {
                    const ev = evNode.value.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiagnostic(
                            evNode,
                            `Unsupported event '${ev}'. Allowed: ${Array.from(allowedEvents).join(', ')}`
                        );
                    }
                } else if (evNode.type === 'Identifier') {
                    const ev = evNode.name.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiagnostic(
                            evNode,
                            `Unknown event identifier ${ev}. Use a string like 'change'. Allowed: ${Array.from(allowedEvents).join(', ')}`
                        );
                    }
                } else {
                    addDiagnostic(
                        evNode,
                        `Event must be a string literal or one of: ${Array.from(allowedEvents).join(', ')}`
                    );
                }
            }

            // select: validate options when dialog meta known
            if (callName === 'select' && args.length >= 2) {
                const elNode = args[0];
                const valNode = args[1];
                let elName: string | null = null;
                if (elNode.type === 'Literal' && typeof elNode.value === 'string') elName = String(elNode.value);
                else if (elNode.type === 'Identifier') elName = String(elNode.name);

                if (elName) {
                    const el = findElement(elName);
                    if (!el) {
                        addDiagnostic(elNode, `Element '${elName}' does not exist in the dialog`);
                    } else if (el.type === 'Select' && el.options && valNode.type === 'Literal' && typeof valNode.value === 'string') {
                        const v = String(valNode.value);
                        if (!el.options.includes(v)) {
                            addDiagnostic(valNode, `Option '${v}' not found in Select '${elName}'`);
                        }
                    }
                }
            }
        });

        return diagnostics;
    }, { delay: 250 });

    const state = EditorState.create({
        doc: startDoc,
        extensions: [
            // Indentation settings: 2 spaces and tab size 2 (adjustable later)
            indentUnit.of("  "),
            EditorState.tabSize.of(2),
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightActiveLine(),
            lintGutter(),
            history(),
            keymap.of([
                indentWithTab,               // Tab indents selection / line
                { key: 'Shift-Tab', run: indentLess }, // Shift+Tab outdents
                { key: 'Mod-/', run: toggleLineComment }, // Toggle line comment
                ...defaultKeymap,
                ...historyKeymap
            ]),
            bracketMatching(),
            uiApiLinter,
            syntaxHighlighting(dialogHighlightStyle),
            javascript(),
            EditorView.updateListener.of((v: any) => {
                if (onChange && v.docChanged) {
                    onChange(v.state.doc.toString());
                }
            }),
            EditorView.theme({
                '&': {
                    height: '100%',
                    flex: '1 1 auto',
                    display: 'flex'
                },
                '.cm-editor': {
                    height: '100%',
                    flex: '1 1 auto',
                    display: 'flex'
                },
                '.cm-scroller': {
                    fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
                    fontSize: '12px',
                    lineHeight: '1.5',
                    flex: '1 1 auto'
                },
                '.cm-content': {
                    color: '#222'
                },
                '.cm-gutters': {
                    backgroundColor: '#f7f7f7',
                    color: '#6a737d'
                },
                // Lint tooltip styling: Arial and slightly larger font size
                '.cm-tooltip': {
                    fontFamily: 'Arial, Helvetica, sans-serif'
                },
                '.cm-tooltip-lint': {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '12px',
                    lineHeight: '1.35'
                },
                '.cm-diagnostic': {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '12px',
                    lineHeight: '1.35'
                }
            })
        ]
    });

    const view = new EditorView({ state, parent: mount });

    return {
        view,
        getValue: () => view.state.doc.toString(),
        setValue: (v: string) => {
            const tr = view.state.update({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: v
                }
            });
            view.dispatch(tr);
        },
        focus: () => view.focus(),
        destroy: () => view.destroy()
    };
}

window.CM6 = {
    createCodeEditor,
    setDialogMeta,
    requestLint: (instance: { view?: unknown } | null | undefined) => {
        const view = instance?.view;
        if (!view) return;
        if (!(view instanceof EditorView)) return;
        forceLinting(view);
    }
};
