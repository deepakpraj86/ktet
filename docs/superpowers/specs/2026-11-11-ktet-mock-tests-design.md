# KTET Category III Mock Tests: Design

Date: 2026-11-11
Status: draft, awaiting user review

## Goal

A free, static web app the user can open from any device to practise for KTET Category III
(high school, classes VIII-X), Physical Science stream, Malayalam as Language I.
It offers 5 mock tests of 100 questions each, published on GitHub Pages.

## Confirmed by the user

- Stream: Physical Science. Language I: Malayalam. Questions in English, except the Malayalam
  language part, which is written in Malayalam script.
- 5 mock tests x 100 questions, distributed across syllabus topics in proportion to their weight
  in past papers.
- Publishing: the user creates an empty public GitHub repo and gives its URL. `gh` is not installed.
  Confirm with the user immediately before the first push.

## Assumptions (to verify, not yet confirmed)

- The official Category III paper has 150 questions / 150 marks, 2.5 hours, no negative marking.
  Sources disagree on the part split; the official prospectus is a scanned image. The split below
  is provisional and must be checked against the official papers and syllabus in plan task 1.
- Timer: 100 minutes (2.5 h x 100/150). The user may change it.

## Test structure (provisional)

Each test is the official pattern scaled by 2/3.

| Part | Official | Per test |
|---|---|---|
| Child Development and Pedagogy | 30 | 20 |
| Language I (Malayalam) | 30 | 20 |
| Language II (English) | 30 | 20 |
| Physical Science (content and pedagogy) | 60 | 40 |
| Total | 150 | 100 |

Topic weights inside each part come from tagging the questions in the Nov 2019, Oct 2023,
Nov 2024 and Dec 2025 Category III papers (and others that are available).
The same weights drive every test; the five tests use different questions, with no repeats.

## Architecture

Static site, plain HTML, CSS and JS (ES modules), no build step, no backend.

```
index.html            home: five test cards, last and best score
test.html             test runner
result.html           score, breakdown, review
css/app.css
js/store.js           localStorage: attempts, in-progress answers, export/import
js/quiz.js            timer, palette, navigation, flagging, autosave
js/results.js         scoring, per-part and per-topic breakdown, review rendering
data/blueprint.json   parts, topics, weights, counts per test
data/test1.json ... test5.json   questions
sw.js                 service worker: offline cache
.github/workflows/pages.yml      deploy on push to main
tools/validate.mjs    validates the question data
tools/                helpers used to extract and tag past papers
docs/                 this spec, the plan, the syllabus and weight analysis
```

Question record:

```json
{
  "id": "t1-p4-017",
  "part": "physical-science",
  "topic": "electricity",
  "text": "...",
  "options": ["...", "...", "...", "..."],
  "answer": 2,
  "explanation": "one line"
}
```

## Question sourcing

1. Extract text from the official Category III papers, answer keys and syllabus (OCR where scanned).
2. Tag each past question by part and topic, and record the style. Derive topic weights.
3. Write 500 original questions in that style: four options, one correct answer, one-line explanation.
   Do not copy past questions verbatim.
4. `tools/validate.mjs` checks: 100 questions per test; per-part and per-topic counts match the
   blueprint; exactly four non-empty options; answer index in range; unique ids; no duplicate
   question text across tests. Numerical physics and chemistry answers are cross-checked with a script
   where practical.

Known risk: the questions are written by the assistant, not an examiner. The Malayalam part and
numerical problems are the likeliest to contain mistakes. Explanations are included so errors can be
spotted. The app is practice material, not an official source.

## App behaviour

- Home: five test cards with last and best score and an attempt count.
- Test: countdown timer; question palette (answered, flagged, unanswered); next, previous, flag;
  no negative marking; answers autosaved to localStorage so a refresh or lost connection resumes the
  attempt; submit with a confirmation that shows the unanswered count; auto-submit at zero.
- Result: total score, per-part and per-topic breakdown with weak topics highlighted, and a review of
  every question showing the user's answer, the correct answer and the explanation.
- Storage: localStorage only, no login. Export and import of progress as a JSON file to move between
  devices.
- Mobile-first, readable on a phone; accessible controls (keyboard operable, sufficient contrast).
- Offline: the service worker caches the shell and the five data files after the first load.

## Testing

- Data validation script (above) runs in CI before deploy.
- Unit tests (Node's built-in test runner) for scoring and store logic, which are pure functions kept
  separate from the DOM.
- Manual browser pass at phone and desktop widths: start a test, refresh mid-test and resume, submit,
  review, export and import progress.

## Publishing

- Repo `D:\ktet-mock-tests`, remote supplied by the user.
- GitHub Actions workflow runs validation and tests, then deploys to GitHub Pages on push to `main`.
- Pages must be set to "GitHub Actions" as the source in the repo settings; the plan tells the user
  if this has to be done by hand.

## Out of scope

Other categories or subjects, login or accounts, a backend, leaderboards, official-paper reproduction,
negative marking.
