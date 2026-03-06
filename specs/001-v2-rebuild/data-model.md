# Data Model: v2 Rebuild

**Branch**: `001-v2-rebuild` | **Date**: 2026-03-06

## Overview

All data is stored as a single JSON object in localStorage under the `lucyVocab` key. The schema below describes the v2 structure, which is a superset of v1 (all v1 fields preserved, new fields added with defaults).

## Entities

### AppState (root object in localStorage)

The top-level persisted object. One instance per app installation.

| Field | Type | Default | v1 Field? | Description |
|-------|------|---------|-----------|-------------|
| schemaVersion | number | 2 | No | Schema version for migration chaining |
| xp | number | 0 | Yes | Total experience points earned |
| streak | number | 0 | Yes | Current answer streak (consecutive correct) |
| bestStreak | number | 0 | Yes | Best-ever answer streak |
| sessions | number | 1 | Yes | Total sessions started (v1 legacy counter) |
| totalCorrect | number | 0 | Yes | Lifetime correct answers |
| totalAnswered | number | 0 | Yes | Lifetime total answers |
| lastLogin | string | today | Yes | Date string of last app open |
| speedHighScore | number | 0 | Yes | v1 speed mode high score (preserved, not used in v2) |
| words | object | {} | Yes | Per-word mastery data, keyed by hanzi string |
| dailyHistory | string[] | [] | Yes | Array of date strings when practice occurred |
| dailyStreak | number | 0 | Yes | Current daily streak count |
| bestDailyStreak | number | 0 | Yes | Best-ever daily streak |
| dailyRewards | object | {} | Yes | Claimed daily rewards, keyed by day threshold |
| badges | object | {} | Yes | Earned badges, keyed by badge ID, value is timestamp |
| unlockedThemes | string[] | ['default'] | Yes | Array of unlocked theme IDs |
| activeTheme | string | 'default' | Yes | Currently selected theme ID |
| lastPerfectRound | number | 0 | Yes | Timestamp of last perfect round (any mode) |
| _perfectMatch | boolean | false | Yes | Has achieved perfect Match round |
| _perfectContext | boolean | false | Yes | Has achieved perfect Context round |
| _lightningPairs | boolean | false | Yes | Has achieved Pairs round under 8 seconds |
| activeStatsTab | string | 'progress' | Yes | v1 stats tab selection (preserved for compat) |
| sessionsToday | number | 0 | No | Sessions completed today (resets daily) |
| lastSessionDate | string | '' | No | Date string of last session, for daily reset |

### WordMastery (per entry in `words` object)

Keyed by hanzi string (e.g. `words["端午节"]`).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| correct | number | 0 | Total correct answers for this word |
| streak | number | 0 | Consecutive correct answers (resets on wrong) |
| mastered | boolean | false | Whether word has been mastered (streak >= 3) |
| seen | number | 0 | Total times this word has appeared |
| wrong | number | 0 | Total wrong answers for this word |
| lastCorrect | number | 0 | Timestamp (ms) of last correct answer |

### Mastery State (computed, not stored)

Derived from WordMastery at render time. Never persisted.

| State | Condition | Visual |
|-------|-----------|--------|
| unseen | `seen === 0` | Grey border, no color |
| learning | `seen > 0 && !mastered` | Accent color border |
| mastered | `mastered && daysSinceCorrect < 7` | Green border |
| fading | `mastered && 7 <= daysSinceCorrect < 14` | Amber border |
| needs-review | `mastered && daysSinceCorrect >= 14` | Red border |

### Word (static data, in `js/data/words.js`)

| Field | Type | Description |
|-------|------|-------------|
| hanzi | string | Chinese characters |
| pinyin | string | Romanized pronunciation |
| english | string | English meaning |
| set | string | Word set identifier ('3A4B' or '2B') |

45 words total: 15 in set 3A4B, 30 in set 2B.

### ContextSentence (static data, in `js/data/sentences.js`)

| Field | Type | Description |
|-------|------|-------------|
| sentence | string | Chinese sentence with `_____` placeholder |
| answer | string | Hanzi string that fills the blank |
| english | string | English translation of the complete sentence |

90 sentences total: 2 per word for all 45 words.

### Badge (static data, in `js/data/badges.js`)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique badge identifier |
| emoji | string | Display emoji |
| name | string | Human-readable badge name |
| desc | string | Short description of unlock condition |
| test | function | Predicate that checks if badge should unlock |

16 badges (carried from v1):

| ID | Name | Condition |
|----|------|-----------|
| firstSteps | First Steps | 1+ correct answer |
| wordWatcher | Word Watcher | Master first word |
| halfwayThere | Halfway There | Master 50% of words |
| wordMaster | Word Master | Master all words |
| speedDemon | Speed Demon | 15+ speed high score (v1 legacy) |
| perfectMatch | Perfect Match | 10/10 in Match round |
| perfectContext | Perfect Context | 10/10 in Context round |
| lightningPairs | Lightning Pairs | Pairs round under 8 seconds |
| onFire | On Fire | 10 answer streak |
| blazing | Blazing | 25 answer streak |
| unstoppable | Unstoppable | 50 answer streak |
| weekWarrior | Week Warrior | 7-day daily streak |
| fortnightStrong | Fortnight Strong | 14-day daily streak |
| monthOfMastery | Month of Mastery | 30-day daily streak |
| xpHunter | XP Hunter | 500 total XP |
| xpLegend | XP Legend | 1000 total XP |

### Theme (static data, in `js/data/themes.js`)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Theme identifier (used in data-theme attribute) |
| name | string | Display name |
| bg | string | Background color hex |
| accent | string | Primary accent color hex |
| badge | string or null | Badge ID required to unlock (null = always unlocked) |

6 themes:

| ID | Name | Accent | Unlock Badge |
|----|------|--------|-------------|
| default | Default | #7c5cfc (purple) | none |
| sakura | Sakura | #e8789a (pink) | wordWatcher |
| ocean | Ocean | #3db8e8 (blue) | perfectMatch |
| sunset | Sunset | #e87830 (orange) | halfwayThere |
| neon | Neon | #00e676 (green) | xpHunter |
| midnight | Midnight | #8888cc (lavender) | weekWarrior |

### Session (runtime only, not persisted)

Tracks the current session in memory. Discarded on completion or abandonment.

| Field | Type | Description |
|-------|------|-------------|
| step | enum | Current step: 'flashcard', 'practice', 'writing', 'results' |
| flashcardWords | Word[] | 5 priority words for flashcard review |
| practiceRounds | object[] | 3 rounds, each with mode ID and question results |
| currentRound | number | Current round index (0-2) within practice step |
| modeRotation | string[] | Mode IDs for rounds, e.g. ['match', 'context', 'pairs'] |
| writingWords | Word[] | 5 priority words for writing practice |
| writingAttempts | object | Per-word attempt tracking (3 attempts each) |
| results | object | Aggregated score, mistakes, XP earned |

## State Transitions

### Word Mastery Lifecycle

```
unseen → learning (first seen in any mode)
learning → mastered (3 consecutive correct answers)
mastered → fading (7+ days since lastCorrect, computed)
fading → needs-review (14+ days since lastCorrect, computed)
needs-review → learning (wrong answer resets streak)
mastered/fading/needs-review → mastered (3 consecutive correct again)
```

### Session Flow

```
HOME → session.start() → FLASHCARD_REVIEW
FLASHCARD_REVIEW → (5 cards done) → PRACTICE_ROUND_1
PRACTICE_ROUND_1 → (10 questions done) → PRACTICE_ROUND_2
PRACTICE_ROUND_2 → (10 questions done) → PRACTICE_ROUND_3
PRACTICE_ROUND_3 → (10 questions done) → WRITING_PRACTICE
WRITING_PRACTICE → (5 words x 3 attempts done) → RESULTS
RESULTS → Done → HOME (sessionsToday++)
RESULTS → Again → session.start() (new session)
```

### Daily Streak

```
App opens → check lastSessionDate vs today
If different day: sessionsToday = 0, lastSessionDate = today
Session completes → sessionsToday++
If sessionsToday >= 3 AND today not in dailyHistory:
  → add today to dailyHistory
  → recalculate dailyStreak (consecutive days)
  → update bestDailyStreak if new record
  → check dailyRewards milestones
```

## Migration: v1 → v2

1. Read `lucyVocab` from localStorage
2. If `schemaVersion` is missing (v1 data):
   - Add `schemaVersion: 2`
   - Add `sessionsToday: 0`
   - Add `lastSessionDate: ''`
   - Backfill any missing v1 fields with defaults (same as v1's `loadState()` migration)
3. Write back to `lucyVocab`
4. All existing v1 fields are preserved unchanged
