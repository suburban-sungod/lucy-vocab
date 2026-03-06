# Feature Specification: v2 Rebuild

**Feature Branch**: `001-v2-rebuild`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Rebuild the app with a clean file structure. Preserve all v1 functionality: home screen mastery grid, progress screen, all four practice modes, spaced repetition, themes, streaks, XP, achievements and data migration from v1 localStorage. Clean up the interface so that it feels more streamlined like other modern apps (duolingo / locket). Make it modular so that it's easy to add extra capability later... for instance one area that Lucy is falling behind on is writing... where she hears a character and has to write it in class. The app doesn't solve for that."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Structured practice session (Priority: P1)

Lucy opens the app and starts a session. Each session has three sequential steps: (1) review 5 priority flashcards, (2) complete 3 single-mode practice rounds, (3) writing practice for 5 priority words. Each step uses one modality at a time -- no mixed modes. Lucy progresses through the steps in order and sees her results at the end.

**Why this priority**: The structured session is the core learning loop. It combines review, active recall and writing reinforcement in a single guided flow.

**Independent Test**: Can be fully tested by starting a session, completing all three steps and verifying the results screen shows score and that mastery data has updated.

**Acceptance Scenarios**:

1. **Given** Lucy starts a session, **When** step 1 begins, **Then** she sees 5 flashcards selected by spaced repetition priority, one at a time (tap to flip, got-it/need-practice response)
2. **Given** step 1 is complete, **When** step 2 begins, **Then** she completes 3 practice rounds, each using a single mode (match, context or pairs), with each round containing 10 questions
3. **Given** step 2 is complete, **When** step 3 begins, **Then** she hears 5 priority words spoken aloud and writes each character 3 times
4. **Given** all three steps are complete, **When** the session ends, **Then** she sees a results screen with her score, mistake review with audio replay and Done/Again buttons
5. **Given** the session has ended, **When** Lucy taps Done, **Then** she returns to the home screen and her daily session count increments

---

### User Story 2 - Home screen with session launcher (Priority: P1)

Lucy opens the app and sees a session-focused home screen. The primary action is starting her next practice session. She can see how many of today's 3 sessions she's completed, her current streak and a quick summary of her mastery progress. The mastery grid is accessible but not the default landing view.

**Why this priority**: The home screen sets the tone. A session-focused landing drives Lucy straight to practice rather than passively browsing a grid.

**Independent Test**: Can be tested by opening the app with known progress data and verifying the session count, streak and mastery summary display correctly, and that the start button launches a session.

**Acceptance Scenarios**:

1. **Given** Lucy opens the app, **When** the home screen loads, **Then** she sees a prominent "Start Session" button, today's session progress (e.g. "1 of 3 done"), her current streak and a mastery summary (X mastered, Y learning, Z new)
2. **Given** Lucy has completed 0 of 3 sessions today, **When** she views the home screen, **Then** the session progress shows "0 of 3" and the start button is prominent
3. **Given** Lucy has completed all 3 sessions today, **When** she views the home screen, **Then** the day is marked complete with a celebration state, and she can still start bonus sessions
4. **Given** Lucy wants to browse individual words, **When** she navigates to the mastery grid view, **Then** she sees the 45-tile grid with color-coded mastery borders and can tap any tile for word details

---

### User Story 3 - Writing practice mode (Priority: P1)

Lucy hears a Chinese character spoken aloud and writes it on paper (physical, not on screen). When she's finished writing, she taps to reveal the correct character and self-checks her work. Each word is practiced 3 times. This mirrors her classroom experience where the teacher speaks a word and Lucy writes it.

**Why this priority**: Writing is Lucy's biggest gap. She can recognize characters but struggles to produce them from audio alone. This mode directly addresses that need with zero digital input complexity.

**Independent Test**: Can be tested by entering writing practice, hearing a word, tapping reveal and verifying the correct character displays clearly for self-checking.

**Acceptance Scenarios**:

1. **Given** writing practice begins, **When** a word is presented, **Then** Lucy hears the word spoken aloud via TTS and sees a prompt to write it on paper (no digital input area)
2. **Given** Lucy has written on paper, **When** she taps the reveal button, **Then** the correct character displays large and clear so she can compare against her handwriting
3. **Given** a word has been revealed, **When** Lucy marks her attempt (got-it/need-practice), **Then** the same word is presented again until she has attempted it 3 times total
4. **Given** Lucy has practiced all 5 words 3 times each, **When** writing practice ends, **Then** her self-reported results are included in the session score

---

### User Story 4 - Data migration from v1 (Priority: P1)

Lucy's dad deploys v2. When Lucy opens the app on her iPhone, all her existing progress (XP, streaks, mastery, badges, themes) carries over seamlessly from v1. She doesn't notice anything changed except the interface looks cleaner.

**Why this priority**: Lucy has months of progress in v1. Losing it would be devastating and destroy trust in the app.

**Independent Test**: Can be tested by seeding localStorage with v1-format data, loading v2, and verifying all progress values are correctly preserved and accessible.

**Acceptance Scenarios**:

1. **Given** v1 data exists in localStorage under the `lucyVocab` key, **When** v2 loads for the first time, **Then** it reads the v1 data, upgrades the schema in place and preserves all XP, streaks, per-word mastery, badges, themes and daily history
2. **Given** v1 data has been migrated, **When** Lucy views the mastery grid, **Then** mastery states match what she had in v1 (including time-based decay calculations)
3. **Given** no existing localStorage data exists, **When** v2 loads, **Then** it initializes a fresh data structure with sensible defaults

---

### User Story 5 - Spaced repetition and mastery decay (Priority: P1)

Words Lucy has mastered gradually fade over time if not reviewed. The app automatically prioritizes words that need review when selecting flashcard and writing practice words, ensuring she retains what she's learned through spaced intervals.

**Why this priority**: Spaced repetition is the learning science backbone. Without decay and re-prioritization the app is just random flashcards.

**Independent Test**: Can be tested by setting word mastery timestamps to various ages and verifying the selection algorithm prioritizes appropriately.

**Acceptance Scenarios**:

1. **Given** a word was mastered 8 days ago, **When** the mastery grid loads, **Then** the tile shows amber (fading) border instead of green
2. **Given** a word was mastered 15 days ago, **When** the app selects flashcard or writing practice words, **Then** it prioritizes this word over recently-mastered words
3. **Given** a word has 3 consecutive correct answers, **When** the session ends, **Then** the word is marked as mastered
4. **Given** a mix of unseen, learning and mastered words, **When** practice words are selected, **Then** unseen words get highest priority, followed by needs-review, then fading, then learning

---

### User Story 6 - Progress screen with streaks and calendar (Priority: P2)

Lucy taps the Progress tab and sees her daily streak count, best streak, a 5-week calendar grid showing which days she practiced, and daily prize milestones.

**Why this priority**: Streaks and visible progress drive daily habit formation. Important for engagement but not core learning.

**Independent Test**: Can be tested by navigating to the progress screen with known streak data and verifying the streak number, calendar fills and prize indicators display correctly.

**Acceptance Scenarios**:

1. **Given** Lucy has practiced 5 days in a row, **When** she views the progress screen, **Then** she sees "5" as the current streak with her best streak displayed
2. **Given** Lucy has practiced on various days, **When** she views the calendar grid, **Then** practiced days show filled squares and unpracticed days show empty squares
3. **Given** Lucy reaches a 7-day streak, **When** she views the progress screen, **Then** the $3 prize indicator is highlighted

---

### User Story 7 - Theme system (Priority: P2)

Lucy taps the palette button and browses unlockable color themes. Themes she's earned are selectable. Locked themes show the unlock condition. The selected theme applies across the entire app.

**Why this priority**: Themes are a reward mechanism that reinforces learning milestones. Cosmetic but motivating for a 7-year-old.

**Independent Test**: Can be tested by unlocking theme conditions in data, opening the theme picker and verifying available/locked states and theme application.

**Acceptance Scenarios**:

1. **Given** the top bar is showing, **When** Lucy taps the palette button, **Then** a theme picker overlay opens showing all 6 themes with their unlock status
2. **Given** Lucy has mastered her first word, **When** she opens the theme picker, **Then** the Sakura theme is unlocked and selectable
3. **Given** Lucy selects a new theme, **When** the picker closes, **Then** the entire app's color scheme updates to match the selected theme
4. **Given** Lucy has not met an unlock condition, **When** she views that theme, **Then** it shows as locked with the condition displayed

---

### User Story 8 - Engagement features: XP, achievements, animations (Priority: P2)

Lucy earns XP for correct answers, sees coin bursts on correct answers, confetti on milestones, Sadie (the dog) at streak milestones, mystery 2x XP bonuses and achievement toasts. Answer streak rewards show dollar amounts she can claim.

**Why this priority**: These features make the app fun and rewarding. They're what keeps a 7-year-old coming back. Not core learning but essential for retention.

**Independent Test**: Can be tested by triggering specific conditions (correct answers, streak milestones, XP thresholds) and verifying the corresponding animations and notifications appear.

**Acceptance Scenarios**:

1. **Given** Lucy answers correctly, **When** the answer is confirmed, **Then** she earns XP and a coin burst animation plays
2. **Given** Lucy reaches an answer streak of 10, **When** the streak triggers, **Then** Sadie appears on screen with a tap-to-dismiss interaction
3. **Given** Lucy answers correctly, **When** the ~15% random chance triggers, **Then** a mystery 2x XP golden popup appears
4. **Given** Lucy unlocks an achievement, **When** the condition is met, **Then** a toast notification appears with the badge name
5. **Given** Lucy reaches an answer streak of 20, **When** the milestone triggers, **Then** a $2 reward receipt appears that she can screenshot

---

### User Story 9 - Offline support and auto-update (Priority: P2)

The app works without internet after first load. When a new version is deployed, the service worker detects the update and refreshes the app automatically on Lucy's device.

**Why this priority**: Lucy uses the app at home and sometimes without wifi. Auto-update ensures she always has the latest version without manual intervention.

**Independent Test**: Can be tested by loading the app, going offline and verifying full functionality, then deploying a new version and verifying auto-update triggers.

**Acceptance Scenarios**:

1. **Given** the app has been loaded once, **When** the device goes offline, **Then** the app continues to function fully (all practice modes, data persistence, animations)
2. **Given** a new version is deployed, **When** Lucy opens the app, **Then** the service worker detects the update and refreshes to the new version
3. **Given** the app is installed to the home screen, **When** Lucy taps the icon, **Then** it launches as a standalone PWA

---

### User Story 10 - Modular architecture for future extensibility (Priority: P2)

The codebase is organized into separate modules (data, UI components, practice modes, engagement) so that new practice modes can be added without modifying existing code.

**Why this priority**: The explicit goal of the rebuild. v1's single 3,500-line file makes adding features impractical. Modularity is a prerequisite for future growth.

**Independent Test**: Can be tested by verifying that a new practice mode can be added by creating a new module and registering it, without modifying core files.

**Acceptance Scenarios**:

1. **Given** the codebase structure, **When** a developer examines the file organization, **Then** they find separate modules for data management, UI rendering, each practice mode, engagement features and theming
2. **Given** a new practice mode needs to be added, **When** a developer creates a new mode module, **Then** they can register it with the practice system without changing existing mode files
3. **Given** the app loads, **When** modules initialize, **Then** each module handles its own state and rendering without tight coupling to other modules

---

### User Story 11 - Streamlined modern interface (Priority: P2)

The interface follows modern app conventions (Duolingo/Locket-inspired): one clear action per screen, minimal chrome, large touch targets, smooth transitions and a floating bottom nav pill for switching between Home, Mastery Grid and Progress views.

**Why this priority**: The design refresh is a stated goal. A cleaner interface reduces cognitive load for a 7-year-old and makes the app feel current.

**Independent Test**: Can be tested by navigating through all screens and verifying touch targets meet 44x44px minimum, transitions are smooth and navigation is clear.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** Lucy views any screen, **Then** there is one primary action visible and all touch targets are at least 44x44px
2. **Given** the home screen is showing, **When** Lucy taps a nav button, **Then** a smooth transition takes her to the selected screen
3. **Given** a practice session is active, **When** the session is full-screen, **Then** the bottom nav is hidden and the focus is entirely on the current step

---

### Edge Cases

- What happens when localStorage is full or unavailable? The app should display a friendly message and continue functioning for the current session without persistence.
- What happens when a v1 data structure has missing fields? Migration should add default values for any new fields without overwriting existing data.
- What happens when Web Speech API is unavailable (e.g. older browsers)? Audio buttons should hide gracefully and practice modes should work without audio. Writing practice should show the character visually as a fallback when TTS is unavailable.
- What happens when the pairs mode has fewer than 4 words available? The mode should fall back to available words or be skipped in favor of another mode.
- What happens when Lucy closes the app mid-session? Progress for completed steps in that session should be saved. Incomplete steps are discarded.
- What happens when all 45 words are mastered? The app should celebrate the achievement and continue offering review sessions based on spaced repetition decay.
- What happens when Lucy completes 3 sessions and starts a 4th? The bonus session runs normally but does not count toward the daily streak (already earned).

## Requirements *(mandatory)*

### Functional Requirements

**Home Screen**

- **FR-001**: System MUST display a session-focused home screen with a prominent "Start Session" button, today's session progress (X of 3 completed), current streak and mastery summary (X mastered, Y learning, Z new)
- **FR-002**: System MUST allow Lucy to start bonus sessions after completing the daily 3, without affecting streak status
- **FR-003**: System MUST provide access to the mastery grid as a separate view (not the default landing screen)

**Mastery Grid**

- **FR-004**: System MUST display a 45-tile mastery grid in a 5-column layout showing character preview and English label per tile
- **FR-005**: System MUST color-code tile borders by mastery state: green (mastered, <7 days), amber (fading, 7-14 days), red (needs review, 14+ days), accent (learning), no color (unseen)
- **FR-006**: System MUST show a word detail overlay when any tile is tapped, including character, pinyin, English, audio button, mastery stats and a "Practice this word" button

**Navigation**

- **FR-007**: System MUST provide a floating bottom nav pill with Home, Mastery Grid and Progress views
- **FR-008**: System MUST show a top bar with streak count (left) and palette button (right)

**Session Structure**

- **FR-009**: A session MUST consist of three sequential steps: (1) flashcard review of 5 priority words, (2) three single-mode practice rounds of 10 questions each, (3) writing practice for 5 priority words
- **FR-010**: Each practice round in step 2 MUST use a single mode (match, context or pairs) -- no mixing modes within a round. The system rotates through the three modes across the 3 rounds
- **FR-011**: A day counts as practiced (for streak purposes) when 3 full sessions are completed that day
- **FR-012**: System MUST show session step progress so Lucy knows where she is in the flow (e.g. "Step 1 of 3: Flashcard Review")

**Practice Modes**

- **FR-013**: Flashcard mode MUST show card front (character) and back (pinyin + English), support tap-to-flip, swipe or button-based got-it/need-practice responses, mastery dots and audio/mic buttons
- **FR-014**: Match mode MUST show 4-option multiple choice with a 10-second timer, alternating between Chinese-to-English, English-to-Chinese and Pinyin-to-English directions, with half of hanzi questions as audio-only
- **FR-015**: Context mode MUST show fill-in-the-blank Chinese sentences with 4 word choices and a 15-second timer, drawing from 90 sentences (2 per word for all 45 words)
- **FR-016**: Pairs mode MUST show a grid of 4 Chinese + 4 English tiles for tap-to-match, consuming approximately 4 question slots
- **FR-017**: Writing mode MUST speak a word via TTS, prompt Lucy to write on paper, then reveal the correct character on tap for self-checking. Lucy marks each attempt as got-it or need-practice. Each word repeats 3 times. A "got-it" counts as a correct answer toward the word's mastery streak
- **FR-018**: System MUST show progress indicators within each practice round (e.g. dots for questions completed)
- **FR-019**: System MUST show a results screen at the end of the full session with score, mistake review with audio buttons and Done/Again actions
- **FR-020**: System MUST support focused mini-drills launched from word detail overlay: a short sequence of flashcard review, a few match/context questions and writing practice, all focused on that single word

**Spaced Repetition**

- **FR-021**: System MUST track per-word mastery with consecutive correct count, last correct timestamp and wrong count
- **FR-022**: System MUST calculate mastery decay: mastered (<7 days since last correct), fading (7-14 days), needs review (14+ days)
- **FR-023**: System MUST weight word selection by: days since last correct, wrong ratio, mastery staleness, with unseen words getting highest priority
- **FR-024**: Mastery threshold MUST be 3 consecutive correct answers

**Audio**

- **FR-025**: System MUST provide text-to-speech pronunciation for Chinese characters using zh-CN voice at 0.85 rate
- **FR-026**: System MUST support speech recognition via continuous mode for pronunciation practice on flashcard backs
- **FR-027**: System MUST auto-pronounce words during match mode questions
- **FR-028**: System MUST use TTS as the primary prompt in writing practice mode. No digital input is required -- Lucy writes on physical paper and self-checks against the revealed character

**Engagement**

- **FR-029**: System MUST track XP with levels: Beginner (0), Intermediate (200), Advanced (500), Master (1000)
- **FR-030**: System MUST track answer streaks with fire animation and daily streaks with calendar history
- **FR-031**: System MUST show coin burst animations on correct answers
- **FR-032**: System MUST show confetti on milestones using active theme colors
- **FR-033**: System MUST show Sadie (the dog) at answer streak multiples of 10
- **FR-034**: System MUST award daily login bonus of 10 XP
- **FR-035**: System MUST support 16 achievement badges with toast notifications on unlock
- **FR-036**: System MUST support mystery 2x XP with ~15% chance on correct answers
- **FR-037**: System MUST track answer streak rewards (20=$2, 30=$5, 40=$10) with timestamped receipt
- **FR-038**: System MUST track daily streak rewards (7d=$3, 14d=$5, 30d=$10)

**Themes**

- **FR-039**: System MUST support 6 color themes with unlock conditions: Default (none), Sakura (first mastered word), Ocean (perfect Match round), Sunset (50% mastered), Neon (500 XP), Midnight (7-day streak)
- **FR-040**: System MUST apply the selected theme across the entire app via CSS custom properties
- **FR-041**: System MUST show a theme picker overlay accessible from the palette button, with locked themes showing unlock conditions

**Data**

- **FR-042**: System MUST persist all progress in localStorage under the `lucyVocab` key
- **FR-043**: System MUST upgrade the v1 schema in place while preserving all existing values (XP, streaks, per-word mastery, badges, themes, daily history)
- **FR-044**: System MUST handle missing fields in migrated data by adding default values without overwriting existing data
- **FR-045**: System MUST provide a reset progress option in the theme overlay

**PWA**

- **FR-046**: System MUST work offline after first load via service worker with network-first caching
- **FR-047**: System MUST auto-update when a new version is deployed (cache version bump triggers refresh)
- **FR-048**: System MUST be installable to home screen via PWA manifest

**Architecture**

- **FR-049**: System MUST use a modular file structure with ES modules (separate files for data, UI, each practice mode, engagement, theming)
- **FR-050**: System MUST support registering new practice modes without modifying existing mode files
- **FR-051**: System MUST use no build tools, bundlers or package managers -- vanilla JS, CSS and HTML only
- **FR-052**: Word lists and context sentences MUST live in dedicated data files, separate from UI and logic code

**Interface**

- **FR-053**: System MUST provide minimum 44x44px touch targets for all interactive elements
- **FR-054**: System MUST support keyboard shortcuts in practice modes (space to flip, arrows to answer)
- **FR-055**: System MUST hide the bottom nav during full-screen practice sessions

### Key Entities

- **Word**: A vocabulary item with characters (Chinese), pinyin (romanization), English meaning, and word set membership (Week 3A-4B or Week 2B). 45 words total.
- **WordMastery**: Per-word learning state including consecutive correct count, total correct count, total wrong count, last correct timestamp and mastery level (unseen, learning, mastered, fading, needs-review).
- **UserProgress**: Aggregate learning state including XP, current level, answer streak, best answer streak, daily streak, best daily streak, daily history (dates practiced), sessions completed today, session count total, total correct/wrong.
- **Achievement**: One of 16 badges with an unlock condition, unlock timestamp and name.
- **Theme**: A named color palette with accent color, unlock condition and locked/unlocked state.
- **Session**: A structured practice session containing 3 steps: flashcard review (5 words), 3 single-mode practice rounds (10 questions each), writing practice (5 words x 3 repetitions). Tracks per-step results and overall score.
- **ContextSentence**: A fill-in-the-blank sentence linked to a word, with the sentence text, blank position and correct answer. 90 sentences total (2 per word for all 45 words).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The home screen loads within 1 second and shows session progress, streak and mastery summary
- **SC-002**: A full session (5 flashcards + 3 practice rounds + 5 writing words) can be completed in under 5 minutes
- **SC-003**: v1 localStorage data is migrated with 100% fidelity -- no XP, streak, mastery or achievement data is lost
- **SC-004**: The app loads and functions fully while offline after initial visit
- **SC-005**: A new practice mode can be added by creating a single new module file and registering it, without modifying any existing practice mode files
- **SC-006**: All touch targets meet the 44x44px minimum for a 7-year-old user
- **SC-007**: Theme switching applies across all screens within 100ms with no visible flash of unstyled content
- **SC-008**: Mastery decay calculations produce correct state transitions (mastered to fading at 7 days, fading to needs-review at 14 days)
- **SC-009**: The total file count for the modular codebase stays under 25 files (excluding assets), keeping the project navigable without build tools
- **SC-010**: Writing practice speaks each word via TTS, waits for Lucy to tap reveal, and displays the correct character clearly for self-checking

## Clarifications

### Session 2026-03-06

- Q: Should v2 use the same localStorage key (`lucyVocab`) or a new one? → A: Keep `lucyVocab`, upgrade schema in place
- Q: What counts as "daily practice" for streak purposes? → A: Completing 3 full sessions in a day
- Q: Should Context mode cover Week 2B words too? → A: Yes, create context sentences for all 45 words (60 new sentences for Week 2B, 30 existing for 3A4B = 90 total)
- Q: Should sessions mix practice modes? → A: No, Lucy prefers one modality at a time. Each practice round uses a single mode.
- Q: What is the session structure? → A: Review 5 priority flashcards, then 3 single-mode practice rounds (10 questions each), then writing practice for 5 priority words (each written 3 times)
- Q: Should the mastery grid be the home screen? → A: No. Home screen is session-focused (start button, daily progress). Mastery grid is a separate view accessible via navigation.
- Q: Is writing practice in scope? → A: Yes. Lucy hears a character spoken, writes it on paper, then taps to reveal the correct character for self-checking. Each word 3 times. No digital input.
- Q: What does "Practice this word" do in the new session model? → A: Launches a focused mini-drill for that single word (flashcard + match/context questions + writing), not a full structured session
- Q: Does writing practice "got-it" count toward mastery? → A: Yes, counts as a correct answer toward the word's consecutive correct streak

## Assumptions

- The 45-word vocabulary list from v1 is carried over unchanged. Context sentences are expanded from 30 (3A4B only) to 90 (2 per word for all 45 words)
- v2 keeps the same `lucyVocab` localStorage key and upgrades the schema in place
- Sadie's photo will continue to be base64-embedded rather than loaded as a separate asset
- The app targets Safari on iOS as the primary browser (iPhone user) with Chrome as secondary
- Speech recognition availability is device-dependent; the app degrades gracefully when unavailable
- The "streamlined like Duolingo/Locket" direction means: dark theme by default, rounded surfaces, one action per screen, large typography for Chinese characters, minimal visible UI chrome
- Keyboard shortcuts (space, arrows) are a nice-to-have for when Lucy uses an iPad with keyboard, not primary interaction
- Writing practice is paper-based with self-checking. Lucy writes on physical paper, then taps to reveal the correct character on screen. No digital input or handwriting recognition needed
- The system auto-rotates practice modes across the 3 rounds within a session (e.g. match, context, pairs) rather than letting Lucy choose
- The 3 practice rounds within a session cycle through match, context and pairs in a fixed or rotating order
