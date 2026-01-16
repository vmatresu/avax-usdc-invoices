# Linting and Formatting Setup

Quick guide for setting up and using ESLint and Prettier in this project.

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Initialize Git Hooks

```bash
pnpm prepare
```

This sets up Husky and lint-staged for pre-commit hooks.

### Run All Checks

```bash
# Check and fix everything
./scripts/lint.sh

# Or use pnpm scripts
pnpm lint:fix && pnpm format:fix && pnpm typecheck

# Validate without fixing
./scripts/validate.sh

# Or use pnpm scripts
pnpm lint && pnpm format && pnpm typecheck
```

## Available Scripts

### Linting

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting errors
pnpm lint:fix

# Lint contracts only
pnpm lint:contracts
```

### Formatting

```bash
# Check formatting
pnpm format

# Format all files
pnpm format:fix

# Validate formatting (same as format)
pnpm format:check
```

### Type Checking

```bash
# Type check all workspaces
pnpm typecheck

# Type check web app only
pnpm typecheck:web

# Type check shared package only
pnpm typecheck:shared
```

### All-in-One

```bash
# Fix all issues
./scripts/lint.sh

# Validate all checks
./scripts/validate.sh
```

## Pre-Commit Hooks

Pre-commit hooks automatically run when you commit files:

```bash
git add .
git commit -m "feat: add new feature"
```

The hooks will:
1. Run ESLint on staged files
2. Run Prettier on staged files
3. Format code automatically
4. Block commit if errors remain

### Bypass Hooks

If you need to bypass hooks:

```bash
git commit --no-verify -m "WIP: force commit"
```

**Warning**: Use sparingly and only for good reason.

## Common Issues

### ESLint Errors

**Issue**: "Parsing error"

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue**: "Definition for rule not found"

```bash
# Check .eslintrc.js
# Verify all plugins are installed
pnpm list | grep eslint
```

### Prettier Errors

**Issue**: "Prettier conflicts with ESLint"

```bash
# Verify eslint-plugin-prettier is installed
pnpm list | grep prettier

# Make sure plugin:prettier/recommended is last in extends
```

**Issue**: "Prettier not formatting on save"

```bash
# Check VS Code settings
# .vscode/settings.json should have:
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Type Checking Errors

**Issue**: "Cannot find module"

```bash
# Check tsconfig.json paths
# Verify aliases are correct
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./apps/web/*"],
      "@avalanche-bridge/*": ["./packages/shared/*"]
    }
  }
}
```

## VS Code Integration

### Recommended Settings

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
  }
}
```

### Recommended Extensions

Install these VS Code extensions:

- ESLint (Microsoft)
- Prettier (Prettier)
- TypeScript (Microsoft)
- Error Lens (Microsoft)

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

- Lint checks to pass
- Type checks to pass
- Contract tests to pass

## Troubleshooting

### Dependencies Missing

```bash
# Install all dependencies
pnpm install

# Or install specific package
pnpm add eslint-plugin-prettier
```

### Hook Not Running

```bash
# Reinstall Husky
rm -rf .husky
pnpm prepare
```

### Caching Issues

```bash
# Clear caches
rm -rf node_modules/.cache
rm -rf apps/web/.next
rm -rf packages/shared/dist
```

## Best Practices

### Before Committing

1. Run linters manually:
   ```bash
   ./scripts/lint.sh
   ```

2. Review staged files:
   ```bash
   git diff --cached
   ```

3. Test your changes:
   ```bash
   pnpm test
   pnpm dev
   ```

4. Then commit:
   ```bash
   git add .
   git commit -m "feat: new feature"
   ```

### In Pull Request

1. Ensure all CI checks pass
2. Review linting comments
3. Fix any reported issues
4. Update changelog if needed
5. Request review

### Code Review

Checklist for reviewers:

- [ ] No ESLint errors
- [ ] No Prettier formatting issues
- [ ] No TypeScript errors
- [ ] Code follows style guide
- [ ] Functions documented
- [ ] Tests added if needed
- [ ] Changelog updated

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript ESLint Plugin](https://typescript-eslint.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

---

**Related Documentation**:
- [Development Guide](./docs/development/setup.md)
- [Code Style Guide](./docs/development/code-style.md)
- [Linting Guide](./docs/development/linting.md)
