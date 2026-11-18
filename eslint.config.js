const js = require('@eslint/js');

module.exports = [
  { ignores: ['dist/**', '.expo/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest', sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: Object.fromEntries(['console', 'require', 'module', 'exports', '__dirname',
        '__filename', 'process', '__DEV__', 'setTimeout', 'clearTimeout', 'setInterval',
        'clearInterval', 'setImmediate', 'fetch', 'URL', 'AbortController']
        .map(nome => [nome, 'readonly'])),
    },
    rules: { 'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z]', args: 'none', caughtErrors: 'none' }] },
  },
  { files: ['**/*.cjs', 'eslint.config.js'], languageOptions: { sourceType: 'commonjs' } },
];
