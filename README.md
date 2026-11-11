# KTET Category III mock tests

Five full-length mock tests of 100 questions each for the **Kerala TET Category III** (high school,
classes VIII to X), **Physical Science** stream with **Malayalam** as Language I. It is a static
website: no server, no login. Your attempts are saved in your browser.

> These are practice questions written for this project, modelled on the official syllabus and
> exam pattern. They are **not** official papers. Check anything you are unsure of against your
> textbooks and the official syllabus at <https://ktet.kerala.gov.in>.

## What each test contains

The official Category III paper has 150 questions (40 + 30 + 80). Each mock test is the same pattern
scaled to 100 questions, 100 minutes, 1 mark each, no negative marking:

| Part | Questions |
|---|---|
| Adolescent Psychology, Theories of Learning and Teaching Aptitude | 27 |
| Language I: Malayalam | 20 |
| Physical Science (Physics 17, Chemistry 16, Pedagogy 20) | 53 |

Topic weights are in `data/blueprint.json`; how they were derived is in
`docs/research/topic-weights.md`.

## Using it

Open the site, pick a test, answer, and press **Submit** (or let the timer run out). Progress is
saved after every click, so a refresh or a dropped connection resumes the test with the same
deadline. The result page shows your score by part and by topic (weakest first) and reviews every
question with the correct answer and an explanation.

**Moving to another device:** use *Export progress* on the home page, then *Import progress* on the
other device. Scores live in each browser's local storage, so clearing site data erases them.

**Offline:** after the first visit the site is cached by a service worker and should open without a
connection. This was verified in an automated test of the worker's logic, not in a real browser, so
check it once on your own device.

## Running locally

Browsers block `fetch` from `file://` pages, so serve the folder:

```bash
python -m http.server 8765
```

Then open <http://127.0.0.1:8765/>. Node 22 or newer is needed for the tests.

```bash
npm test                  # unit tests
node tools/validate.mjs   # checks all five question banks against the blueprint
```

## Editing questions

Questions are written in `bank-src/testN.txt`, one per line:

```
question ||| option A ||| option B ||| option C ||| option D ||| correct letter ||| one-line explanation
```

under a `## topic-id` heading (topic ids are in `data/blueprint.json`). Then rebuild and validate:

```bash
node tools/build-bank.mjs 1   # writes data/test1.json
node tools/validate.mjs
```

The builder spreads the correct answer evenly across A to D (options that are all numbers keep their
order), so explanations must never refer to option letters. `validate.mjs` checks that each test has
exactly the blueprint's number of questions per part and topic, four options, a valid answer, an
explanation, and no repeated ids or question text across tests. If you change a file, the service worker
serves the cached copy first and refreshes it in the background, so returning users see the change
on the visit after next. When you add or remove a file, add it to `ASSETS` in `sw.js` and bump the
`ktet-vN` cache name.

## Publishing on GitHub Pages

1. Push this repository to GitHub (branch `main`).
2. In the repository: **Settings, Pages, Source: GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs the tests and the validator, then deploys. The
   site appears at `https://<your-user>.github.io/<repo-name>/`.
