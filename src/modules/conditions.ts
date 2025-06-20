import { Conditions, ConditionExpression, ConditionsInfo } from "../interfaces/conditions";
import { showError } from "./coms";
import { utils } from "../library/utils";

export const conditions: Conditions = {

    elements: [],
    allowedOperators: ['==', '!=', '>=', '<='],
    allowedProperties: ['enabled', 'visible', 'selected', 'checked'],
    allowedActions: [
        'enable',
        'disable',
        'show',
        'hide',
        'select',
        'unselect',
        'check',
        'uncheck'
    ],

    populateConditions: function(obj: ConditionsInfo) {
        const id = document.getElementById("conditionsId") as HTMLInputElement;
        if (id) {
            id.value = obj.selected;
        }

        const name = document.getElementById("conditionsName") as HTMLInputElement;
        if (name) {
            name.value = obj.name;
        }

        const textarea = document.getElementById("conditions") as HTMLTextAreaElement;
        if (textarea) {
            textarea.textContent = obj.conditions || '';
        }

        conditions.elements = obj.elements;
    },

    // Tokenizer for the condition expressions
    tokenize: function(expr) {
        // Include + and other non-allowed symbols as tokens
        const regex = /\s*([()&|+]|==|!=|>=|<=|if|;|[a-zA-Z0-9_]+)\s*/g;
        let tokens = [];
        let m;
        while ((m = regex.exec(expr)) !== null) {
            tokens.push(m[1]);
        }
        return tokens;
    },

    // Validate the conditions input
    validate: function(input) {
        const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            if (!line.endsWith(';')) {
                return ('Each expression must end with a semicolon.')
            }
            const m = line.match(/^(\w+)\s+if\s+(.+);$/);
            if (!m) {
                return ('Expression must be in the format: <action> if <condition>;')
            }
            const action = m[1];
            if (!conditions.allowedActions.includes(action)) {
                return (`Action type '${action}' is not allowed.`)
            }
            const condExpr = m[2];
            let balance = 0;
            for (const c of condExpr) {
                if (c === '(') balance++;
                if (c === ')') balance--;
            }
            if (balance !== 0) {
                return ('Parentheses are not balanced.')
            }

            const tokens = conditions.tokenize(condExpr.replace(/;$/, ''));

            // Check for any unrecognized tokens (e.g., +, -, *, /, etc.)
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (
                    !conditions.allowedOperators.includes(token) &&
                    !['&', '|', '(', ')'].includes(token) &&
                    !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) &&
                    !utils.possibleNumeric(token)
                ) {
                    return (`Token or operator '${token}' is not allowed.`);
                }
            }

            // Parse the expression and collect all element names
            const elementsSet = new Set<string>();
            try {
                conditions.parseExpression([...tokens], elementsSet);
            } catch (e) {
                return ('Error parsing condition expression.');
            }
            // Check for missing elements
            const missing = Array.from(elementsSet).filter(el => !conditions.elements.includes(el));
            if (missing.length > 0) {
                if (missing.length === 1) {
                    return (`Element ${missing[0]} does not exist.`);
                } else {
                    return (`Elements ${missing.join(", ")} do not exist.`);
                }
            }

            for (let i = 0; i < tokens.length; i++) {
                // Check for allowed operators
                if (
                    /^(==|!=|>=|<=|=|<|>)$/g.test(tokens[i]) &&
                    !conditions.allowedOperators.includes(tokens[i])
                ) {
                    return (`Operator '${tokens[i]}' is not allowed.`)
                }
                // Check property or numeric value
                if (i + 2 < tokens.length && conditions.allowedOperators.includes(tokens[i + 1])) {
                    if (
                        !conditions.allowedProperties.includes(tokens[i+2]) &&
                        !utils.possibleNumeric(tokens[i+2])
                    ) return (`Property or value '${tokens[i + 2]}' is not allowed.`)
                }
            }
        }
        return ('');
    },

    // Parse a single atomic condition (e.g., checkbox1 == checked)
    parseAtomic: function(tokens) {
        const [element, op, value] = tokens.splice(0, 3);
        // Restrict operator to allowed
        if (!conditions.allowedOperators.includes(op)) {
            showError(`Invalid operator: ${op}`);
            // return (null as unknown) as string[];
            // return (null);
        }
        // Restrict property (value) to allowed
        if (
            !conditions.allowedProperties.includes(value) &&
            !utils.possibleNumeric(value)
        ) {
            showError(`Invalid property: ${value}`);
        }
        return [element, op, value];
    },

    parseExpression: function(tokens, elements) {
        let stack: any[] = [];
        let token;
        while (tokens.length) {
            token = tokens[0];
            if (token === '(') {
                tokens.shift();
                stack.push(conditions.parseExpression(tokens, elements));
                if (String(tokens[0]) === ')') tokens.shift();
            } else if (token === ')') {
                break;
            } else if (token === '&' || token === '|') {
                stack.push(tokens.shift());
            // } else if (token === '!') {
            //     tokens.shift();
            //     if (String(tokens[0]) === '(') {
            //         tokens.shift();
            //         stack.push(['!', conditions.parseExpression(tokens, elements)]);
            //         if (String(tokens[0]) === ')') tokens.shift();
            //     } else {
            //         const atomic = conditions.parseAtomic(tokens);
            //         stack.push(['!', atomic]);
            //         elements.add(atomic[0]);
            //     }
            } else if (/^[a-zA-Z0-9_]+$/.test(token)) {
                const atomic = conditions.parseAtomic(tokens);
                stack.push(atomic);
                elements.add(atomic[0]);
            } else {
                tokens.shift();
            }
        }
        if (stack.length === 0) return [];
        if (stack.length === 1) return stack[0];
        return stack;
    },

    parseConditions: function(input: string) {
        const result: { [key: string]: ConditionExpression } = {};
        const elements = new Set<string>();
        const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            const m = line.match(/^(\w+)\s+if\s+(.+);$/);
            if (m) {
                const [_, action, condExpr] = m;
                const tokens = conditions.tokenize(condExpr.replace(/;$/, ''));
                const parsed = conditions.parseExpression(tokens, elements);
                result[action] = parsed;
            }
        }
        return {
            elements: Array.from(elements),
            result
        };
    }
}
