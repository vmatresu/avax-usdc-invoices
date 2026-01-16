#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running linting and formatting...${NC}"

# Step 1: Run ESLint with auto-fix
echo -e "\n${YELLOW}1. Running ESLint with auto-fix...${NC}"
pnpm lint:fix || {
  echo -e "${RED}ESLint failed with errors${NC}"
  exit 1
}
echo -e "${GREEN}✓ ESLint passed${NC}"

# Step 2: Run Prettier to format code
echo -e "\n${YELLOW}2. Running Prettier to format code...${NC}"
pnpm format:fix || {
  echo -e "${RED}Prettier failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ Prettier formatting complete${NC}"

# Step 3: Type check
echo -e "\n${YELLOW}3. Running TypeScript type check...${NC}"
pnpm typecheck || {
  echo -e "${RED}TypeScript type check failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ TypeScript type check passed${NC}"

# Step 4: Contract linting (if contracts exist)
if [ -d "contracts" ] && [ -f "contracts/foundry.toml" ]; then
  echo -e "\n${YELLOW}4. Running Foundry linting...${NC}"
  pnpm lint:contracts || {
    echo -e "${RED}Foundry linting failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Foundry linting passed${NC}"
fi

echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}All linting and formatting complete!${NC}"
echo -e "${GREEN}====================================${NC}"
