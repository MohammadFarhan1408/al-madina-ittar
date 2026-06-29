// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // React Native Reanimated drives animations by mutating a SharedValue's `.value`.
    // The React Compiler-aware `react-hooks/immutability` rule treats those shared
    // values as immutable and false-positives on every `.value = …` assignment, which
    // is Reanimated's intended public API. Disable it project-wide.
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);
