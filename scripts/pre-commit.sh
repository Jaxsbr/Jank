#!/bin/bash

# Pre-commit hook for JANK project
# Run linting and tests on changed files

echo "Running pre-commit checks..."

# Run ESLint on changed files
npm run lint

# Run tests on changed files
npm run test:changed

# Reminder about documentation
echo ""
echo "Remember: Update documentation in docs/ when adding new meta upgrades, abilities, or gameplay systems!"

echo "Pre-commit checks completed!"
