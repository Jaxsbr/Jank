# Architecture Decisions Log

> **Purpose**: Historical record of key architectural decisions
> 
> **When to read**: Understanding why things are the way they are, considering changes

---

## How to Use This Log

**When to add an entry**:
- Major architectural decision made
- Pattern chosen over alternatives
- Technology selected
- Structure changed significantly

**Entry format**:
```markdown
### Decision N: [Title]
**Date**: [Date]  
**Decision**: [What was decided]  
**Context**: [What problem/situation led to this]  
**Alternatives Considered**: [What else was considered]  
**Reasoning**: [Why this option was chosen]  
**Impact**: [What this affects, consequences]  
**Status**: [Active | Superseded | Deprecated]
```

---

## Decisions

### Decision 1: State Separation (RunState vs PlayerProfile)

**Date**: October 8, 2025  
**Decision**: Complete separation of RunState and PlayerProfile from day one  

**Context**: Building roguelite game with both within-run progression (scrap, machines) and between-run progression (skills, parts). Need to ensure Phase 2 features can be added without refactoring Phase 1.

**Alternatives Considered**:
1. Single unified game state (mix temporary and permanent)
2. Add persistent state later when needed
3. Use flags to mark what persists

**Reasoning**: 
- Phase 2 progression systems require this separation
- Refactoring later would be expensive and error-prone
- Clear boundaries prevent bugs (temp state leaking into saves)
- Makes it obvious what resets each run

**Impact**:
- Two separate state classes from start
- Bridge between states only at run start/end
- Easier Phase 2 implementation
- Clearer code organization

**Status**: Active

---

### Decision 2: Modifier Pattern for Stats

**Date**: October 8, 2025  
**Decision**: Robot stats use base + permanentModifiers + temporaryModifiers pattern  

**Context**: Multiple systems affect robot stats: skills (permanent), parts (permanent), machines (temporary). Need extensible pattern that works across all phases.

**Alternatives Considered**:
1. Directly mutate stats when upgrades happen
2. Separate stat objects for each source
3. Calculated properties that sum on access

**Reasoning**:
- Multiple systems affect same stats
- Need to distinguish permanent vs temporary for run reset
- Easy to debug (inspect each layer separately)
- No refactoring needed when adding new modifier sources
- Scales to unlimited modifier sources

**Impact**:
- All stat-bearing entities use this pattern
- Skill tree and machine upgrades use same system
- Easy to add new modifier sources in future
- Clear debugging (see each layer independently)

**Status**: Active

---

### Decision 3: Event-Driven Communication

**Date**: October 8, 2025  
**Decision**: Primary communication via EventBus, direct injection only for core utilities  

**Context**: Need to support optional features (VFX, audio, analytics), extensibility, and loose coupling between systems.

**Alternatives Considered**:
1. Direct method calls between systems
2. Observer pattern with interfaces
3. Message queue system

**Reasoning**:
- Loose coupling between systems
- Easy to add/remove features
- Optional systems (VFX, audio) can be toggled
- Clear audit trail of what happens when
- Easy to test (mock event bus)
- Minimal performance overhead for game scale

**Impact**:
- More files to navigate initially
- Need to trace event flow for debugging
- But: much easier long-term maintenance
- Features don't modify existing code
- Clear separation of concerns

**Status**: Active

---

### Decision 4: Config-Driven Design

**Date**: October 8, 2025  
**Decision**: All tuning values in central config.js, no hardcoding  

**Context**: Game needs frequent balancing, multiple content types (enemies, parts, skills), potential for modding/expansion.

**Alternatives Considered**:
1. Hardcode values in classes
2. Individual JSON files per content type
3. Database for content

**Reasoning**:
- Easy balancing (change one place)
- Clear documentation (all values visible)
- No magic numbers in code
- Can add content without code changes
- Potential for loading from files later

**Impact**:
- Config file will be large (~400 lines) but well-organized
- All developers must use config
- Easy to tweak balance
- Content can be data-driven

**Status**: Active

---

### Decision 5: Machine Upgrades Reset Each Run

**Date**: October 8, 2025  
**Decision**: Machine upgrades always start at level 0 each run (never persist)  

**Context**: Defining the dual progression loop that creates strategic depth. Need to prevent trivializing content while maintaining meta-progression.

**Alternatives Considered**:
1. Machines persist between runs (like skills)
2. Partial persistence (keep some levels)
3. Currency to buy starting levels

**Reasoning**:
- Creates the "chore layer" that adds tactical depth
- Forces strategic timing decisions each run
- Prevents trivializing content (can't just max everything)
- Run-to-run variety (different upgrade paths)
- Even with strong robot, need to execute well

**Impact**:
- Every run starts with machines at level 0
- Scrap resets each run
- Strategic machine upgrade order matters
- Economic management gameplay
- Run feels fresh each time

**Status**: Active

---

### Decision 6: Modular Architecture Documentation

**Date**: October 8, 2025  
**Decision**: Split monolithic ARCHITECTURE.md into 13 modular files  

**Context**: Original 1811-line document caused context bloat for AI assistants, hard to maintain, difficult to navigate.

**Alternatives Considered**:
1. Keep as single file
2. Split only when exceeds certain size
3. Multiple small files but no index

**Reasoning**:
- LLM efficiency (load only needed sections)
- Better maintainability (edit one section at a time)
- Easier navigation (jump to specific topic)
- Git-friendly (isolated changes)
- Scales as project grows
- Parallel work (multiple people editing different sections)

**Impact**:
- Created `/docs/architecture/` directory
- 13 focused files (50-400 lines each)
- Index file for navigation
- Management guide for maintenance
- Better token efficiency
- Clearer organization

**Status**: Active

---

## Decision Template (Copy for New Entries)

```markdown
### Decision N: [Title]

**Date**: [Date]  
**Decision**: [What was decided]  

**Context**: [What problem/situation led to this]

**Alternatives Considered**:
1. [Alternative 1]
2. [Alternative 2]
3. [Alternative 3]

**Reasoning**:
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Impact**:
- [Impact 1]
- [Impact 2]
- [Impact 3]

**Status**: [Active | Superseded | Deprecated]
```

---

## Superseded/Deprecated Decisions

*None yet*

When a decision is superseded, move it here and update status with reason:

```markdown
### Decision N: [Old Decision]
**Status**: Superseded by Decision M (see above)  
**Reason**: [Why it was changed]
```

---

## Related Documentation

- See current architecture: [Core Principles](01-core-principles.md)
- See decision impact: [System Overview](02-system-overview.md)
- Ask questions: [Q&A / Troubleshooting](13-qa-troubleshooting.md)
