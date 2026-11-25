# EMA Participant Portal: source export (Apps Script)

This is a copy of the Emerging Manager Accelerator (EMA) participant portal, exported to prepare its migration to Wix Online Programs. The live Apps Script project and its Google Sheet were not changed.

- **Apps Script project:** EMA Portal (owner: Coach Jeff's Google account)
- **Web app URL (embedded on coachjeffrosales.com/ema-portal):** https://script.google.com/macros/s/AKfycby-o4i1L58ciiZ2hHdK7Pps-2CfPRKYqY7d3IILO7hC4KQevFOcwwhTb4Y54_3kbxOPPw/exec
- **Web app settings (appsscript.json):** runs as the deploying user, open to anyone (anonymous), time zone Asia/Manila, V8 runtime, Drive advanced service v3.
- **Export date:** 2026-11-25

## Files

| File | What it is |
|---|---|
| `Code.gs` | Server code: sheet setup, access-code check, portal data, booking and Google Calendar, emails, reminders, module auto-opening, coach dashboard actions. |
| `Index.html` | The participant portal (single-page app: home and journey, modules, diagnostic, case studies, goals, tracker, booking). |
| `Admin.html` | The coach dashboard, opened with a private coach link (`?coach=<key>`). |
| `appsscript.json` | Project manifest. |
| `data/*.csv` | Program content exported from the portal's Google Sheet (see below). |

Secrets are not in the code. The Sheet ID (`SHEET_ID`), the coach dashboard key (`COACH_KEY`), the case-study upload folder (`CASE_FOLDER_ID`) and one-time "missed session" tokens are kept in Script Properties, which are not part of this export.

## Google Sheet behind the portal

The script opens one Google Sheet, whose ID is stored in Script Properties (`SHEET_ID`). It also uses Google Drive (module slides converted to PDF/Slides, a folder for case-study uploads) and Google Calendar (bookings). The portal is built as **one Sheet per participant**. The exported Sheet is titled "Leadership Accelerator Portal – [REDACTED participant name]".

### Program content tabs (exported to `data/`)

| Tab | Contents | CSV |
|---|---|---|
| Modules | The 4 modules: title, session date, focus, key topics, pre-work, resources, reflection prompts, released flag, weekly challenge, slides link | `data/Modules.csv` |
| Journey | The week-by-week journey shown on the home screen (week, item, type, linked session ID, done) | `data/Journey.csv` |
| Diagnostic | The 30-item leadership diagnostic (5 areas; rating and text questions) | `data/Diagnostic.csv` |
| Sessions | Session schedule (kickoff, modules, coaching, review). Exported **without** the Calendar Event ID column; meeting links and the in-person venue are replaced with [REDACTED]. | `data/Sessions.csv` |
| Case Studies | Case content only: Module, Case, Type, Title, Scenario, Questions, Link, Released. The participant's status, responses and coach feedback columns were **not** exported. | `data/Case Studies.csv` |
| Final Reflection | Questions only (ID, Question). The participant's answers were **not** exported. | `data/Final Reflection Questions.csv` |

### Participant data tabs (NOT exported: column headings only)

| Tab | Column headings |
|---|---|
| Config | Key, Value, Notes (one row per setting; keys: ACCESS_CODE, PROGRAM_TITLE, PROGRAM_SUBTITLE, PARTICIPANT_NAME, PARTICIPANT_ROLE, ORGANIZATION, COACH_NAME, COACH_EMAIL, COACH_WEBSITE, WELCOME_MESSAGE, DIAGNOSTIC_ENABLED, DIAGNOSTIC_DUE, DIAGNOSTIC_INTRO, DIAGNOSTIC_SUBMITTED, BOOKING_ENABLED, BOOKING_MIN_HOURS, BOOKING_CALENDAR, PARTICIPANT_EMAIL, BOOKING_MODE, BOOKING_CHECK_CALENDARS, BOOKING_DAYS, BOOKING_HOURS, BOOKING_MINUTES, BOOKING_LINK, BOOKING_BLOCKED_TIMES, CASES_ENABLED, FINAL_ENABLED, FINAL_OPENS, FINAL_DUE, FINAL_SUBMITTED, PORTAL_URL, TRACKER_ENABLED, TRACKER_START) |
| Agreed Goal | Part, Text, Notes |
| Tracker Activities | #, Activity, From Goal, What a 5 Looks Like, Active |
| Weekly Tracker | Week Ending, Updated, Ratings, Total, Max, Overall (1-10), Requests, Taken Back, What Helped, What Got in the Way, Adjustment, Coach Notes, Note, Blockers, What I Did, What I Did Data |
| Request Log | ID, Created, Updated, Request, Requested By, Owner, Level (1-5), Agreement, Check-in Date, Status, Taken Back, Owner Feedback, Notes |
| Diagnostic Answers | ID, Area, Question, Answer, Saved On |
| Diagnostic Summary | Area, Average (1-5), Questions Rated, Reading |
| Final Diagnostic | ID, Area, Question, Answer, Saved On |
| Final Reflection (answers) | ID, Question, Answer, Saved On, Coach Notes |
| Growth Summary | Area, Start (1-5), Final (1-5), Change |
| Challenges | Module, Done, Done On, What Happened, Coach Notes |
| Goals | ID, Created, Updated, Specific Goal, Measurable, Baseline (1-10), Current (1-10), Progress Notes, Coach Notes, Achievable, Relevant, Target Date |
| Action Plan | ID, Created, Updated, Commitment, Why It Matters, First 30 Days, Days 31-60, Days 61-90, Success Measure, Support Needed, Status, Coach Notes |
| Journal | ID, Created, Updated, Module, Key Learnings, How I Applied It, Questions for Coach, Coach Notes |
| Case Studies (response columns) | Status, Submitted On, Response, Coach Feedback, Response Data (in the live code also: Level, Graded On, Grade Sent On) |
| Availability (coach's bookable slots; empty) | Date, Start Time, Minutes, Mode, Meeting Link, Only For Session, Booked Session, Session Title, Booked On, Calendar Event ID |

`Code.gs` (`HEADERS`) has the full tab and column definitions that `setup()` creates.

## Redactions in this copy

The originals in Apps Script and Google Sheets are unchanged. In this copy:

- `Code.gs`: 3 email addresses (the default coach email and the calendars checked for busy times) were replaced with `[REDACTED]`.
- `Code.gs`: the participant's first name in two code comments was replaced with `[REDACTED]`.
- `Code.gs`: `AGREED_GOAL_DEFAULT` held one participant's personal goal (employer, team, targets and dates). Its text values were replaced with `[REDACTED]`.
- `data/Sessions.csv`: meeting links and the in-person venue were replaced with `[REDACTED]`; Calendar Event IDs were left out.
- The Sheet's title, which includes the participant's name, is shown here as "[REDACTED participant name]".

Placeholder values in the code (for example `+639171234567` and `name@company.com`) are sample text, not real contact details. Some defaults (`TRACKER_ACTIVITIES_DEFAULT` in `Code.gs` and the Tracker help text in `Index.html`) were written for the first participant's goal ("the Studio", "designers"). They are generic, but should be rewritten for other participants.
