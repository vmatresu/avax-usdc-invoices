#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running code validation...${NC}"

# Step 1: Check ESLint (no auto-fix)
echo -e "\n${YELLOW}1. Checking ESLint...${NC}"
pnpm lint || {
  echo -e "${RED}ESLint found issues. Run 'pnpm lint:fix' to auto-fix.${NC}"
  exit 1
}
echo -e "${GREEN}✓ ESLint passed${NC}"

# Step 2: Check Prettier formatting
echo -e "\n${YELLOW}2. Checking Prettier formatting...${NC}"
pnpm format || {
  echo -e "${RED}Prettier found formatting issues. Run 'pnpm format:fix' to fix.${NC}"
  exit 1
}
echo -e "${GREEN}✓ Prettier formatting correct${NC}"

# Step 3: Type check
echo -e "\n${YELLOW}3. Checking TypeScript types...${NC}"
pnpm typecheck || {
  echo -e "${RED}TypeScript type check failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ TypeScript type check passed${NC}"

# Step 4: Contract linting (if contracts exist)
if [ -d "contracts" ] && [ -f "contracts/foundry.toml" ]; then
  echo -e "\n${YELLOW}4. Checking Foundry linting...${NC}"
  pnpm lint:contracts || {
    echo -e "${RED}Foundry linting found issues${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Foundry linting passed${NC}"
fi

echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}All validation checks passed!${NC}"
echo -e "${GREEN}====================================${NC}"
