#!/bin/bash

# Pre-commit hook for JANK project
# Run linting and tests on changed files

echo "Running pre-commit checks..."

# Run ESLint on changed files
npm run lint

# Run tests on changed files
npm run test:changed

echo "Pre-commit checks completed!"
