import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    nextPlugin.flatConfig.recommended,
    nextPlugin.flatConfig.coreWebVitals,
    {
        files: ["*.config.js", "*.config.ts", "*.config.mjs"],
        languageOptions: {
            globals: {
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
                process: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    },
];
