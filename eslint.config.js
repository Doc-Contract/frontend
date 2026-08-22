import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["src/**/*.{js,jsx}"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
