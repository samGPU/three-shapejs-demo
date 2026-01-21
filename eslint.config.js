// eslint.config.js

import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                window: "readonly",
				document: "readonly",
				console: "readonly",
            }
        },
        rules: {
            "brace-style": ["error", "1tbs", { "allowSingleLine": false }]
        }
    }
];
