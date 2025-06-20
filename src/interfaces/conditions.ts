export interface Conditions {
    elements: string[];
    allowedOperators: string[];
    allowedProperties: string[];
    allowedActions: string[];
    populateConditions: (obj: ConditionsInfo) => void;
    validate: (input: string) => string;
    tokenize: (expr: string) => string[];
    parseAtomic: (tokens: string[]) => string[];
    parseExpression: (tokens: string[], elements: Set<string>) => ConditionExpression;
    parseConditions: (input: string) => Response;
}

export type ConditionExpression = string[] | (string | ConditionExpression)[];

export interface Response {
    elements: string[];
    result: {
        [key: string]: ConditionExpression;
    };
}

export interface ConditionsInfo {
    name: string;
    conditions: string;
    elements: string[]
    selected: string; // the id of the selected element
}