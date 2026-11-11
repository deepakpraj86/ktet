# Official pattern and topic weights

## Source of truth

- Official Category III syllabus: https://ktet.kerala.gov.in/syllabus/syllabus3.pdf
- Official answer keys: Oct 2023, Nov 2024, Dec 2025 (ktet.kerala.gov.in, `downloads/...`).
  The Dec 2025 key numbers the paper continuously 1-150: Part I = 1-40, Part II (Language I) = 41-70,
  Part III (subject) = 71-150. This confirms the syllabus split.
- 2012 official sample paper: https://ktet.kerala.gov.in/modelquestion/question3.pdf (Physical Science
  section readable in English; Malayalam text is in a legacy font and unreadable by text extraction).

## What I could not get

The question text of the past papers (2019, 2023, 2024, 2025) is not published as downloadable PDFs.
The official site publishes only the answer keys (sets A-D, no questions). The third-party site
that lists them (challengerapp.in) shows one question at a time behind an interactive page. So the
topic weights below are **not** counted from past questions. They come from the official syllabus's
own question counts per section, split across topics in proportion to how much syllabus each topic
covers. One Dec 2025 Physical Science question seen online (Ellingham diagram) is beyond the
published school-level syllabus, so recent papers go up to degree level in places; the question
banks mix school-level and some higher-level items.

## Official pattern (150 questions, 150 marks, 2.5 hours, no negative marking)

| Part | Official | Per mock test (x 2/3, rounded) |
|---|---|---|
| I. Adolescent Psychology, Theories of Learning and Teaching Aptitude | 40 | 27 |
| II. Language I (Malayalam) | 30 | 20 |
| III. Physical Science (Physics 25, Chemistry 25, Pedagogy 30) | 80 | 53 |
| Total | 150 | 100 |

There is no separate English language part in Category III. English is one of the choices for
Language I, not an extra part.

Part I official marks: Adolescent Psychology 10, Theories of Learning 15, Teaching Aptitude 15
-> per test 7 / 10 / 10.

Part II Malayalam official split (30): prose comprehension 5, poetry comprehension 5,
exchange of ideas 10, language knowledge 10 -> per test 3 / 3 / 7 / 7.

Part III per test: Physics 17, Chemistry 16, Pedagogy 20. Per-topic counts are in
`data/blueprint.json`.
