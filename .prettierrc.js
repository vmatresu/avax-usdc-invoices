/**
 * Prettier Configuration
 * Production-grade formatting rules
 */

module.exports = {
  // Line width
  printWidth: 100,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Semicolons
  semi: true,

  // Quotes
  singleQuote: true,

  // Trailing commas
  trailingComma: 'es5',

  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // JSX
  jsxSingleQuote: false,

  // End of line
  endOfLine: 'lf',

  // Prose
  proseWrap: 'preserve',

  // HTML
  htmlWhitespaceSensitivity: 'css',

  // YAML
  singleAttributePerLine: false,

  // Overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.sol',
      options: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 80,
      },
    },
  ],
};
