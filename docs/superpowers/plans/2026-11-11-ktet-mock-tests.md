# KTET Category III Mock Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a static web app on GitHub Pages with 5 KTET Category III (Physical Science, Malayalam) mock tests of 100 questions each.

**Architecture:** Plain HTML/CSS/ES-module JS, no build step. Pure-logic modules (`scoring`, `store`, `timer`) are unit-tested with Node's built-in runner; the DOM pages are thin. Questions live in JSON validated against `data/blueprint.json` by `tools/validate.mjs`, which also runs in CI before deploy.

**Tech Stack:** HTML, CSS, JavaScript (ES modules), Node 20+ (`node --test`, no npm dependencies), GitHub Actions, GitHub Pages. Python is used only for the one-off paper extraction in Task 1 if it is installed.

**Spec:** `docs/superpowers/specs/2026-11-11-ktet-mock-tests-design.md`

## Global Constraints

- 5 tests x 100 questions; part split provisional (20 Child Development, 20 Malayalam, 20 English, 40 Physical Science) until Task 1 confirms it against the official papers.
- Timer 100 minutes; no negative marking; 1 mark per question.
- Stream: Physical Science. Language I: Malayalam. All questions in English except the Malayalam part, written in Malayalam script. HTML must declare UTF-8.
- Each question: exactly 4 options, one correct `answer` index (0-3), a one-line `explanation`, unique `id`.
- Original questions in the style of past papers; never copy a past question verbatim. No question text repeated across the five tests.
- No backend, no login; state in `localStorage` only; progress export/import as a JSON file.
- All URLs relative (the site is served from `/<repo>/`, not the domain root).
- Mobile-first; keyboard operable controls; sufficient contrast.
- No npm dependencies. Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Never push without asking the user first; the user supplies the repo URL.

## Review Focus

Failure modes the spec implies but does not spell out. Each has a test in the task named.

1. Page refreshed or closed mid-test, then reopened: the attempt resumes with answers, flags, current question and the original deadline intact (Task 4).
2. Deadline passed while the page was closed: reopening auto-submits instead of restarting the clock (Task 4).
3. Corrupt or foreign data in `localStorage` or in an imported file: ignored with a message, existing attempts not destroyed (Task 3).
4. `localStorage` unavailable (private mode or quota): the app still runs for the session and tells the user progress won't be kept (Task 3).
5. Submitting with nothing answered, or answering then clearing: scores 0 with no crash and the correct per-part totals (Task 2).
6. Service worker serving stale question data after a redeploy: cache name is versioned and old caches are deleted (Task 5).
7. Malayalam text rendering: the file is UTF-8 and the page font stack falls back to a system Malayalam font (Task 5).

---

### Task 1: Research the official papers and fix the blueprint

**Files:**
- Create: `docs/research/papers/` (downloaded PDFs, git-ignored), `docs/research/syllabus-physical-science.md`, `docs/research/topic-weights.md`, `data/blueprint.json`, `.gitignore`

**Interfaces:**
- Produces: `data/blueprint.json` with this shape, used by Tasks 2, 7 and 8:
  ```json
  { "durationMinutes": 100,
    "parts": [ { "id": "physical-science", "name": "Physical Science", "perTest": 40,
                 "topics": [ { "id": "electricity", "name": "Electricity", "perTest": 4 } ] } ] }
  ```
  Part ids: `child-development`, `malayalam`, `english`, `physical-science`. For every part, the topic `perTest` values sum to the part `perTest`, and the part values sum to 100.

- [ ] **Step 1:** Run `node --version` (need 20+) and `python --version`; if Node is missing, stop and tell the user.
- [ ] **Step 2:** Download the official Category III papers and keys for Nov 2019, Oct 2023, Nov 2024, Dec 2025 (and any other year available) from ktet.kerala.gov.in and keralapareekshabhavan.in into `docs/research/papers/`. Add that folder to `.gitignore`. Tell the user the filenames and sizes if a download is large.
- [ ] **Step 3:** Extract text (PDF text layer, or OCR if scanned) and read the Category III Physical Science paper structure. Record in `docs/research/syllabus-physical-science.md`: the official part split and counts, the syllabus topics per part, and the sources used.
- [ ] **Step 4:** Tag every Physical Science, Child Development, Malayalam and English question in the downloaded papers by topic and count them. Write the counts and the resulting weights to `docs/research/topic-weights.md`, with the per-test topic counts.
- [ ] **Step 5:** Write `data/blueprint.json` from the confirmed split. If the official split differs from the provisional 20/20/20/40, use the official one scaled to 100 and tell the user. Round per-topic counts so each part sums exactly.
- [ ] **Step 6:** Commit.

```bash
git add .gitignore docs/research/syllabus-physical-science.md docs/research/topic-weights.md data/blueprint.json
git commit -m "docs: record official pattern, syllabus and topic weights; add blueprint"
```

### Task 2: Question-data validator and scoring

**Files:**
- Create: `tools/validate.mjs`, `js/scoring.js`, `tests/validate.test.mjs`, `tests/scoring.test.mjs`, `package.json` (`{"type":"module","scripts":{"test":"node --test tests/","validate":"node tools/validate.mjs"}}`)

**Interfaces:**
- Consumes: `data/blueprint.json` shape from Task 1.
- Produces:
  - `validateBank(blueprint, tests) -> string[]` in `tools/validate.mjs`; `tests` is `{ [testId: string]: Question[] }`; returns error messages, empty when valid. Running the file as a script loads `data/blueprint.json` and `data/test1..5.json`, prints errors and exits 1 if any.
  - `scoreAttempt(questions: Question[], answers: (number|null)[]) -> { total: number, max: number, byPart: Record<string,{correct:number,total:number}>, byTopic: Record<string,{correct:number,total:number}>, perQuestion: {id:string,chosen:number|null,correct:number,isCorrect:boolean}[] }` in `js/scoring.js`.
  - `Question = { id, part, topic, text, options: string[4], answer: 0|1|2|3, explanation }`.

- [ ] **Step 1: Write failing validator tests** in `tests/validate.test.mjs` using a tiny 2-part blueprint fixture: valid bank returns `[]`; each of these returns an error mentioning the id or test: wrong total count, wrong per-part count, wrong per-topic count, 3 options, empty option, answer index 4, duplicate id, same text in two tests, unknown part, unknown topic, missing explanation.
- [ ] **Step 2:** Run `node --test tests/validate.test.mjs`. Expected: FAIL, module not found.
- [ ] **Step 3:** Implement `validateBank` and the CLI wrapper in `tools/validate.mjs`. Duplicate-text comparison is case- and whitespace-insensitive.
- [ ] **Step 4:** Run the validator tests. Expected: PASS.
- [ ] **Step 5: Write failing scoring tests** in `tests/scoring.test.mjs`: all correct gives `total == max`; mixed answers give the right `byPart` and `byTopic`; all `null` gives `total 0`, no throw, `byPart` totals intact (Review Focus 5); `perQuestion[i].chosen` is `null` for unanswered.
- [ ] **Step 6:** Run `node --test tests/scoring.test.mjs`. Expected: FAIL.
- [ ] **Step 7:** Implement `scoreAttempt` in `js/scoring.js` (pure, no DOM).
- [ ] **Step 8:** Run `npm test` (or `node --test tests/`). Expected: all PASS. Commit.

```bash
git add package.json tools tests js/scoring.js
git commit -m "feat: add question validator and scoring"
```

### Task 3: Progress store

**Files:**
- Create: `js/store.js`, `tests/store.test.mjs`

**Interfaces:**
- Produces, in `js/store.js`:
  - `createStore(storage: Storage | null) -> Store`. A `null` or throwing storage selects an in-memory fallback and sets `store.persistent = false`.
  - `Progress = { answers: (number|null)[], flagged: number[], current: number, startedAt: number, deadline: number }`
  - `Attempt = { testId: string, finishedAt: number, total: number, max: number, byPart: object, byTopic: object, answers: (number|null)[] }`
  - `store.saveProgress(testId, progress)`, `store.loadProgress(testId) -> Progress | null`, `store.clearProgress(testId)`, `store.recordAttempt(attempt)`, `store.getAttempts(testId) -> Attempt[]` (oldest first), `store.exportAll() -> string`, `store.importAll(json: string) -> { ok: boolean, imported: number, error?: string }`.
  - Storage keys are prefixed `ktet:`.

- [ ] **Step 1: Write failing tests** using a `Map`-backed fake storage: save then load round-trips; `clearProgress` removes it; `recordAttempt` keeps order and `getAttempts` is isolated per test id; `exportAll` then `importAll` into a fresh store reproduces attempts; `importAll("not json")` and `importAll('{"x":1}')` return `ok: false` and leave existing attempts untouched; corrupt JSON already in storage makes `loadProgress` return `null` and `getAttempts` return `[]` (Review Focus 3); a storage whose `setItem` throws gives `persistent === false` and still round-trips in memory (Review Focus 4); importing the same export twice does not duplicate attempts (dedupe on `testId` + `finishedAt`).
- [ ] **Step 2:** Run `node --test tests/store.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Implement `createStore`. Validate shape on every read and import; never throw out of the public methods.
- [ ] **Step 4:** Run the test. Expected: PASS. Commit.

```bash
git add js/store.js tests/store.test.mjs
git commit -m "feat: add localStorage progress store with export/import"
```

### Task 4: Test runner logic and pages

**Files:**
- Create: `js/timer.js`, `js/quiz.js`, `index.html`, `test.html`, `result.html`, `js/home.js`, `js/result.js`, `css/app.css`, `tests/timer.test.mjs`, `tests/quiz.test.mjs`

**Interfaces:**
- Consumes: `scoreAttempt` (Task 2), `createStore` (Task 3), `data/test{n}.json` and `data/blueprint.json`.
- Produces:
  - `remainingMs(deadline: number, now: number) -> number` (never negative) in `js/timer.js`.
  - `createSession({ questions, progress, now, durationMs }) -> Session` in `js/quiz.js`, pure state machine: `session.answer(i, optionIndex|null)`, `session.toggleFlag(i)`, `session.goTo(i)`, `session.status(i) -> 'answered'|'flagged'|'unanswered'`, `session.expired(now) -> boolean`, `session.snapshot() -> Progress`, `session.unansweredCount() -> number`. A `progress` with a past `deadline` yields `expired(now) === true` (Review Focus 2).
  - Pages: `index.html` lists five test cards with last score, best score and attempt count, plus export and import buttons. `test.html?id=N` runs a test with a countdown, a palette, next/previous/flag, autosave to the store after each interaction, a submit confirmation showing the unanswered count, and auto-submit at zero or when loaded past the deadline. `result.html?id=N` shows score, per-part and per-topic breakdown with topics under 50% highlighted, and a review list with your answer, the correct answer and the explanation.

- [ ] **Step 1: Write failing tests.** `timer.test.mjs`: `remainingMs(1000, 400) === 600`; `remainingMs(1000, 2000) === 0`. `quiz.test.mjs`: answering and flagging change `status`; `snapshot()` fed back through `createSession` restores answers, flags and current index with the same deadline (Review Focus 1); progress whose deadline is in the past reports `expired`; `unansweredCount` counts `null` answers; answering then clearing (`null`) counts as unanswered.
- [ ] **Step 2:** Run `node --test tests/`. Expected: new tests FAIL.
- [ ] **Step 3:** Implement `js/timer.js` and `js/quiz.js` as DOM-free modules.
- [ ] **Step 4:** Run `node --test tests/`. Expected: PASS.
- [ ] **Step 5:** Build the three pages and `css/app.css`, mobile-first, with `<meta charset="utf-8">`, buttons and palette cells reachable and operable by keyboard, and no layout that needs horizontal scrolling at 360 px. Pages load data with `fetch` using relative paths and show a clear message if the fetch fails (for example when opened via `file://`).
- [ ] **Step 6:** Create a throwaway 5-question `data/test1.json` fixture only if the real one doesn't exist yet. Serve with `python -m http.server 8080` or `node` equivalent and verify in the browser pane: start, answer, flag, refresh and resume, submit, review. Do not commit the fixture.
- [ ] **Step 7:** Commit.

```bash
git add js css index.html test.html result.html tests
git commit -m "feat: add test runner, home and result pages"
```

### Task 5: Offline support and fonts

**Files:**
- Create: `sw.js`, `tests/sw.test.mjs`
- Modify: `index.html`, `test.html`, `result.html` (register the worker), `css/app.css` (font stack)

**Interfaces:**
- Produces: `sw.js` exporting nothing; it holds `const CACHE = 'ktet-v1'` and a list `ASSETS` of every HTML, CSS, JS and data file. `tests/sw.test.mjs` reads `sw.js` as text and the repo tree to assert each real file is in `ASSETS`.

- [ ] **Step 1: Write failing test:** every file under `css/`, `js/`, `data/` and the three HTML pages appears in `ASSETS`, and `sw.js` contains an `activate` handler that deletes caches whose name is not `CACHE` (Review Focus 6).
- [ ] **Step 2:** Run `node --test tests/sw.test.mjs`. Expected: FAIL.
- [ ] **Step 3:** Implement `sw.js`: cache-first for `ASSETS`, delete other caches on activate, relative paths. Register it from each page with a relative URL.
- [ ] **Step 4:** Add a CSS font stack ending in a system Malayalam-capable fallback (`"Noto Sans Malayalam", "Nirmala UI", sans-serif`) and verify Malayalam text renders in the browser pane (Review Focus 7).
- [ ] **Step 5:** Run `npm test`. Expected: PASS. In the browser pane, load once, go offline via the dev tools network setting, reload, and confirm the home page and a test still load. Commit.

```bash
git add sw.js tests/sw.test.mjs index.html test.html result.html css/app.css
git commit -m "feat: add offline caching and Malayalam font fallback"
```

### Tasks 6-10: Question banks, one task per test (N = 1..5)

Each of the five tasks is identical in form. Tasks may run in parallel, one per subagent, since they write separate files. Test N is written against `data/blueprint.json` and the topic weights from Task 1.

**Files:**
- Create: `data/test{N}.json`

**Interfaces:**
- Consumes: `Question` shape and `validateBank` (Task 2), `data/blueprint.json` (Task 1), `docs/research/*` (Task 1).
- Produces: a JSON array of exactly 100 `Question` objects, ids `t{N}-{partId}-{nnn}`, matching the blueprint counts per part and per topic.

- [ ] **Step 1:** Read `docs/research/syllabus-physical-science.md` and `docs/research/topic-weights.md`, and read the style of the matching past-paper questions (difficulty, phrasing, mix of recall, application and numerical items, and the pedagogy items that use classroom scenarios).
- [ ] **Step 2:** Write the 100 questions for test N, original wording, four plausible options, one correct answer, one-line explanation. Vary the correct option position across A-D. Malayalam-part questions are in Malayalam script. Do not reuse any question from tests 1..N-1 or from the past papers.
- [ ] **Step 3:** For every numerical Physical Science question, verify the answer with a throwaway script (not committed) and fix any mismatch. For every factual item you are not certain of, change it to one you are sure of.
- [ ] **Step 4:** Run `node tools/validate.mjs`. Expected: no errors for tests that exist so far (the validator must accept a partial set when run on `--only N`; add that flag to `tools/validate.mjs` with a test in `tests/validate.test.mjs` the first time it is needed).
- [ ] **Step 5:** Commit.

```bash
git add data/test{N}.json
git commit -m "feat: add mock test {N} question bank"
```

### Task 11: CI, README and final check

**Files:**
- Create: `.github/workflows/pages.yml`, `README.md`

**Interfaces:**
- Consumes: `npm test`, `node tools/validate.mjs`.

- [ ] **Step 1:** Write `pages.yml`: on push to `main` and manual dispatch; checkout, setup Node 20, run `npm test` then `node tools/validate.mjs`, then `actions/configure-pages`, `actions/upload-pages-artifact` (path `.`), `actions/deploy-pages`; permissions `contents: read`, `pages: write`, `id-token: write`.
- [ ] **Step 2:** Write `README.md`: what it is, how to run locally (`python -m http.server`), how to add or edit questions, how validation works, the practice-material disclaimer, and the one manual step: repo Settings > Pages > Source = GitHub Actions.
- [ ] **Step 3:** Run `npm test` and `node tools/validate.mjs`. Expected: all PASS, no errors, 5 tests x 100 questions. Then a full manual pass in the browser pane at 375 px and desktop width: complete a whole test, check the breakdown and review, export, clear storage, import. Fix anything found.
- [ ] **Step 4:** Commit.

```bash
git add .github README.md
git commit -m "ci: deploy to GitHub Pages; add README"
```

### Task 12: Publish

**Files:** none created.

- [ ] **Step 1:** Ask the user for the empty public repo URL and confirm they want the push now. Do not push before they say yes.
- [ ] **Step 2:** `git remote add origin <url>` then `git push -u origin main`. If git asks for credentials or the push is rejected, report the exact error to the user instead of working around it.
- [ ] **Step 3:** Tell the user to set Settings > Pages > Source to GitHub Actions if the workflow's deploy step fails with a Pages-not-enabled error, then re-run the workflow.
- [ ] **Step 4:** When the workflow succeeds, open `https://<user>.github.io/<repo>/` in the browser pane, start a test, and confirm it loads. Report the URL.
