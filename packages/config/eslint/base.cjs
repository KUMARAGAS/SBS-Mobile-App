/**
 * Shared ESLint flat-config preset (PLAN.md §8.5, D15) — consumed as `@sbs/config/eslint/base`.
 *
 * Deliberately dependency-free: it uses core ESLint rules only, so it can be loaded before any plugin is
 * installed. Each workspace composes its own `eslint.config.js` on top:
 *
 *   // apps/mobile/eslint.config.js
 *   const base = require('@sbs/config/eslint/base');
 *   const expo = require('eslint-config-expo/flat');
 *   module.exports = [...base, ...expo, { ignores: ['dist/*'] }];
 *
 *   // apps/admin/eslint.config.js  →  next/core-web-vitals instead of expo
 *
 * TODO (D14): add a custom rule enforcing the RTK conventions (no ad-hoc useEffect+fetch for server state)
 * once ESLint is installed and the API slice exists.
 */
module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.expo/**',
      '**/.next/**',
      '**/android/**',
      '**/ios/**',
      '**/src/generated/**',
    ],
  },
  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
