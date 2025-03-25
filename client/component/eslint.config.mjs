import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

import base from "../../eslint.config.mjs";

export default [
    ...base,
    {
        plugins: {
            "react-refresh": reactRefresh,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },

        rules: {
            "react-refresh/only-export-components": ["warn", {
                allowConstantExport: true,
            }],
        },
    }
];