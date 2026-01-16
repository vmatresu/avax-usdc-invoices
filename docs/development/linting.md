# Linting and Formatting Guide

Complete guide for setting up and using ESLint and Prettier in Avalanche USDC Invoices project.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Configuration](#configuration)
4. [Rules](#rules)
5. [Usage](#usage)
6. [Pre-Commit Hooks](#pre-commit-hooks)
7. [Troubleshooting](#troubleshooting)

## Overview

### Tools Used

- **ESLint**: JavaScript and TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Run linters on staged files

### Configuration Files

- `.eslintrc.js` - Root ESLint configuration
- `eslint.config.mjs` - Flat config for ESLint 9+
- `.prettierrc` - Prettier configuration
- `.prettierrc.js` - JavaScript Prettier config
- `.prettierignore` - Files to ignore
- `.lintstagedrc.json` - Lint-staged configuration
- `.husky/pre-commit` - Pre-commit hook

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

This installs all linting and formatting dependencies from root `package.json`:

- ESLint and plugins
- Prettier
- Husky
- lint-staged
- TypeScript

### 2. Initialize Git Hooks

```bash
pnpm prepare
```

This creates `.husky/` directory and sets up pre-commit hooks.

## Configuration

### ESLint Configuration

#### Root Configuration (.eslintrc.js)

The root ESLint configuration includes:

- **Parser**: TypeScript parser for .ts/.tsx files
- **Plugins**: TypeScript, React, React Hooks, JSX a11y, Prettier
- **Extends**: Recommended configurations from all plugins
- **Rules**: Custom rules for code quality

#### Key Rules

```javascript
{
  // TypeScript
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',

  // React
  'react/react-in-jsx-scope': 'off',
  'react/jsx-key': 'error',
  'react-hooks/rules-of-hooks': 'error',

  // General
  'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  'no-var': 'error',
  'prefer-const': 'error',
}
```

#### Override Configurations

Different directories can have different rules:

- `apps/web/.eslintrc.json` - Next.js specific rules
- `packages/shared/.eslintrc.json` - Shared package rules
- `contracts/` - No ESLint (use Foundry linting)

### Prettier Configuration

#### Root Configuration (.prettierrc.js)

```javascript
{
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
}
```

#### Overrides

Different file types have different formatting:

```javascript
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
      singleQuote: false,
    },
  },
]
```

## Rules

### TypeScript Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `no-unused-vars` | Error | Disallow unused variables |
| `no-explicit-any` | Warn | Warn about `any` type |
| `no-floating-promises` | Warn | Floating promises are dangerous |
| `no-misused-promises` | Warn | Misused promises in conditionals |
| `prefer-nullish-coalescing` | Error | Prefer `??` over `\|\|` |
| `prefer-optional-chain` | Error | Prefer `?.` over checks |

### React Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `react-in-jsx-scope` | Off | Allow React JSX without import |
| `react/jsx-key` | Error | Require `key` prop in lists |
| `react/display-name` | Warn | Display names for components |
| `react-hooks/rules-of-hooks` | Error | Enforce Rules of Hooks |
| `react-hooks/exhaustive-deps` | Warn | Check hook dependencies |

### General Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `no-console` | Warn | Warn about console usage |
| `no-debugger` | Error | Disallow debugger statements |
| `no-var` | Error | Disallow `var` declarations |
| `prefer-const` | Error | Prefer `const` over `let` |
| `prefer-template` | Error | Prefer template literals |
| `no-shadow` | Warn | Disallow variable shadowing |
| `no-duplicate-imports` | Error | Disallow duplicate imports |
| `sort-imports` | Error | Sort imports consistently |

## Usage

### Lint Code

Check code for errors:

```bash
# Lint all files
pnpm lint

# Lint specific file
pnpm lint apps/web/app/page.tsx

# Lint with auto-fix
pnpm lint:fix
```

### Format Code

Check formatting:

```bash
# Check formatting
pnpm format

# Format all files
pnpm format:fix
```

### Type Check

Type check code:

```bash
# Type check all workspaces
pnpm typecheck

# Type check web app
pnpm typecheck:web

# Type check shared package
pnpm typecheck:shared
```

### Combined Workflow

Run all checks:

```bash
# Check everything
pnpm lint && pnpm format && pnpm typecheck

# Fix everything
pnpm lint:fix && pnpm format:fix
```

## Pre-Commit Hooks

### How They Work

When you commit files:

1. Husky intercepts the commit
2. lint-staged runs on staged files only
3. ESLint fixes errors automatically
4. Prettier formats code automatically
5. If no errors, commit proceeds
6. If errors, commit is blocked

### Configuration

```json
{
  "*.{ts,tsx,js,jsx,mjs}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

### Bypass Hooks

If you need to bypass hooks:

```bash
git commit --no-verify -m "Bypassing hooks"
```

**Warning**: Use sparingly and only for good reason.

### Force Commit

If you must commit with errors:

```bash
git add .
git commit --no-verify -m "WIP: force commit"
```

Then fix issues after commit.

## VS Code Integration

### Recommended Extensions

Install these VS Code extensions:

- ESLint (Microsoft)
- Prettier (Prettier)
- TypeScript (Microsoft)
- Error Lens (Microsoft)

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### VS Code Workspace Settings

Create `.vscode/settings.json` in root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## CI/CD Integration

### GitHub Actions

Example workflow:

```yaml
name: Lint and Type Check

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck
```

### Preventing Merges

Configure GitHub to require:

- All status checks pass
- Code owner review
- No merge conflicts

## Troubleshooting

### ESLint Errors

**Error**: "Parsing error: Unexpected token"

**Solution**:
```bash
# Install parser
pnpm add @typescript-eslint/parser

# Update parser in .eslintrc.js
parser: '@typescript-eslint/parser',
parserOptions: {
  ecmaVersion: 2021,
  sourceType: 'module',
  ecmaFeatures: { jsx: true },
},
```

**Error**: "Unable to resolve path to module"

**Solution**:
```bash
# Install TypeScript resolver
pnpm add eslint-import-resolver-typescript

# Update settings in .eslintrc.js
settings: {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: './apps/web/tsconfig.json',
    },
  },
},
```

**Error**: "Definition for rule 'xxx' was not found"

**Solution**:
```bash
# Install plugin
pnpm add eslint-plugin-xxx

# Add to plugins in .eslintrc.js
plugins: ['xxx'],
```

### Prettier Errors

**Error**: "Prettier conflicts with ESLint"

**Solution**:
```bash
# Make sure eslint-plugin-prettier is installed
pnpm add eslint-plugin-prettier

# Make sure it's last in extends
extends: [
  'eslint:recommended',
  // ...other extends
  'plugin:prettier/recommended', // Must be last
],
```

**Error**: "Prettier not formatting on save"

**Solution**:
```bash
# Check VS Code settings
"editor.formatOnSave": true
"editor.defaultFormatter": "esbenp.prettier-vscode"
```

### Type Checking Errors

**Error**: "TS2307: Cannot find module"

**Solution**:
```bash
# Install missing type definitions
pnpm add @types/node

# Or update tsconfig paths
paths: {
  '@/*': ['./apps/web/*'],
  '@avalanche-bridge/*': ['./packages/shared/*'],
},
```

**Error**: "TS2769: No overload matches"

**Solution**:
```bash
# Check function signature
# Usually incorrect number or type of arguments
```

### Pre-Commit Hook Errors

**Error**: "Husky: command not found"

**Solution**:
```bash
# Install husky
pnpm install

# Or manually
npx husky install
```

**Error**: "lint-staged: command not found"

**Solution**:
```bash
# Install lint-staged
pnpm add lint-staged

# Verify .lintstagedrc.json is correct
```

**Error**: "pre-commit hook failed"

**Solution**:
```bash
# Check what failed
git commit

# Fix issues
pnpm lint:fix && pnpm format:fix

# Try again
git commit
```

## Best Practices

### Development Workflow

1. **Create new feature branch**
   ```bash
   git checkout -b feature/invoice-creation
   ```

2. **Make changes**
   - Edit files
   - Add new files

3. **Run linters**
   ```bash
   pnpm lint:fix && pnpm format:fix && pnpm typecheck
   ```

4. **Stage files**
   ```bash
   git add .
   ```

5. **Commit** (hooks will run)
   ```bash
   git commit -m "feat: add invoice creation"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/invoice-creation
   ```

### Code Review Checklist

Before PR, verify:

- [ ] No ESLint errors
- [ ] No Prettier formatting issues
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated

### Common Issues

**Issue**: Prettier keeps changing formatting

**Solution**:
```bash
# Clear Prettier cache
rm -rf .prettiercache

# Check .prettierrc.js
# Verify no conflicting rules
```

**Issue**: ESLint rules too strict

**Solution**:
```bash
# Disable specific rule in .eslintrc.js
rules: {
  '@typescript-eslint/no-explicit-any': 'off', // For now
}
```

**Issue**: Import sorting breaks code

**Solution**:
```bash
# Disable import sorting
'sort-imports': 'off',
```

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [TypeScript ESLint Plugin](https://typescript-eslint.io/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)

---

**Related Documentation**:
- [Development Setup](./setup.md)
- [Code Style Guide](./code-style.md)
- [Testing Guide](./testing.md)
