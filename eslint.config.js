import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
export default [
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        Buffer: "readonly",
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "off",
      "no-empty": "off",
      "no-useless-assignment": "off",
      "no-func-assign": "off",
      "no-cond-assign": "off",
      "no-prototype-builtins": "off",
      "no-unsafe-finally": "off",
      "no-async-promise-executor": "off",
      "no-control-regex": "off",
      "no-useless-escape": "off"
    }
  }
];
