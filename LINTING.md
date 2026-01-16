# Linting and Formatting Setup

Production-grade linting and formatting setup for Avalanche USDC Invoices project.

## Quick Start

```bash
# Install dependencies
pnpm install

# Initialize git hooks
pnpm prepare

# Run all checks
./scripts/lint.sh

# Or manually
pnpm lint:fix && pnpm format:fix && pnpm typecheck
```

## Configuration Files

| File | Purpose | Location |
|-------|---------|----------|
| `.eslintrc.js` | Root ESLint configuration | Root |
| `eslint.config.mjs` | Flat config for ESLint 9+ | Root |
| `.prettierrc.js` | Root Prettier configuration | Root |
| `.prettierignore` | Files to ignore formatting | Root |
| `.lintstagedrc.json` | Pre-commit linting rules | Root |
| `.husky/pre-commit` | Pre-commit hook | Root |
| `apps/web/.eslintrc.json` | Web app ESLint overrides | Web app |
| `apps/web/.prettierrc` | Web app Prettier overrides | Web app |
| `packages/shared/.eslintrc.json` | Shared package ESLint | Shared |
| `packages/shared/.prettierrc` | Shared package Prettier | Shared |

## Available Scripts

### Root Scripts

```bash
# Linting
pnpm lint              # Check for linting errors
pnpm lint:fix          # Auto-fix linting errors
pnpm lint:contracts    # Lint Foundry contracts

# Formatting
pnpm format            # Check formatting
pnpm format:fix        # Format all files
pnpm format:check      # Same as format

# Type Checking
pnpm typecheck         # Type check all workspaces
pnpm typecheck:web     # Type check web app
pnpm typecheck:shared  # Type check shared package

# All-in-One
./scripts/lint.sh       # Fix all issues
./scripts/validate.sh  # Check all issues

# Development
pnpm dev               # Start development server
pnpm build             # Build production bundle
pnpm test              # Run tests
```

## Pre-Commit Hooks

### How It Works

When you commit files:

1. Husky intercepts commit
2. lint-staged runs on staged files only
3. ESLint auto-fixes errors
4. Prettier formats code
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

```bash
git commit --no-verify -m "Bypassing hooks"
```

**Warning**: Use sparingly and only for good reason.

## ESLint Rules

### TypeScript Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `no-unused-vars` | Error | Disallow unused variables |
| `no-explicit-any` | Warn | Warn about `any` type |
| `no-floating-promises` | Warn | Floating promises are dangerous |
| `prefer-nullish-coalescing` | Error | Prefer `??` over `\|\|` |
| `prefer-optional-chain` | Error | Prefer `?.` over checks |

### React Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `react/jsx-key` | Error | Require `key` prop in lists |
| `react-hooks/rules-of-hooks` | Error | Enforce Rules of Hooks |
| `react-hooks/exhaustive-deps` | Warn | Check hook dependencies |

### General Rules

| Rule | Severity | Description |
|-------|----------|-------------|
| `no-console` | Warn | Warn about console usage |
| `no-debugger` | Error | Disallow debugger statements |
| `no-var` | Error | Disallow `var` declarations |
| `prefer-const` | Error | Prefer `const` over `let` |
| `sort-imports` | Error | Sort imports consistently |

## Prettier Rules

### Formatting Rules

```javascript
{
  printWidth: 100,        // Line width
  tabWidth: 2,            // Indentation size
  useTabs: false,         // Use spaces, not tabs
  semi: true,              // Add semicolons
  singleQuote: true,       // Use single quotes
  trailingComma: 'es5',    // Add trailing commas in ES5
  arrowParens: 'always',   // Always use parens in arrow functions
  bracketSpacing: true,     // Add spaces inside brackets
  endOfLine: 'lf',        // Use line feed (Unix)
}
```

### File-Specific Overrides

- **JSON files**: 80 character width, no trailing commas
- **Markdown files**: 80 character width, wrap prose
- **Solidity files**: 120 character width, 4 space indentation
- **YAML files**: 80 character width

## Type Checking

### TypeScript Configuration

- **Strict mode**: Enabled
- **No implicit any**: Enabled
- **Strict null checks**: Enabled
- **No unused locals**: Enabled
- **No fallthrough cases**: Enabled

### Type Checking Commands

```bash
# Type check everything
pnpm typecheck

# Type check web app
pnpm typecheck:web

# Type check shared package
pnpm typecheck:shared
```

## Common Issues

### ESLint Issues

**Issue**: "Parsing error"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue**: "Unable to resolve path"

**Solution**:
```bash
# Update tsconfig paths
# Check .eslintrc.js resolver configuration
```

### Prettier Issues

**Issue**: "Prettier conflicts with ESLint"

**Solution**:
```bash
# Verify eslint-plugin-prettier is installed
pnpm list | grep prettier

# Check plugin is last in extends
```

**Issue**: "Prettier not formatting on save"

**Solution**:
```bash
# Check VS Code settings
"editor.formatOnSave": true
"editor.defaultFormatter": "esbenp.prettier-vscode"
```

### Type Checking Issues

**Issue**: "Cannot find module"

**Solution**:
```bash
# Install type definitions
pnpm add @types/node

# Update tsconfig paths
paths: {
  '@/*': ['./apps/web/*'],
  '@avalanche-bridge/*': ['./packages/shared/*'],
}
```

## VS Code Integration

### Required Extensions

- ESLint (Microsoft)
- Prettier (Prettier)
- TypeScript (Microsoft)
- Error Lens (Microsoft)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
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
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## CI/CD Integration

### GitHub Actions

Add `.github/workflows/lint.yml`:

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

### Required Checks

Configure GitHub to require:

- Lint checks pass
- Type checks pass
- Test checks pass
- Code owner review

## Workflow

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes**
   - Edit files
   - Add new files

3. **Run linters**
   ```bash
   ./scripts/lint.sh
   ```

4. **Commit** (hooks run automatically)
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/new-feature
   ```

### Pre-Commit Workflow

1. **Stage files**
   ```bash
   git add file1.tsx file2.ts
   ```

2. **Attempt commit**
   ```bash
   git commit -m "feat: add feature"
   ```

3. **Hooks run automatically**
   - ESLint fixes errors
   - Prettier formats code
   - Type check runs (if configured)

4. **If no errors**
   - Commit succeeds
   - Proceed to push

5. **If errors**
   - Commit is blocked
   - Check errors
   - Fix issues
   - Stage changes
   - Try commit again

## Best Practices

### Before Committing

1. **Run linters manually**
   ```bash
   ./scripts/lint.sh
   ```

2. **Review staged files**
   ```bash
   git diff --cached
   ```

3. **Test your changes**
   ```bash
   pnpm test
   pnpm dev
   ```

4. **Then commit**
   ```bash
   git add .
   git commit -m "feat: add feature"
   ```

### Code Review Checklist

- [ ] No ESLint errors
- [ ] No Prettier formatting issues
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Code follows style guide
- [ ] Functions documented
- [ ] Complex logic has comments

### Continuous Improvement

- Review linting rules regularly
- Update dependencies for security
- Add new rules as needed
- Customize rules for team preferences
- Document rule exceptions

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall Husky
rm -rf .husky
pnpm prepare

# Check hook exists
cat .husky/pre-commit
```

### Linting Not Working

```bash
# Check ESLint installation
pnpm list | grep eslint

# Check configuration
cat .eslintrc.js

# Run verbose
pnpm lint --debug
```

### Formatting Not Working

```bash
# Check Prettier installation
pnpm list | grep prettier

# Check configuration
cat .prettierrc.js

# Run verbose
pnpm format --debug
```

### Type Checking Not Working

```bash
# Check TypeScript version
pnpm list | grep typescript

# Check configuration
cat tsconfig.json

# Run verbose
pnpm typecheck --pretty
```

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript ESLint Plugin](https://typescript-eslint.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Code Style Guide](./docs/development/code-style.md)

## Support

If you encounter issues:

1. Check [Troubleshooting Guide](./docs/troubleshooting/wallet.md)
2. Review [Linting Guide](./docs/development/linting.md)
3. Check [Code Style Guide](./docs/development/code-style.md)
4. Search [GitHub Issues](https://github.com/your-org/avax-usdc-invoices/issues)
5. Contact development team

---

**Related Documentation**:
- [Development Setup](./docs/development/setup.md)
- [Code Style Guide](./docs/development/code-style.md)
- [Linting Guide](./docs/development/linting.md)
- [Contributing Guide](./docs/contributing/overview.md)

**Setup Complete**: This project now has production-grade linting and formatting! 🎉
