import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

// TODO(ISSUES.md:COS-002): Consider adding 'quotes' rule for consistent quote style
// TODO(ISSUES.md:COS-003): Add 'comma-dangle' rule for trailing comma consistency
// TODO(ISSUES.md:COS-004): Add 'no-console' rule to prevent console.log in production code
// See COSMETIC_IMPROVEMENTS.md for full implementation plan

export default [
    {
        ignores: ['dist/**/*', 'node_modules/**/*', '**/*.d.ts']
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            'indent': ['error', 2],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off', // Temporarily disabled for MCP SDK compatibility
            'no-console': 'off',
        },
    },
]; 