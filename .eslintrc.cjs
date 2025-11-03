module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2020
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked'
    ],
    env: {
        es6: true,
        browser: true,
        node: true
    },
    overrides: [],
    rules: {
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        // Keep project style stable; these are not actionable issues for us
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/prefer-for-of': 'off'
    }
};

