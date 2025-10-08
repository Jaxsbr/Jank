# Cursor Rules for Jank Project

## Rule Files

### Core Rules (Read These First)

1. **[00-vision.mdc](00-vision.mdc)** - Project vision, purpose, and principles
2. **[01-ai-protocol.mdc](01-ai-protocol.mdc)** - How AI and human collaborate effectively
3. **[02-architecture.mdc](02-architecture.mdc)** - Code organization and patterns
4. **[03-standards.mdc](03-standards.mdc)** - Code quality standards
5. **[04-tools.mdc](04-tools.mdc)** - Development tools and commands

## Quick Start

### First Time Setup

1. **Read 00-vision.mdc** - Understand project goals
2. **Read 01-ai-protocol.mdc** - Critical collaboration protocols
3. **Skim others** - Reference as needed

### Daily Workflow

Start: `"start session"`
- Checks git status
- Reviews current priorities
- Ready to begin

Work: Follow incremental implementation
- Small changes (1-2 files max)
- Test after each step
- Confirm before continuing

End: `"end session"`
- Ensures all work committed
- Documents what's next

## Critical Protocols

### 🚨 STOP and Ask If:
- Request is ambiguous
- Multiple interpretations possible
- Would touch 3+ files at once
- File approaching 400 lines

### ✅ Always:
- Confirm understanding before implementing
- Implement incrementally with checkpoints
- Request testing after each change
- Only suggest commit after confirmation

### ❌ Never:
- Implement without confirming ambiguous requests
- Change entire phases at once
- Suggest commit before testing confirmed
- Add code to 400+ line files without refactoring

## Rule Development

These rules were created from lessons learned on the CuteDefense project:
- Original rules: 414 lines, 65% effective
- Feedback analysis: Identified 6 critical gaps
- Updated rules: Focus on enforcement and protocols

### Key Improvements

1. **Living Architecture Documentation** - `docs/ARCHITECTURE.md` (modular) kept up to date
2. **Disambiguation Protocol** - Confirm before implementing
3. **Incremental Implementation** - Checkpoint-based development
4. **Commit After Confirmation** - Test → confirm → commit
5. **Active File Size Enforcement** - Check before adding code
6. **Configuration Management** - Proactive config file

## File Descriptions

### 00-vision.mdc (~50 lines)
- Project purpose and goals
- Core principles
- Success criteria
- Design guidelines

### 01-ai-protocol.mdc (~200 lines) - MOST IMPORTANT
- Disambiguation protocol
- Incremental implementation
- Testing & commit workflow
- File size monitoring
- Communication principles

**This is the most critical file.** It prevents:
- Wrong component changes
- Large untestable changesets
- Premature commits
- Code bloat

### 02-architecture.mdc (~150 lines)
- Living documentation (`docs/ARCHITECTURE.md` - modular structure, 13 files)
- How to use modular docs (load only needed sections for efficiency)
- File organization patterns (< 400 lines per file)
- Component communication (event-driven)
- Configuration management (central config.js)
- Domain patterns (ECS, etc.)
- Performance patterns

### 03-standards.mdc (~150 lines)
- File size limits (ENFORCED)
- Function quality guidelines
- Naming conventions
- Comment guidelines
- Git commit standards
- Code review checklist

### 04-tools.mdc (~100 lines)
- Quick commands
- Debug toggles
- Performance profiling
- Development helpers
- Workflow automation

**Total**: ~650 lines (was 414, added critical protocols)

## Effectiveness Metrics

Rules are working if:
- ✅ Fewer "wrong component" implementations
- ✅ Smaller, testable changes
- ✅ No commits before testing
- ✅ Files stay under 400 lines
- ✅ Clear communication
- ✅ Architecture docs stay current

Track these over first few weeks and adjust rules as needed.

## Rule Evolution

### Week 1: Baseline
- Follow rules as written
- Note what works / doesn't work
- Identify pain points

### Week 2-4: Adjust
- Add rules for recurring issues
- Remove unused rules
- Simplify complex rules

### Monthly: Audit
- Review effectiveness metrics
- Remove low-value rules
- Enhance high-value rules

## Getting Help

If rules are unclear, too complex, or not working:
1. Say: "This rule isn't working because [reason]"
2. We'll discuss and adjust
3. Update rules based on feedback

**Rules should help, not hinder.** They're guidelines that evolve with the project.

## Related Documents

### In Project Root
- **`docs/ARCHITECTURE.md`** - Living architecture index (13 modular files, already created!)
- **config.js** - Central configuration file
- **README.md** - Project overview

### In .cursor/rules/
- This README
- 5 rule files (.mdc)

## Philosophy

These rules are based on real-world lessons:

1. **Simple > Complex** - Minimal effective rules
2. **Honest > Aspirational** - Document reality, not wishes
3. **Flexible > Rigid** - Guidelines, not laws
4. **Measurable > Vague** - Clear thresholds
5. **Valuable > Comprehensive** - Every rule earns its place

## Version

**Version**: 2.0 (Feedback-informed)
**Created**: October 2025
**Based on**: CuteDefense project analysis + developer feedback

**Previous version issues addressed**:
- ✅ Disambiguation protocol added
- ✅ Incremental implementation enforced
- ✅ Commit timing fixed
- ✅ File size actively enforced
- ✅ Living documentation protocol added
- ✅ Configuration management added

---

**Remember**: These rules exist to make development better. If they don't, let's improve them!

