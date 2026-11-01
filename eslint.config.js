// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettier = require('eslint-plugin-prettier')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      ...eslintConfigPrettier.rules,
    },
    ignores: [
      'dist/*',
      'node_modules/',
      '.expo/*',
      'metro.config.js',
      'babel.config.js'
    ],
  },
]);
