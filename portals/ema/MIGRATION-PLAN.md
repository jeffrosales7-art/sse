# EMA Portal → Wix Online Programs: migration plan

Based on the exported source in this folder (`Code.gs`, `Index.html`, `Admin.html`, `data/*.csv`).

## Summary

The EMA portal is a full **one-to-one coaching workspace** (about 6,800 lines of code), not just a course page. Wix Online Programs can take over the **course content** (journey, modules, diagnostic, case studies, final reflection, certificate), but not the **coaching tools** (goals, weekly tracker, request log, action plan, coach notes and grading, coach dashboard, calendar booking, diagnostic scoring and growth summary).

Note: the current engagement is mid-program (Module 3 on 2026-11-25, Module 4 on 2026-12-01). Do not switch platforms for this participant.

## Feature mapping

| Portal feature (Apps Script) | Wix Online Programs | Fit |
|---|---|---|
| Access code login (Config `ACCESS_CODE`) | Site member login (Members Area) | ✅ Better |
| 8-week Journey (`Journey.csv`) | Program sections, one per week | ✅ |
| 4 Modules: focus, key topics, pre-work, resources, slides (`Modules.csv`) | One step per module with text, links and files | ✅ |
| Module auto-release by date (`autoOpenNext_`) | Time-based program (steps open on set days) | ✅ |
| Module reflection prompts | Step with questions (participant answers) | ⚠️ Answers visible in Wix, no coach-notes field |
| Weekly challenge per module | Step with a written response | ⚠️ Same as above |
| Leadership diagnostic, 30 items in 5 areas (`Diagnostic.csv`) | Quiz / survey step | ⚠️ Collects answers, but no area averages, "reading" or summary |
| Final diagnostic + Growth Summary (start vs final by area) | Second quiz step | ❌ No automatic start-vs-final comparison |
| Case studies with scenario and questions (`Case Studies.csv`) | Step per case with questions; file upload possible | ⚠️ No grading levels, timed grade release or grade emails |
| Final reflection, 6 questions | Survey step | ✅ |
| Certificate of Completion | Built-in certificate | ✅ Better |
| Agreed goal, SMART goals, 30-60-90 action plan | — | ❌ |
| Weekly tracker (ratings, totals, blockers) and request log | — | ❌ |
| Journal with coach notes and status | — | ❌ |
| Coach dashboard (`Admin.html`): notes, grading, releases, uploads | Program dashboard shows progress only | ❌ |
| Session booking with Google Calendar availability | — (use the Google booking page, `coachjeffrosales.com/book`) | ⚠️ Different |
| Session reminders and emails (daily trigger) | Program notifications (step reminders) | ⚠️ Partly |
| One Google Sheet per participant | One program, many participants | ✅ Scales better for cohorts |

## Content to rewrite before any migration

Several texts are written for the first participant (for example "your Studio", "designers", "a global team" in `Modules.csv`, `Case Studies.csv`, `TRACKER_ACTIVITIES_DEFAULT` and `AGREED_GOAL_DEFAULT`). A cohort version needs generic wording.

Case 1 references a licensed Babson College case (*Deborah DiSanzo at Philips Medical Systems (A)*). The case PDF must not be uploaded to Wix or shared beyond what the license allows; the step should keep "read the case I sent you".

## Options

1. **Keep Apps Script** for one-to-one engagements (it does far more than Online Programs). Open the portal in a new tab instead of embedding it, to avoid login and cookie problems in some browsers.
2. **Hybrid (recommended for future cohorts):** Wix Online Programs for content, schedule and certificate; the Apps Script workspace (goals, tracker, action plan, coach dashboard) linked from the program for each participant.
3. **Full rebuild in Wix** (Members Area + CMS + Velo code): possible, but a large custom project that recreates what already works.
