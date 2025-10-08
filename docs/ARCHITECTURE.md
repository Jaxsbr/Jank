# Factory Defense - Architecture Index

> **Purpose**: Navigation hub for modular architecture documentation
> 
> **Last Updated**: October 8, 2025 - v2.0 - Refactored into modular sections
> 
> **Current Phase**: Pre-implementation planning

---

## 🚀 Quick Start

**New engineers start here**: [Handoff Checklist](architecture/11-handoff-checklist.md)

**Looking for specific info?**
- How systems work together? → [System Overview](architecture/02-system-overview.md)
- Where to add feature? → [Component Responsibilities](architecture/04-component-responsibilities.md)
- How to communicate between systems? → [Communication Patterns](architecture/05-communication-patterns.md)
- What are the config values? → [Configuration](architecture/09-configuration.md)
- Common questions? → [Q&A / Troubleshooting](architecture/13-qa-troubleshooting.md)

---

## 📚 Core Documentation

### [1. Core Principles](architecture/01-core-principles.md) ⭐
**Read first** - The 4 architectural pillars:
- State Separation (RunState vs PlayerProfile)
- Modifier-Based Stats (base + permanent + temporary)
- Event-Driven Communication
- Configuration Over Hardcoding

### [2. System Overview](architecture/02-system-overview.md)
High-level architecture diagrams and system dependencies

### [3. Data Architecture](architecture/03-data-architecture.md)
State management, data flows (run start/end), persistence patterns

### [4. Component Responsibilities](architecture/04-component-responsibilities.md)
**Largest section** - Detailed breakdown of all systems:
- Phase 1: Robot, Enemy, Combat, Waves, Machines, Scrap
- Phase 2: PlayerProfile, SkillTree
- Rendering systems

### [5. Communication Patterns](architecture/05-communication-patterns.md)
Event bus usage, event catalog, when to use events vs injection

### [6. Implementation Phases](architecture/06-implementation-phases.md)
Phase-by-phase roadmap with task breakdowns and handoff checklists

### [7. Critical Design Patterns](architecture/07-critical-patterns.md)
Key patterns: Modifier Aggregation, State Isolation, Config-Driven, Event-Driven

### [8. Directory Structure](architecture/08-directory-structure.md)
File organization and naming conventions

### [9. Configuration Management](architecture/09-configuration.md)
Config structure, rules, and all game constants

### [10. Testing Strategy](architecture/10-testing-strategy.md)
Unit testing approach and manual testing checklists

### [11. Handoff Checklist](architecture/11-handoff-checklist.md)
**For new engineers** - Onboarding steps and before/after change checklists

### [12. Architecture Decisions Log](architecture/12-decisions-log.md)
Historical record of key decisions and rationale

### [13. Q&A / Troubleshooting](architecture/13-qa-troubleshooting.md)
Common questions and their answers

---

## 🛠️ For Maintainers

See [architecture/README.md](architecture/README.md) for:
- How to update architecture docs
- When to split large files
- Cross-referencing guidelines
- Version control practices

---

## 📊 Document Stats

Total sections: 13  
Last major refactor: October 8, 2025 (v2.0 - modular split)  
Status: All sections created, content validated

---

## Version History

### 2.0 - October 8, 2025
- **Major refactor**: Split monolithic 1811-line document into 13 modular files
- Improved maintainability and context efficiency
- Added management guide (architecture/README.md)
- Reorganized content for better navigation

### 1.1 - October 8, 2025
- Clarified dual progression system
- Emphasized robot stats locking and machine reset behavior
- Updated data flow diagrams

### 1.0 - October 8, 2025
- Initial architecture design
- Documented core patterns for Phase 1-2
