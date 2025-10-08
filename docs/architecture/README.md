# Architecture Documentation - Maintenance Guide

## Principles

1. **One concept per file** - If a file exceeds 400 lines, split by sub-topic
2. **Index is navigation** - Keep ARCHITECTURE.md under 100 lines
3. **Cross-reference freely** - Link between docs using relative paths
4. **Update as you go** - Change code? Update relevant doc immediately

---

## When to Update

| Event | Action |
|-------|--------|
| Add new component | Update `04-component-responsibilities.md` |
| New event added | Update `05-communication-patterns.md` |
| Architectural decision | Add entry to `12-decisions-log.md` |
| File structure changes | Update `08-directory-structure.md` |
| Config values added | Update `09-configuration.md` |
| Question answered | Add to `13-qa-troubleshooting.md` |
| New pattern emerges | Update `07-critical-patterns.md` |
| Phase completed | Update `06-implementation-phases.md` |

---

## Splitting Large Files

If any doc exceeds 400 lines:
1. Identify natural sub-topics
2. Create sub-files (e.g., `04a-phase1-components.md`, `04b-phase2-components.md`)
3. Update index ARCHITECTURE.md with new structure
4. Add navigation links between related sections

Example:
```markdown
# Component Responsibilities

See specific phases:
- [Phase 1 Components](04a-phase1-components.md)
- [Phase 2 Components](04b-phase2-components.md)
- [Rendering Systems](04c-rendering.md)
```

---

## Cross-Referencing

Use relative paths from the document's location:

```markdown
<!-- From ARCHITECTURE.md (root) -->
See [Component Responsibilities](docs/architecture/04-component-responsibilities.md)

<!-- From within architecture/ directory -->
See [Communication Patterns](05-communication-patterns.md#event-driven-pattern)

<!-- From within architecture/, referencing root -->
See [SPEC.md](../../SPEC.md#section-3)
```

---

## File Naming Convention

- Use numbers for ordering: `01-`, `02-`, etc.
- Use kebab-case: `component-responsibilities.md`
- Be descriptive but concise
- Sub-files use letters: `04a-`, `04b-`

---

## Version Control

### Commit Messages
```
docs(architecture): add new component documentation
docs(architecture): split component file into phase-specific docs
docs(architecture): update data flow for Phase 2
```

### Commit Strategy
- **Always** commit architecture changes WITH code changes
- Use same commit for related code + doc updates
- Never let docs drift from reality

### Example Commit
```bash
git add src/systems/NewSystem.js docs/architecture/04-component-responsibilities.md
git commit -m "feat(systems): add NewSystem + docs"
```

---

## AI Assistant Instructions

When using AI assistants (Cursor, Claude, etc.):

1. **Start with index**: Always read `ARCHITECTURE.md` first
2. **Load only what's needed**: Don't load all architecture files at once
3. **Update inline**: When making code changes, update relevant architecture file in same session
4. **Check cross-references**: When editing one file, check if linked files need updates

### Example Workflow
```
User: "Add a new enemy type"
AI: 
  1. Read ARCHITECTURE.md (find relevant section)
  2. Read 04-component-responsibilities.md#enemy-system
  3. Read 09-configuration.md (to add config)
  4. Implement code
  5. Update both architecture files in same response
```

---

## Quality Checks

Before committing architecture changes:
- [ ] All internal links work
- [ ] No file exceeds 400 lines
- [ ] Cross-references are accurate
- [ ] Version history updated if structural change
- [ ] Code examples compile/are correct
- [ ] Consistent terminology throughout

---

## Common Patterns

### Adding New Component
1. Update `04-component-responsibilities.md`
2. Update `05-communication-patterns.md` (if events involved)
3. Update `08-directory-structure.md` (file location)
4. Update `09-configuration.md` (if config needed)

### New Phase Started
1. Update `06-implementation-phases.md`
2. Update version in `ARCHITECTURE.md` header
3. Add phase-specific sections to component docs

### Architectural Decision Made
1. Add entry to `12-decisions-log.md`
2. Update relevant principle in `01-core-principles.md` if applicable
3. Add Q&A to `13-qa-troubleshooting.md` explaining rationale

---

## Maintenance Schedule

**Weekly** (or every 10 commits):
- Review all architecture files for accuracy
- Check for outdated information
- Look for opportunities to improve clarity
- Validate all cross-references still work

**Phase Completion**:
- Comprehensive review of all docs
- Update version numbers
- Archive old decisions/notes if no longer relevant
- Celebrate! 🎉

---

## Questions?

If something is unclear about maintaining these docs:
1. Ask the team
2. Add clarification here
3. Update relevant architecture file with better explanation

**Remember**: Good documentation is a living artifact that evolves with the codebase.
