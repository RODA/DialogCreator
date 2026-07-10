import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        linterOptions: {
            reportUnusedDisableDirectives: false
        }
    },
    {
        ignores: [
            "dist/**",
            "build/**",
            "src/bundles/**",
            "src/types/**/*.d.ts"
        ]
    },
    js.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module"
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "no-undef": "off",
            "no-empty": "off",
            "no-redeclare": "off",
            "no-cond-assign": "off",
            "no-prototype-builtins": "off",
            "no-func-assign": "off",
            "no-case-declarations": "off",
            "no-useless-escape": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",
            "@typescript-eslint/no-unused-expressions": "off"
        }
    }
];
