# Handoff Checklist

> **Purpose**: Onboarding guide for engineers joining at any phase
> 
> **When to read**: First day on project, before making changes, after making changes

---

## For Engineers Joining Mid-Project

### First Day

**Read these documents** (in order, ~2 hours):
- [ ] [README.md](../../README.md) - Quick start guide
- [ ] [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture index (skim, bookmark)
- [ ] [Core Principles](01-core-principles.md) - The 4 foundational principles
- [ ] [SPEC.md](../../SPEC.md) sections 1-2 - Game concept

**Get the game running** (~30 minutes):
- [ ] Clone repository
- [ ] Install dependencies (`npm install` or equivalent)
- [ ] Run game locally (see README)
- [ ] Play through a few waves
- [ ] Understand the game loop

**Explore the codebase** (~1 hour):
- [ ] Review [Directory Structure](08-directory-structure.md)
- [ ] Browse `config/config.js` - understand tuning values
- [ ] Review [Component Responsibilities](04-component-responsibilities.md) - skim, reference later
- [ ] Check [Communication Patterns](05-communication-patterns.md) - understand event flow

**Set up development environment**:
- [ ] Configure editor/IDE
- [ ] Run tests (if any exist)
- [ ] Verify you can make changes and see them
- [ ] Bookmark architecture docs for easy access

---

### Before Making Changes

**For ANY feature or bug fix**:
- [ ] Understand the feature/bug fully
- [ ] Identify which system owns this responsibility (see [Component Responsibilities](04-component-responsibilities.md))
- [ ] Check if config needs updating (extract magic numbers)
- [ ] Check file sizes of files you'll edit (plan splitting if approaching 300 lines)
- [ ] Understand event flow (which events to emit/listen - see [Communication Patterns](05-communication-patterns.md))
- [ ] Ask questions if unclear!

**For new features**:
- [ ] Read relevant architecture sections
- [ ] Understand [which patterns apply](07-critical-patterns.md)
- [ ] Sketch implementation approach
- [ ] Get feedback before implementing

**For bug fixes**:
- [ ] Reproduce the bug
- [ ] Understand root cause
- [ ] Identify affected systems
- [ ] Plan fix approach

---

### After Making Changes

**Before committing**:
- [ ] Test the feature/fix thoroughly (see [Testing Strategy](10-testing-strategy.md))
- [ ] Run regression tests (did you break anything?)
- [ ] Test edge cases
- [ ] Check console for errors
- [ ] Verify performance (no frame rate drops)

**Documentation updates**:
- [ ] Update architecture docs if structure changed
- [ ] Update config.js if new constants added
- [ ] Document new events in [Communication Patterns](05-communication-patterns.md)
- [ ] Add Q&A entry if you solved a tricky problem

**Code quality**:
- [ ] Check file sizes (split if exceeded 400 lines)
- [ ] Remove console.logs (except intentional logging)
- [ ] Remove commented-out code
- [ ] Ensure consistent formatting

**Commit**:
- [ ] Write descriptive commit message (see [Code Quality Standards](../../.cursor/rules/CODE_QUALITY.md))
- [ ] Include architecture doc updates in same commit
- [ ] Push to branch for review

---

## For Phase Handoffs

### Completing Phase 1

**Code complete**:
- [ ] All Phase 1 checklist items implemented (see [Implementation Phases](06-implementation-phases.md#phase-1-core-mvp-weeks-1-3))
- [ ] All features tested and working
- [ ] No known critical bugs

**Architecture validated**:
- [ ] RunState completely isolated from any persistent data
- [ ] Robot using modifier pattern (base + permanent + temporary)
- [ ] All magic numbers extracted to config
- [ ] Event bus has clear event naming conventions
- [ ] All files under 400 lines (split if exceeded)

**Documentation current**:
- [ ] Architecture docs updated with actual file locations
- [ ] Config documented
- [ ] Event catalog complete
- [ ] Q&A updated with any tricky issues solved

**Ready for Phase 2**:
- [ ] Code committed and tagged (`v1.0-phase1-complete`)
- [ ] Team/AI briefed on phase completion
- [ ] Phase 2 goals reviewed
- [ ] No blocking issues

---

### Completing Phase 2

**Features complete**:
- [ ] Player can accumulate and spend skill points
- [ ] Parts can be equipped and provide bonuses
- [ ] Progression feels meaningful (noticeable power increase)
- [ ] Data saves and loads correctly

**Architecture maintained**:
- [ ] Clear separation maintained between RunState and PlayerProfile
- [ ] No temporary state leaked into persistence
- [ ] No permanent state leaked into run state
- [ ] Files still under 400 lines (split if needed)

**Regression verified**:
- [ ] All Phase 1 features still work
- [ ] No performance degradation
- [ ] No new bugs introduced

**Documentation updated**:
- [ ] Phase 2 components documented
- [ ] Phase 2 events documented
- [ ] Phase 2 patterns documented
- [ ] Q&A updated

---

## Common Questions from New Engineers

### Q: Where do I start?
**A**: Read [Core Principles](01-core-principles.md) first, then dive into [Component Responsibilities](04-component-responsibilities.md) for the system you're working on.

### Q: Where does feature X belong?
**A**: Check [Component Responsibilities](04-component-responsibilities.md). Still unclear? Ask the team or look at similar features.

### Q: Can I use direct method calls between systems?
**A**: Only if there's clear ownership. Prefer events for cross-system communication. See [Communication Patterns](05-communication-patterns.md).

### Q: Where do I put this constant?
**A**: In [config/config.js](09-configuration.md). Always.

### Q: This file is 500 lines, what do I do?
**A**: Stop and refactor before adding more. Split by responsibility. See [Directory Structure](08-directory-structure.md#file-splitting-strategy).

### Q: Do I need to write tests?
**A**: For Phase 1, manual testing is fine. For complex logic (pathfinding, damage calculation), unit tests are recommended. See [Testing Strategy](10-testing-strategy.md).

### Q: I found a better way to structure this, can I refactor?
**A**: Maybe. Check with team first. Major refactors should be separate from feature work. Don't break working code without good reason.

### Q: The documentation doesn't match the code, which is correct?
**A**: The code is the truth. Update the documentation immediately to match reality.

---

## Red Flags (Stop and Ask)

If you encounter any of these, **stop and ask for help**:

🚩 Mixing temporary and permanent state  
🚩 Hardcoding numbers that should be in config  
🚩 Direct method calls between unrelated systems  
🚩 File exceeding 400 lines  
🚩 Unclear where code belongs  
🚩 Breaking existing tests  
🚩 Can't figure out how to test your change  
🚩 Performance degradation  
🚩 Architecture violation you're not sure how to fix  

---

## Success Metrics

You're doing well if:
- ✅ You can find relevant code quickly
- ✅ You understand why decisions were made
- ✅ You can add features without breaking existing code
- ✅ Your changes integrate smoothly
- ✅ Documentation stays current
- ✅ Code reviews are smooth

---

## Related Documentation

- Understand the project: [SPEC.md](../../SPEC.md)
- Understand architecture: [Core Principles](01-core-principles.md)
- Find specific information: [ARCHITECTURE.md](../ARCHITECTURE.md) index
