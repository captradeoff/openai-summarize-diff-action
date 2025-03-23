module.exports = {
  env: {
    node: true,
    jest: true,
    es6: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'never'],
    'max-len': ['warn', { code: 100 }]
  },
  ignorePatterns: ['dist/*', 'node_modules/*']
}; 