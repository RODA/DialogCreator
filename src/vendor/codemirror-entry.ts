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
import { bracketMatching, indentUnit } from '@codemirror/language';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';
import * as acorn from 'acorn';

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

    // Allowed events for UI API (mirror of Preview runtime)
    const allowedEvents = new Set(['click', 'change', 'input']);

    // Linter: warn about unsupported ui.on/ui.trigger events while typing
    const uiApiLinter = linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const code = view.state.doc.toString();
        let ast: any = null;
        try {
            ast = acorn.parse(code, {
                ecmaVersion: 'latest',
                sourceType: 'script',
                allowReturnOutsideFunction: true,
                allowAwaitOutsideFunction: true
            } as any);
        } catch {
            // Syntax errors handled by status bar; skip lint on parse failure
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

        const addDiag = (node: any, message: string) => {
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
            if (!callee || callee.type !== 'MemberExpression') return;
            const obj = callee.object;
            const prop = callee.property;
            const isIdent = (x: any, name: string) => x && x.type === 'Identifier' && x.name === name;
            const propName = prop?.type === 'Identifier' ? prop.name : (prop?.type === 'Literal' ? String(prop.value) : '');
            if (!(isIdent(obj, 'ui') && (propName === 'on' || propName === 'trigger'))) return;

            const args = n.arguments || [];
            if (propName === 'on' && args.length >= 2) {
                const evNode = args[1];
                if (evNode.type === 'Literal' && typeof evNode.value === 'string') {
                    const ev = evNode.value.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiag(evNode, `Unsupported event '${ev}'. Allowed: ${Array.from(allowedEvents).join(', ')}`);
                    }
                } else if (evNode.type === 'Identifier') {
                    const ev = evNode.name.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiag(evNode, `Unknown event identifier ${ev}. Use a string like 'click'. Allowed: ${Array.from(allowedEvents).join(', ')}`);
                    }
                } else {
                    addDiag(evNode, `Event must be a string literal or one of: ${Array.from(allowedEvents).join(', ')}`);
                }
            }

            if (propName === 'trigger' && args.length >= 2) {
                const evNode = args[1];
                if (evNode.type === 'Literal' && typeof evNode.value === 'string') {
                    const ev = evNode.value.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiag(evNode, `Unsupported event '${ev}'. Allowed: ${Array.from(allowedEvents).join(', ')}`);
                    }
                } else if (evNode.type === 'Identifier') {
                    const ev = evNode.name.toLowerCase();
                    if (!allowedEvents.has(ev)) {
                        addDiag(evNode, `Unknown event identifier ${ev}. Use a string like 'change'. Allowed: ${Array.from(allowedEvents).join(', ')}`);
                    }
                } else {
                    addDiag(evNode, `Event must be a string literal or one of: ${Array.from(allowedEvents).join(', ')}`);
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
                // Lint tooltip styling: Arial and slightly smaller font size
                '.cm-tooltip': {
                    fontFamily: 'Arial, Helvetica, sans-serif'
                },
                '.cm-tooltip-lint': {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '11px',
                    lineHeight: '1.35'
                },
                '.cm-diagnostic': {
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '11px',
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

(window as any).CM6 = { createCodeEditor };
