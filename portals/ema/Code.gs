/**
 * Emerging Manager Accelerator — Participant Portal (app-style edition)
 * coachjeff. | Become Your Best Self
 *
 * One portal per participant. Standalone Apps Script project: run setup() once and it
 * creates the Google Sheet that serves as the backend. Edit the Sheet's tabs to update the portal.
 */

const SHEETS = {
  CONFIG: 'Config',
  SESSIONS: 'Sessions',
  MODULES: 'Modules',
  CHALLENGES: 'Challenges',
  JOURNAL: 'Journal',
  GOALS: 'Goals',
  PLAN: 'Action Plan',
  DIAG_Q: 'Diagnostic',
  DIAG_A: 'Diagnostic Answers',
  DIAG_S: 'Diagnostic Summary',
  SLOTS: 'Availability',
  CASES: 'Case Studies',
  FINAL_A: 'Final Diagnostic',
  FINAL_R: 'Final Reflection',
  FINAL_S: 'Growth Summary',
  JOURNEY: 'Journey',
  TRACK_ACT: 'Tracker Activities',
  TRACK_WEEK: 'Weekly Tracker',
  REQUESTS: 'Request Log',
  AGREED: 'Agreed Goal'
};

const HEADERS = {
  CONFIG: ['Key', 'Value', 'Notes'],
  SESSIONS: ['ID', 'Type', 'Title', 'Date (YYYY-MM-DD)', 'Date Note', 'Time', 'Duration', 'Mode', 'Location / Link', 'Status', 'Notes', 'Calendar Event ID'],
  MODULES: ['Module', 'Title', 'Session Date', 'Focus', 'Key Topics', 'Pre-work', 'Resources', 'Reflection Prompts', 'Weekly Challenge', 'Released', 'Slides Link'],
  CHALLENGES: ['Module', 'Done', 'Done On', 'What Happened', 'Coach Notes'],
  JOURNAL: ['ID', 'Created', 'Updated', 'Module', 'Key Learnings', 'How I Applied It', 'Questions for Coach', 'Coach Notes', 'Status'],
  GOALS: ['ID', 'Created', 'Updated', 'Specific Goal', 'Measurable', 'Achievable', 'Relevant', 'Target Date', 'Baseline (1-10)', 'Current (1-10)', 'Progress Notes', 'Coach Notes'],
  PLAN: ['ID', 'Created', 'Updated', 'Commitment', 'Why It Matters', 'First 30 Days', 'Days 31-60', 'Days 61-90', 'Success Measure', 'Support Needed', 'Status', 'Coach Notes'],
  DIAG_Q: ['ID', 'Area', 'Type', 'Question', 'Required'],
  DIAG_A: ['ID', 'Area', 'Question', 'Answer', 'Saved On'],
  DIAG_S: ['Area', 'Average (1-5)', 'Questions Rated', 'Reading'],
  SLOTS: ['Date', 'Start Time', 'Minutes', 'Mode', 'Meeting Link', 'Only For Session', 'Booked Session', 'Session Title', 'Booked On', 'Calendar Event ID'],
  CASES: ['Module', 'Case', 'Type', 'Title', 'Scenario', 'Questions', 'Link', 'Released', 'Status', 'Submitted On', 'Response', 'Coach Feedback', 'Response Data', 'Level', 'Graded On', 'Grade Sent On'],
  FINAL_A: ['ID', 'Area', 'Question', 'Answer', 'Saved On'],
  FINAL_R: ['ID', 'Question', 'Answer', 'Saved On', 'Coach Notes'],
  FINAL_S: ['Area', 'Start (1-5)', 'Final (1-5)', 'Change'],
  JOURNEY: ['Week', 'Item', 'Type', 'Session ID', 'Done'],
  TRACK_ACT: ['#', 'Activity', 'From Goal', 'What a 5 Looks Like', 'Active'],
  TRACK_WEEK: ['Week Ending', 'Updated', 'Ratings', 'Total', 'Max', 'Overall (1-10)', 'Requests', 'Taken Back', 'What Helped', 'What Got in the Way', 'Adjustment', 'Coach Notes', 'Note', 'Blockers', 'What I Did', 'What I Did Data'],
  AGREED: ['Part', 'Text', 'Notes'],
  REQUESTS: ['ID', 'Created', 'Updated', 'Request', 'Requested By', 'Owner', 'Level (1-5)', 'Agreement', 'Check-in Date', 'Status', 'Taken Back', 'Owner Feedback', 'Notes']
};

/** The journey shown on the participant's home screen. Edit it in the Journey tab.
 *  Type: Diagnostic, Kickoff, Module, Coaching, Review. Session ID links an item to the Sessions tab
 *  (its date shows and it is ticked when that session is Done). Done: Yes ticks an item by hand. */
const JOURNEY_DEFAULT = [
  ['1', 'Leadership diagnostic', 'Diagnostic', '', ''],
  ['1', 'Contracting & kickoff', 'Kickoff', 'S1', ''],
  ['2', 'Module 1: Self-Leadership and the LEAD™ Framework', 'Module', 'S2', ''],
  ['2', 'Coaching conversation', 'Coaching', 'S3', ''],
  ['3', 'Module 2: Practical Leadership Tools', 'Module', 'S4', ''],
  ['3', 'Coaching conversation', 'Coaching', 'S5', ''],
  ['4', 'Module 3: Real-World Case Discussions', 'Module', 'S6', ''],
  ['4', 'Coaching conversation', 'Coaching', 'S7', ''],
  ['5', 'Module 4: Leadership Action Plan', 'Module', 'S8', ''],
  ['5', 'Coaching conversation', 'Coaching', 'S9', ''],
  ['6', 'Coaching conversation', 'Coaching', '', ''],
  ['7', 'Coaching conversation (closing)', 'Coaching', '', ''],
  ['8', 'Sponsor progress review', 'Review', 'S10', '']
];

/* ---------------- Assessment: case studies and final assessment ---------------- */

/** Modules that have case studies (two cases each). Add more rows in the Case Studies tab for other modules. */
const CASE_MODULES = ['3'];

/** Case types. In the Type column write: Coach case, Hypothetical, or My own case. */
const CASE_TYPES = {
  coach: 'Coach case',
  hypothetical: 'Hypothetical',
  own: 'My own case'
};
const CASE_QUESTIONS_DEFAULT = [
  'What is really going on here? What are the key leadership issues?',
  'What would you do, and in what order? Be specific.',
  'Which of your five priorities does this connect to, and how would you apply it in your own team?'
].join('\n');
const CASE_QUESTIONS_OWN = [
  'What was the situation? Who was involved and what was at stake?',
  'What did you do, or what are you planning to do?',
  'What happened as a result, or what result do you expect?',
  'Looking back, what would you do differently, and what did you learn?'
].join('\n');
const CASE_OWN_PROMPT = 'Choose a real situation from your work that connects to this module. You can change names to keep it confidential.';

/** Written part of the final assessment. Edit them in the Final Reflection tab. */
const FINAL_REFLECTION_DEFAULT = [
  ['R1', 'What are the most important shifts you have made as a leader during this program?'],
  ['R2', 'Which of the five priorities have you improved most? Share a specific example from work.'],
  ['R3', 'Which tool or idea from the modules have you used most, and what result did it bring?'],
  ['R4', 'What feedback have you received from your team, peers or director about your leadership?'],
  ['R5', 'Which priority still needs the most attention, and what will you do about it in the next 90 days?'],
  ['R6', 'What support do you need from your director to keep growing?']
];

/**
 * Default diagnostic: 30 questions across 5 leadership priorities.
 * Each priority has 5 statements rated 1 to 5 and 1 open question.
 * Edit them in the Diagnostic tab; run loadDiagnosticQuestions to restore these.
 */
const DIAG_DEFAULT_QUESTIONS = (function () {
  const R = 'rating', T = 'text';
  const P1 = 'Moving from doing to directing';
  const P2 = 'Delegation and ownership';
  const P3 = 'Managing priorities and saying no';
  const P4 = 'Providing clear direction';
  const P5 = 'Follow-through and accountability';
  return [
    ['P1', P1, R, 'I spend most of my time on work only I can do as a leader, not on tasks my team could handle.', 'Yes'],
    ['P2', P1, R, 'I hold back from jumping in to fix problems myself when a team member could solve them.', 'Yes'],
    ['P3', P1, R, 'I measure my success by what my team achieves, not by my own individual output.', 'Yes'],
    ['P4', P1, R, 'I set aside regular time for planning, coaching and thinking ahead, not just day-to-day work.', 'Yes'],
    ['P5', P1, R, 'I am comfortable letting go of work I used to be the expert in.', 'Yes'],
    ['P6', P1, T, 'What work are you still doing yourself that you should be directing others to do? What keeps you holding on to it?', 'Yes'],

    ['P7', P2, R, 'I delegate the whole outcome, not just the steps, and let the person decide how to get there.', 'Yes'],
    ['P8', P2, R, 'When I delegate, I am clear about the result, the deadline and how much authority the person has.', 'Yes'],
    ['P9', P2, R, 'I match what I delegate to each person\'s strengths and development needs.', 'Yes'],
    ['P10', P2, R, 'Once I delegate something, I avoid taking it back or redoing it myself.', 'Yes'],
    ['P11', P2, R, 'My team members take ownership and bring me solutions, not just problems.', 'Yes'],
    ['P12', P2, T, 'Think of a task you delegated recently. What went well, and what would you do differently?', 'Yes'],

    ['P13', P3, R, 'I know my top three priorities, and they guide how I spend my week.', 'Yes'],
    ['P14', P3, R, 'I confidently say "no" or "not now" to requests that do not fit our priorities.', 'Yes'],
    ['P15', P3, R, 'When new work comes in, I discuss trade-offs instead of simply adding it to the list.', 'Yes'],
    ['P16', P3, R, 'I protect my team from unnecessary work and constantly shifting demands.', 'Yes'],
    ['P17', P3, R, 'I can explain to stakeholders why something is or is not a priority without feeling guilty.', 'Yes'],
    ['P18', P3, T, 'Which requests or demands make it hardest for you to say "no" or "not now"? Why?', 'Yes'],

    ['P19', P4, R, 'My team understands how their work connects to the goals of the wider organization.', 'Yes'],
    ['P20', P4, R, 'I explain the "why" behind decisions and priorities, not just the "what".', 'Yes'],
    ['P21', P4, R, 'I set clear expectations about quality, deadlines and what good looks like.', 'Yes'],
    ['P22', P4, R, 'I check that people have understood my direction before they start.', 'Yes'],
    ['P23', P4, R, 'My direction stays consistent, so my team is not confused by changing instructions.', 'Yes'],
    ['P24', P4, T, 'Where does your team most often get unclear about direction? What do you notice when it happens?', 'Yes'],

    ['P25', P5, R, 'I follow up on commitments at the agreed time, without needing reminders.', 'Yes'],
    ['P26', P5, R, 'I hold people accountable consistently and fairly, including high performers.', 'Yes'],
    ['P27', P5, R, 'I address missed commitments early and directly, rather than letting them slide.', 'Yes'],
    ['P28', P5, R, 'Meetings I lead end with clear owners and next steps.', 'Yes'],
    ['P29', P5, R, 'I keep the commitments I make to my team and stakeholders.', 'Yes'],
    ['P30', P5, T, 'What gets in the way of follow-through for you or your team? What would help most?', 'Yes']
  ];
})();

/** Rating scale for diagnostic statements. */
const DIAG_SCALE = ['Rarely', 'Sometimes', 'Often', 'Usually', 'Consistently'];

/** Your coaching email: used when COACH_EMAIL on the Config tab is blank. */
const COACH_EMAIL_DEFAULT = '[REDACTED]';

/** Config keys added to older Sheets by setup (key, default value, note). */
const CONFIG_DEFAULTS = [
  ['DIAGNOSTIC_ENABLED', 'Yes', 'Yes shows the leadership diagnostic in the portal'],
  ['DIAGNOSTIC_DUE', '', 'Date to complete it by, e.g. 2026-11-03'],
  ['DIAGNOSTIC_INTRO', 'This helps us focus our first session on what matters most to you. There are no right or wrong answers. Rate how you lead today, not how you would like to lead.', 'Short note shown above the questions'],
  ['DIAGNOSTIC_SUBMITTED', '', 'Filled in automatically when the participant submits'],
  ['BOOKING_ENABLED', 'Yes', 'Yes shows the Book tab for coaching sessions'],
  ['BOOKING_MIN_HOURS', '24', 'How many hours ahead a session must be booked, moved or cancelled'],
  ['BOOKING_CALENDAR', 'Yes', 'Yes adds each booking to your Google Calendar and invites the participant'],
  ['PARTICIPANT_EMAIL', '', 'Participant email(s) for emails and calendar invites. Separate several with commas'],
  ['BOOKING_MODE', 'request', 'request: the participant picks any free date and time and you confirm. slots: they choose from times you list in the Availability tab'],
  ['BOOKING_CHECK_CALENDARS', '[REDACTED], [REDACTED]', 'Calendars to check for busy times, separated by commas. Each must be yours or shared with this Google account'],
  ['BOOKING_DAYS', 'Mon-Sat', 'Days the participant can request, e.g. Mon-Fri or Mon,Wed,Fri'],
  ['BOOKING_HOURS', '08:00-20:00', 'Earliest start to latest end, Manila time'],
  ['BOOKING_MINUTES', '45', 'Length of a coaching session in minutes'],
  ['BOOKING_LINK', '', 'Your usual Zoom or Meet link for coaching sessions (optional)'],
  ['BOOKING_BLOCKED_TIMES', '', 'Weekly times you are never free, e.g. Tue 12:00-20:00, Wed 18:00-20:00 (Manila time)'],
  ['CASES_ENABLED', 'Yes', 'Yes shows the Case Studies in the Assessment tab'],
  ['FINAL_ENABLED', 'Yes', 'Yes shows the Final Assessment in the Assessment tab'],
  ['FINAL_OPENS', '', 'Date the final assessment opens, e.g. 2026-12-01. Blank: it opens when the last module is released'],
  ['FINAL_DUE', '', 'Date to complete the final assessment by (optional)'],
  ['FINAL_SUBMITTED', '', 'Filled in automatically when the participant submits the final assessment'],
  ['TRACKER_ENABLED', 'No', 'Yes shows the Tracker tab (weekly scorecard and request log) to the participant. Switch it from the coach dashboard'],
  ['TRACKER_START', '2026-11-16', 'First week to track (YYYY-MM-DD). Weeks run Saturday to Friday']
];

/** Items the participant can add, edit and delete (Goals and Action Plan). */
const ITEM_KINDS = {
  goal: {
    sheet: SHEETS.GOALS, max: 3, required: 'goal', requiredMsg: 'Please describe your specific goal.',
    // SMART: Specific, Measurable, Achievable, Relevant, Time-bound
    fields: [['goal', 'Specific Goal'], ['measure', 'Measurable'], ['achievable', 'Achievable'],
             ['relevant', 'Relevant'], ['target', 'Target Date'], ['baseline', 'Baseline (1-10)'],
             ['current', 'Current (1-10)'], ['notes', 'Progress Notes']],
    dates: ['target'],
    ratings: ['baseline', 'current'],
    lockOnceSet: ['baseline'] // the baseline cannot be changed after it is first saved
  },
  plan: {
    sheet: SHEETS.PLAN, max: 3, required: 'commitment', requiredMsg: 'Please write your commitment.', dates: [],
    fields: [['commitment', 'Commitment'], ['why', 'Why It Matters'], ['d30', 'First 30 Days'],
             ['d60', 'Days 31-60'], ['d90', 'Days 61-90'], ['measure', 'Success Measure'],
             ['support', 'Support Needed'], ['status', 'Status']],
    ratings: [],
    lockOnceSet: []
  }
};

const PLAN_STATUSES = ['Not started', 'In progress', 'Done'];

/** Column names used by the earlier version of the portal (new name: old name). */
const LEGACY_COLUMNS = { 'Specific Goal': 'Goal', 'Measurable': 'What Success Looks Like' };
const MAX_TEXT = 5000;
const MAX_FAILS = 5;            // wrong codes allowed before lockout
const LOCK_SECONDS = 15 * 60;   // lockout length

/* ---------------- Menu & web app ---------------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Coach Portal')
    .addItem('Set up portal sheets', 'setup')
    .addItem('Show access code', 'showAccessCode')
    .addItem('Reset access code', 'resetAccessCode')
    .addItem('Check slides links', 'checkSlides')
    .addItem('Load the 30 priority questions', 'loadDiagnosticQuestions')
    .addItem('Check availability', 'checkAvailability')
    .addItem('Check calendars', 'checkCalendars')
    .addItem('Confirm requested sessions', 'confirmRequested')
    .addItem('Check loading speed', 'checkSpeed')
    .addItem('Get coach dashboard link', 'coachDashboardLink')
    .addItem('Check sending address', 'checkSendFrom')
    .addItem('Turn on session reminders (2 days before)', 'setupReminders')
    .addItem('Schedule the pending-tasks email', 'schedulePendingReminder')
    .addToUi();
}

function doGet(e) {
  // Coach confirmation links from booking emails
  if (e && e.parameter && e.parameter.confirm) return confirmPage_(e.parameter);
  // Participant confirms a missed session (link in the email)
  if (e && e.parameter && e.parameter.missed) return missedConfirmPage_(String(e.parameter.missed), String(e.parameter.a || 'yes'));
  // Coach dashboard (private link with the coach key)
  if (e && e.parameter && e.parameter.coach !== undefined) return coachPage_(e.parameter.coach);
  // Script for the Wix custom element that shows the portal full-screen (see CUSTOM_ELEMENT_JS_)
  if (e && e.parameter && e.parameter.ce !== undefined) {
    return ContentService.createTextOutput(CUSTOM_ELEMENT_JS_.replace('__SRC__', WEBAPP_URL_DEFAULT))
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('coachjeff. Coaching Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    // ALLOWALL lets you embed the portal on a page of your own website (e.g. coachjeffrosales.com/portal)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------------- Spreadsheet location ---------------- */

/**
 * Returns the portal spreadsheet. Uses the Sheet setup() created (ID saved in
 * Script Properties), or the Sheet this script is attached to.
 */
// Opened once per request: opening a spreadsheet is the slowest step, so it is reused.
let SS_ = null;
// Tab contents read during one request (cleared whenever the portal re-reads after a change).
let ROWS_ = {};

function getSS_(createIfMissing) {
  if (SS_) return SS_;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) return (SS_ = SpreadsheetApp.openById(id));

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return (SS_ = active);

  if (!createIfMissing) throw new Error('Portal is not set up yet. Please contact your coach.');
  const ss = SpreadsheetApp.create('Emerging Manager Accelerator – Participant Portal');
  props.setProperty('SHEET_ID', ss.getId());
  return (SS_ = ss);
}

function notify_(title, msg) {
  Logger.log(title + '\n' + msg);
  try { SpreadsheetApp.getUi().alert(title, msg, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) { /* run from the editor: see Execution log */ }
}

/* ---------------- Setup (safe to re-run: only adds missing tabs) ---------------- */

function setup() {
  const ss = getSS_(true);
  const created = [];

  if (!ss.getSheetByName(SHEETS.CONFIG)) {
    seedSheet_(ss, SHEETS.CONFIG, HEADERS.CONFIG, [
      ['ACCESS_CODE', genCode_(), 'Share this with the participant. Use resetAccessCode to change it.'],
      ['PROGRAM_TITLE', 'Emerging Manager Accelerator', ''],
      ['PROGRAM_TAGLINE', 'Your first leadership chapter, one week at a time.', 'Short line under the greeting'],
      ['PARTICIPANT_NAME', 'Participant Name', 'Full name. The greeting uses the first word.'],
      ['PARTICIPANT_ROLE', '', 'e.g. Team Lead, Operations'],
      ['ORGANIZATION', '', ''],
      ['COACH_NAME', 'Coach Jeff Rosales', ''],
      ['COACH_TITLE', 'Leadership Coach', ''],
      ['COACH_PHOTO_URL', '', 'Public image link (e.g. a photo from your website). Leave blank to show initials.'],
      ['SEND_FROM', COACH_EMAIL_DEFAULT, 'Every portal email is sent from this address and replies come back to it'],
      ['COACH_EMAIL', COACH_EMAIL_DEFAULT, 'Where request, confirmation and diagnostic emails go. Also the Email button on the coach card'],
      ['COACH_VIBER', '', 'Phone with country code, e.g. +639171234567. Shows a Viber button'],
      ['COACH_WHATSAPP', '', 'Phone with country code, e.g. +639171234567. Shows a WhatsApp button'],
      ['COACH_WEBSITE', 'https://coachjeffrosales.com', ''],
      ['WELCOME_MESSAGE', 'Glad you are here! Small steps every week add up to big leadership growth. Let us make this count.', 'Keep it short: 1 to 2 sentences']
    ].concat(CONFIG_DEFAULTS));
    created.push(SHEETS.CONFIG);
  }

  if (!ss.getSheetByName(SHEETS.SESSIONS)) {
    seedSheet_(ss, SHEETS.SESSIONS, HEADERS.SESSIONS, [
      ['S1', 'Kickoff', 'Kickoff: Your Leadership Starting Point', '', 'Week 1', 'TBC', '1 hour', 'TBC', '', 'Upcoming', 'Set your goals and baseline'],
      ['S2', 'Module', 'Module 1: Leading Yourself First', '', 'Week 1', 'TBC', '1.5 hours', 'TBC', '', 'Upcoming', ''],
      ['S3', 'Coaching', 'Coaching Check-in 1', '', 'Week 2', 'TBC', '30–45 min', 'Online', '', 'Upcoming', 'How did your first challenge go?'],
      ['S4', 'Module', 'Module 2: Delegate, Direct, Prioritize', '', 'Week 2', 'TBC', '1.5 hours', 'TBC', '', 'Upcoming', ''],
      ['S5', 'Coaching', 'Coaching Check-in 2', '', 'Week 3', 'TBC', '30–45 min', 'Online', '', 'Upcoming', ''],
      ['S6', 'Module', 'Module 3: Real Situations, Real Decisions', '', 'Week 3', 'TBC', '1.5 hours', 'TBC', '', 'Upcoming', ''],
      ['S7', 'Coaching', 'Coaching Check-in 3', '', 'Week 4', 'TBC', '30–45 min', 'Online', '', 'Upcoming', ''],
      ['S8', 'Module', 'Module 4: Your 90-Day Leadership Plan', '', 'Week 4', 'TBC', '1.5 hours', 'TBC', '', 'Upcoming', ''],
      ['S9', 'Coaching', 'Coaching Check-in 4: Plan Follow-up', '', 'Week 6', 'TBC', '30–45 min', 'Online', '', 'Upcoming', ''],
      ['S10', 'Review', 'Progress Review & Graduation', '', 'Week 6', 'TBC', '30 min', 'TBC', '', 'Upcoming', 'Celebrate your growth and receive your certificate']
    ], { textColumn: 4 });
    created.push(SHEETS.SESSIONS);
  }

  if (!ss.getSheetByName(SHEETS.MODULES)) {
    seedSheet_(ss, SHEETS.MODULES, HEADERS.MODULES, [
      ['1', 'Leading Yourself First', '',
        'Great managers lead themselves before they lead others.',
        'Know your leadership identity: who you want to be as a manager\nManage your energy, focus and time\nThe LEAD™ leadership framework',
        'Think of the best manager you have had. What did they do that you want to do too?',
        '',
        'What did you learn about yourself this week?\nWhich part of the LEAD™ framework will you work on first?\nWhat did you try, and what happened?',
        'Ask one team member: "What is one thing I could do to make your work easier?" Listen, thank them, and act on it.',
        'Yes', ''],
      ['2', 'Delegate, Direct, Prioritize', '',
        'Get work done through others, without doing it all yourself.',
        'Delegate outcomes, not just tasks\nGive direction people can act on\nPrioritize what truly matters\nManage stakeholders and hold people accountable',
        'List your top 5 priorities this month and one task you could hand off.',
        '',
        'What did you delegate, and how did it go?\nWhat would you do differently next time?\nWhere did you feel stuck?',
        'Delegate one task you would normally do yourself. Agree on the outcome and deadline, then let them own it.',
        'No', ''],
      ['3', 'Real Situations, Real Decisions', '',
        'Practice the hard moments of managing before they happen.',
        'Handle difficult conversations\nDecide when things are unclear\nLead former peers and work across teams',
        'Bring one real situation you are facing right now.',
        '',
        'Which insight applies to your situation?\nWhat will you do differently now?\nWhat support do you need?',
        'Have one conversation you have been putting off. Use the approach we practiced.',
        'No', ''],
      ['4', 'Your 90-Day Leadership Plan', '',
        'Turn everything you learned into a plan you will actually follow.',
        'Set 3 leadership commitments\nPlan your first 30, 60 and 90 days\nBuild support and accountability',
        'Look back at your weekly ratings and pick the 3 shifts that matter most.',
        '',
        'What are your three commitments?\nHow will you know you are making progress?\nWhat might get in the way?',
        'Share one commitment from your plan with your manager and ask for their support.',
        'No', '']
    ], { textColumn: 3 });
    created.push(SHEETS.MODULES);
  }

  if (!ss.getSheetByName(SHEETS.DIAG_Q)) {
    seedSheet_(ss, SHEETS.DIAG_Q, HEADERS.DIAG_Q, DIAG_DEFAULT_QUESTIONS);
    created.push(SHEETS.DIAG_Q);
  }
  if (!ss.getSheetByName(SHEETS.SLOTS)) {
    const sh = seedSheet_(ss, SHEETS.SLOTS, HEADERS.SLOTS, []);
    sh.getRange(1, 1).setNote('Type the date, e.g. 2026-11-10');
    sh.getRange(1, 2).setNote('Type the start time, e.g. 9:30 AM or 14:00 (Manila time)');
    sh.getRange(1, 3).setNote('Length in minutes, e.g. 45');
    sh.getRange(1, 5).setNote('Zoom or Google Meet link for this time (optional)');
    sh.getRange(1, 6).setNote('Optional: a session ID from the Sessions tab (e.g. S3) if this time is only for that session');
    sh.getRange(1, 7).setNote('Filled in automatically when a session is booked. Do not edit.');
    created.push(SHEETS.SLOTS);
  }
  if (!ss.getSheetByName(SHEETS.DIAG_A)) { seedSheet_(ss, SHEETS.DIAG_A, HEADERS.DIAG_A, []); created.push(SHEETS.DIAG_A); }
  if (!ss.getSheetByName(SHEETS.DIAG_S)) { seedSheet_(ss, SHEETS.DIAG_S, HEADERS.DIAG_S, []); created.push(SHEETS.DIAG_S); }

  if (!ss.getSheetByName(SHEETS.CHALLENGES)) {
    seedSheet_(ss, SHEETS.CHALLENGES, HEADERS.CHALLENGES, [['1', 'No', '', '', ''], ['2', 'No', '', '', ''], ['3', 'No', '', '', ''], ['4', 'No', '', '', '']]);
    created.push(SHEETS.CHALLENGES);
  }

  [['JOURNAL', SHEETS.JOURNAL], ['GOALS', SHEETS.GOALS], ['PLAN', SHEETS.PLAN]].forEach(([key, name]) => {
    if (!ss.getSheetByName(name)) {
      seedSheet_(ss, name, HEADERS[key], []);
      created.push(name);
    }
  });

  created.push.apply(created, ensureAssessment_());
  created.push.apply(created, ensureTracker_());

  // Add any new Config settings to an older Sheet (existing values are kept)
  const addedKeys = ensureConfig_(ss.getSheetByName(SHEETS.CONFIG));
  if (addedKeys.length) created.push('Config settings: ' + addedKeys.join(', '));

  // Bring tabs from an older version up to date (adds new columns, keeps all data)
  const updated = [];
  [['MODULES', SHEETS.MODULES], ['GOALS', SHEETS.GOALS], ['SESSIONS', SHEETS.SESSIONS]].forEach(([key, name]) => {
    if (ensureColumns_(ss.getSheetByName(name), HEADERS[key])) updated.push(name);
  });
  textColumn_(ss.getSheetByName(SHEETS.GOALS), 'Target Date');

  // Remove the blank default tab left by SpreadsheetApp.create()
  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1 && blank.getLastRow() === 0) ss.deleteSheet(blank);

  const code = String(getConfig_().ACCESS_CODE || '');
  const weak = code.replace(/[^A-Z0-9]/gi, '').length < 8;
  const msg = (created.length ? 'Created: ' + created.join(', ') + '.' : 'All portal tabs already exist.') +
    (updated.length ? '\nUpdated with new columns: ' + updated.join(', ') + '.' : '') +
    '\n\nGoogle Sheet: ' + ss.getUrl() +
    '\nAccess code: ' + code +
    (weak ? '\n\n⚠ This access code is short. Run resetAccessCode to generate a stronger one.' : '') +
    '\n\nNext: Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).';
  notify_('Coach Portal setup', msg);
}

function showAccessCode() {
  notify_('Coach Portal', 'Google Sheet: ' + getSS_(false).getUrl() + '\nAccess code: ' + (getConfig_().ACCESS_CODE || '(not set)'));
}

/** Generates a new strong access code, saves it to Config, and clears any lockout. */
function resetAccessCode() {
  const sh = sheet_(SHEETS.CONFIG);
  const keys = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]));
  const code = genCode_();
  const idx = keys.indexOf('ACCESS_CODE');
  if (idx === -1) sh.appendRow(['ACCESS_CODE', code, 'Share this with the participant.']);
  else sh.getRange(idx + 1, 2).setValue(code);
  const cache = CacheService.getScriptCache();
  cache.remove('portal_lock'); cache.remove('portal_fails');
  notify_('Coach Portal', 'New access code: ' + code + '\n\nThe old code no longer works. Send the new one to the participant.');
}

function genCode_() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no look-alike characters (0/O, 1/I/L)
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) s += '-';
  }
  return 'EMA-' + s;
}

function seedSheet_(ss, name, headers, rows, opts) {
  const sh = ss.insertSheet(name);
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#2F2B7F').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  if (opts && opts.textColumn) {
    // Keep dates as plain text so they are never shifted by time zones
    sh.getRange(2, opts.textColumn, Math.max(rows.length, 1) + 50, 1).setNumberFormat('@');
  }
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.getRange(1, 1, Math.max(rows.length, 1) + 1, headers.length).setWrap(true).setVerticalAlignment('top');
  sh.autoResizeColumns(1, headers.length);
  return sh;
}

/* ---------------- Data access ---------------- */

function sheet_(name) {
  const sh = getSS_(false).getSheetByName(name);
  if (!sh) throw new Error('Portal is not fully set up yet. Please contact your coach.');
  return sh;
}

function rows_(name) {
  if (ROWS_[name]) return ROWS_[name];
  const values = sheet_(name).getDataRange().getDisplayValues();
  const headers = values.shift() || [];
  const out = values
    .filter(r => r.some(c => String(c).trim() !== ''))
    .map(r => {
      const o = {};
      headers.forEach((h, i) => { o[h] = r[i]; });
      return o;
    });
  ROWS_[name] = out;
  return out;
}

function getConfig_() {
  const cfg = {};
  rows_(SHEETS.CONFIG).forEach(r => { cfg[r.Key] = r.Value; });
  return cfg;
}

/** Coach tool: measures how long the portal takes to load its data. */
function checkSpeed() {
  const code = getConfig_().ACCESS_CODE;
  const runs = [];
  for (let i = 0; i < 2; i++) {
    SS_ = null; ROWS_ = {};
    const t = Date.now();
    getPortalData(code);
    runs.push(Date.now() - t);
  }
  notify_('Loading speed', 'Loading the portal data took ' + (runs[0] / 1000).toFixed(1) + ' s (second try ' + (runs[1] / 1000).toFixed(1) + ' s).\n\n' +
    'Under 3 seconds is normal for Apps Script. If it is much slower, check that the Sheet has no very long tabs (thousands of empty rows) and that the Journal tab is not huge.');
}

/** Validates the access code, with a lockout after repeated wrong attempts. */
function checkCode_(code) {
  const cache = CacheService.getScriptCache();
  if (cache.get('portal_lock')) {
    throw new Error('Too many incorrect attempts. Please try again in 15 minutes.');
  }
  const expected = String(getConfig_().ACCESS_CODE || '').trim();
  const ok = expected && String(code || '').trim().toUpperCase() === expected.toUpperCase();
  if (!ok) {
    const fails = Number(cache.get('portal_fails') || 0) + 1;
    if (fails >= MAX_FAILS) {
      cache.put('portal_lock', '1', LOCK_SECONDS);
      cache.remove('portal_fails');
      throw new Error('Too many incorrect attempts. Please try again in 15 minutes.');
    }
    cache.put('portal_fails', String(fails), LOCK_SECONDS);
    throw new Error('Invalid access code.');
  }
}

/* ---------------- Slides: email + access code check ---------------- */

/** Participant: returns a released module's slides link once the email and access code match. */
function unlockSlides(code, email, enteredCode, moduleNum) {
  checkCode_(code);
  const cache = CacheService.getScriptCache();
  if (cache.get('slides_lock')) throw new Error('Too many incorrect attempts. Please try again in 15 minutes.');
  const cfg = getConfig_();
  const e = String(email || '').trim().toLowerCase();
  const okEmail = participantEmails_(cfg).some(x => x.toLowerCase() === e);
  const expected = String(cfg.ACCESS_CODE || '').trim().toUpperCase();
  const okCode = expected && String(enteredCode || '').trim().toUpperCase() === expected;
  if (!okEmail || !okCode) {
    const fails = Number(cache.get('slides_fails') || 0) + 1;
    if (fails >= MAX_FAILS) { cache.put('slides_lock', '1', LOCK_SECONDS); cache.remove('slides_fails'); throw new Error('Too many incorrect attempts. Please try again in 15 minutes.'); }
    cache.put('slides_fails', String(fails), LOCK_SECONDS);
    throw new Error(!okEmail ? 'That email is not registered for this portal. Use the email Coach Jeff has on file.' : 'That code is not correct. Use the access code Coach Jeff gave you.');
  }
  cache.remove('slides_fails');
  const num = String(moduleNum || '').trim();
  const m = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === num)[0];
  if (!m || !/^(yes|y|true)$/i.test(String(m['Released']).trim())) throw new Error('This module is not open yet.');
  const url = slideLinks_()[num] || '';
  if (!url) throw new Error('The slides for this module are not uploaded yet.');
  const dl = pdfLinkFor_(url);
  return { url: url, pdf: dl.url, pdfLabel: dl.label };
}

/** Google Slides copy of a PowerPoint file (needs the Drive advanced service). Cached by file id. */
function slidesCopyOf_(fileId) {
  const props = PropertiesService.getScriptProperties();
  const key = 'slidescopy:' + fileId;
  const have = props.getProperty(key);
  if (have) {
    try { DriveApp.getFileById(have).getName(); return have; } catch (e) { props.deleteProperty(key); }
  }
  if (typeof Drive === 'undefined' || !Drive.Files) return '';
  try {
    const src = DriveApp.getFileById(fileId);
    const name = src.getName().replace(/\.pptx?$/i, '') + ' (PDF copy)';
    const made = Drive.Files.copy({ name: name, title: name, mimeType: 'application/vnd.google-apps.presentation' }, fileId);
    const copy = DriveApp.getFileById(made.id);
    try { copy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { Logger.log('Could not share the copy: ' + e.message); }
    try { const parents = src.getParents(); if (parents.hasNext()) copy.moveTo(parents.next()); } catch (e) { /* keep it where it was made */ }
    props.setProperty(key, made.id);
    return made.id;
  } catch (e) {
    Logger.log('Could not convert ' + fileId + ' to Google Slides: ' + e.message);
    return '';
  }
}

/** Editor: prepares the PDF versions of all module slides now, so [REDACTED]'s first download is quick. */
function prepareSlidesPdfs() {
  const links = slideLinks_();
  const out = Object.keys(links).filter(k => links[k]).map(k => 'Module ' + k + ': ' + (pdfLinkFor_(links[k]).label || 'no download') );
  Logger.log(out.join('\n') || 'No slides links yet.');
  return out;
}

/** A direct download link for a slides link: a PDF where possible, otherwise the original file. */
function pdfLinkFor_(url) {
  const u = String(url || '');
  let m = /docs\.google\.com\/presentation\/d\/(?!e\/)([\w-]{10,})/.exec(u);
  if (m) return { url: 'https://docs.google.com/presentation/d/' + m[1] + '/export/pdf', label: 'Download PDF' };
  m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/.exec(u);
  if (m) {
    const id = m[1];
    let mime = '';
    try { mime = DriveApp.getFileById(id).getMimeType(); } catch (e) { /* not reachable: assume a plain file */ }
    if (mime === 'application/vnd.google-apps.presentation') return { url: 'https://docs.google.com/presentation/d/' + id + '/export/pdf', label: 'Download PDF' };
    if (/presentationml|powerpoint/i.test(mime)) {
      // PowerPoint: serve a PDF of a Google Slides copy (made once, then reused)
      const copy = slidesCopyOf_(id);
      if (copy) return { url: 'https://docs.google.com/presentation/d/' + copy + '/export/pdf', label: 'Download PDF' };
    }
    const isPdf = !mime || /pdf/i.test(mime);
    return { url: 'https://drive.google.com/uc?export=download&id=' + id, label: isPdf ? 'Download PDF' : 'Download file' };
  }
  return { url: '', label: '' };
}

/* ---------------- Client API ---------------- */

function getPortalData(code) {
  ROWS_ = {}; // always return the latest data, including anything just saved
  checkCode_(code);
  return cached_('portal', 90, false, buildPortalData_);
}

function buildPortalData_() {
  ROWS_ = {};
  ensureAssessment_();
  ensureTracker_();
  const cfg = getConfig_();
  delete cfg.ACCESS_CODE;

  const sessions = rows_(SHEETS.SESSIONS).map(r => ({
    id: r['ID'], type: r['Type'], title: r['Title'],
    date: r['Date (YYYY-MM-DD)'], dateNote: r['Date Note'],
    time: r['Time'], duration: r['Duration'], mode: r['Mode'],
    location: r['Location / Link'], status: r['Status'], notes: r['Notes']
  }));

  const slideLinks = slideLinks_();
  const modules = rows_(SHEETS.MODULES).map(r => {
    const released = /^(yes|y|true)$/i.test(String(r['Released']).trim());
    const base = { number: r['Module'], title: r['Title'], date: r['Session Date'], released: released };
    if (!released) return base;
    return Object.assign(base, {
      focus: r['Focus'],
      topics: lines_(r['Key Topics']),
      prework: r['Pre-work'],
      resources: lines_(r['Resources']).map(l => {
        const parts = l.split('|');
        const url = (parts[1] || parts[0]).trim();
        return { label: parts[0].trim(), url: /^https?:\/\//i.test(url) ? url : '' };
      }),
      prompts: lines_(r['Reflection Prompts']),
      challenge: r['Weekly Challenge'] || '',
      // The link itself is only given out by unlockSlides(), after an email + access code check
      hasSlides: !!slideLinks[String(r['Module']).trim()]
    });
  });

  const challenges = rows_(SHEETS.CHALLENGES).map(r => ({
    module: r['Module'], done: /^(yes|y|true|done)$/i.test(String(r['Done']).trim()),
    doneOn: r['Done On'], note: r['What Happened'], coachNotes: r['Coach Notes']
  }));

  const journal = rows_(SHEETS.JOURNAL).map(r => ({
    id: r['ID'], created: r['Created'], updated: r['Updated'], module: r['Module'],
    learnings: r['Key Learnings'], applied: r['How I Applied It'],
    questions: r['Questions for Coach'], coachNotes: r['Coach Notes']
  })).reverse();

  // Safety net for the grade timer: if a grade is due and was not sent yet, send it now
  try { if (gradesDue_()) releaseDueGrades(); } catch (e) { Logger.log('Grade release: ' + e.message); }
  const diagnostic = readDiagnostic_(cfg);
  return {
    config: cfg, sessions: sessions, modules: modules, journal: journal, challenges: challenges,
    goals: readItems_('goal'), plan: readItems_('plan'),
    limits: { goal: ITEM_KINDS.goal.max, plan: ITEM_KINDS.plan.max },
    planStatuses: PLAN_STATUSES,
    diagnostic: diagnostic,
    booking: readBooking_(cfg),
    cases: readCases_(cfg),
    final: readFinal_(cfg, diagnostic, modules),
    journey: readJourney_(),
    tracker: readTracker_(cfg, false),
    agreedGoal: readAgreedGoal_(cfg, false),
    gate: gateForPortal_()
  };
}

function saveJournalEntry(code, entry) {
  checkCode_(code);
  if (!entry || !entry.module) throw new Error('Please choose a module.');
  if (!String(entry.learnings || '').trim() && !String(entry.applied || '').trim() && !String(entry.questions || '').trim()) {
    throw new Error('Please write something before saving.');
  }

  withLock_(() => {
    const sh = sheet_(SHEETS.JOURNAL);
    ensureJournalStatus_(sh);
    const now = now_();
    const fields = [clean_(entry.module), clean_(entry.learnings), clean_(entry.applied), clean_(entry.questions)];

    if (entry.id) {
      const row = findRow_(sh, entry.id);
      sh.getRange(row, 3).setValue(now);
      sh.getRange(row, 4, 1, 4).setValues([fields]); // Coach Notes (col 8) is never touched
    } else {
      sh.appendRow([Utilities.getUuid(), now, now].concat(fields).concat(['', 'Open']));
    }
  });
  return getPortalData(code);
}

/** Marks a module's weekly challenge done (or undone), with an optional note. */
/* ---------------- Leadership diagnostic ---------------- */

/* ---------------- Coaching session booking ---------------- */

const BOOK_TZ = 'Asia/Manila';
const BOOK_OFFSET = '+08:00'; // Manila has no daylight saving

/** Reads the Availability tab into slot objects. Works whether dates/times were typed as text or as Sheets dates/times. */
function readSlots_() {
  const ss = getSS_(false);
  const sh = ss.getSheetByName(SHEETS.SLOTS);
  if (!sh || sh.getLastRow() < 2) return [];
  let tz = BOOK_TZ;
  try { tz = ss.getSpreadsheetTimeZone() || BOOK_TZ; } catch (e) { /* default */ }
  const width = Math.max(sh.getLastColumn(), HEADERS.SLOTS.length);
  const headers = sh.getRange(1, 1, 1, width).getValues()[0].map(h => String(h).trim());
  const col = name => headers.indexOf(name);
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
  const out = [];
  vals.forEach((r, i) => {
    const date = cellDate_(r[col('Date')], tz);
    const start = cellTime_(r[col('Start Time')], tz);
    if (!date || !start) return;
    const minutes = parseInt(r[col('Minutes')], 10) || 45;
    const at = Date.parse(date + 'T' + start + ':00' + BOOK_OFFSET);
    out.push({
      row: i + 2,
      id: (i + 2) + '|' + date + '|' + start,
      date: date, start: start, minutes: minutes, at: at,
      mode: String(r[col('Mode')] || '').trim() || 'Online',
      link: normUrl_(r[col('Meeting Link')]),
      only: String(r[col('Only For Session')] || '').trim(),
      booked: String(r[col('Booked Session')] || '').trim(),
      eventId: String(r[col('Calendar Event ID')] || '').trim()
    });
  });
  return out;
}

function cellDate_(v, tz) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  const s = String(v == null ? '' : v).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s); // M/D/YYYY
  if (m) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
  return '';
}

function cellTime_(v, tz) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, tz, 'HH:mm');
  const m = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i.exec(String(v == null ? '' : v).trim());
  if (!m) return '';
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = (m[3] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return '';
  return ('0' + h).slice(-2) + ':' + ('0' + min).slice(-2);
}

function minNoticeMs_(cfg) {
  const h = parseFloat(cfg.BOOKING_MIN_HOURS);
  return (isNaN(h) || h < 0 ? 24 : h) * 3600000;
}

function readBooking_(cfg) {
  if (!/^(yes|y|true)$/i.test(String(cfg.BOOKING_ENABLED || '').trim())) return { enabled: false };
  if (bookingMode_(cfg) === 'request') return readRequests_(cfg);
  if (!getSS_(false).getSheetByName(SHEETS.SLOTS)) return { enabled: false };
  const now = Date.now(), notice = minNoticeMs_(cfg);
  const bookings = {};
  const slots = [];
  readSlots_().forEach(s => {
    const pub = { id: s.id, date: s.date, start: s.start, minutes: s.minutes, mode: s.mode, only: s.only };
    if (s.booked) { bookings[s.booked] = Object.assign({ link: s.link, at: s.at }, pub); return; }
    if (s.at - now >= notice) slots.push(pub);
  });
  slots.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  return { enabled: true, mode: 'slots', minHours: notice / 3600000, slots: slots, bookings: bookings, now: now };
}

/** Books (or moves) a coaching session into an open time. */
function bookSlot(code, sessionId, slotId) {
  checkCode_(code);
  const cfg = getConfig_();
  if (!/^(yes|y|true)$/i.test(String(cfg.BOOKING_ENABLED || '').trim())) throw new Error('Booking is not open.');
  sessionId = String(sessionId || '').trim();
  withLock_(() => {
    const session = findSession_(sessionId);
    if (!session) throw new Error('That session no longer exists. Please refresh the page.');
    if (!/^coaching$/i.test(session.type)) throw new Error('Only coaching sessions can be booked here.');
    if (/^(done|completed?)\b/i.test(session.status)) throw new Error('That session is already done.');
    if (/^missed$/i.test(session.status)) throw new Error('That session was missed and cannot be booked. Please use your remaining coaching sessions.');
    const slots = readSlots_();
    const slot = slots.filter(s => s.id === slotId)[0];
    if (!slot) throw new Error('That time is no longer available. Please pick another.');
    if (slot.booked && slot.booked !== sessionId) throw new Error('Sorry, that time was just taken. Please pick another.');
    if (slot.only && slot.only !== sessionId) throw new Error('That time is reserved for a different session.');
    const notice = minNoticeMs_(cfg);
    if (slot.at - Date.now() < notice) throw new Error('Please book at least ' + (notice / 3600000) + ' hours ahead.');
    const current = slots.filter(s => s.booked === sessionId)[0];
    if (current && current.id === slot.id) return; // already booked here
    if (current && current.at <= Date.now()) throw new Error('This session has already started, so it can no longer be moved. Please message your coach.');

    if (current) releaseSlot_(current);
    const sh = sheet_(SHEETS.SLOTS);
    const H = headerIndex_(sh);
    const eventId = calendarEvent_(cfg, session, slot);
    sh.getRange(slot.row, H['Booked Session'] + 1).setValue(sessionId);
    sh.getRange(slot.row, H['Session Title'] + 1).setValue(session.title);
    sh.getRange(slot.row, H['Booked On'] + 1).setValue(now_());
    sh.getRange(slot.row, H['Calendar Event ID'] + 1).setValue(eventId);
    updateSession_(session.row, {
      date: slot.date, time: fmt12_(slot.start), duration: slot.minutes + ' min',
      mode: slot.mode, link: slot.link, status: 'Booked'
    });
    mailCoach_(cfg, (current ? 'Moved: ' : 'Booked: ') + session.title + ' on ' + longDate_(slot.date) + ', ' + fmt12_(slot.start),
      (cfg.PARTICIPANT_NAME || 'Your participant') + (current ? ' moved ' : ' booked ') + session.title + '.\n\nWhen: ' + longDate_(slot.date) + ', ' + fmt12_(slot.start) +
      ' (Manila time), ' + slot.minutes + ' minutes' + (current ? '\nPreviously: ' + longDate_(current.date) + ', ' + fmt12_(current.start) : '') +
      (slot.link ? '\nLink: ' + slot.link : '') + '\n\nAvailability tab: ' + getSS_(false).getUrl());
  });
  return getPortalData(code);
}

/** Cancels a booked coaching session, if it is far enough ahead. */
function cancelBooking(code, sessionId) {
  checkCode_(code);
  const cfg = getConfig_();
  withLock_(() => {
    const slot = readSlots_().filter(s => s.booked === String(sessionId))[0];
    if (!slot) return;
    const notice = minNoticeMs_(cfg);
    if (slot.at <= Date.now()) throw new Error('This session has already started, so it can no longer be cancelled here. Please message your coach.');
    const session = findSession_(sessionId);
    releaseSlot_(slot);
    if (session) updateSession_(session.row, { date: '', time: 'TBC', duration: '30–45 min', mode: 'Online', link: '', status: 'Upcoming' });
    mailCoach_(cfg, 'Cancelled: ' + (session ? session.title : 'coaching session') + ' on ' + longDate_(slot.date) + ', ' + fmt12_(slot.start),
      (cfg.PARTICIPANT_NAME || 'Your participant') + ' cancelled ' + (session ? session.title : 'a coaching session') + ' on ' + longDate_(slot.date) + ', ' + fmt12_(slot.start) +
      '. The time is open again in the Availability tab.');
  });
  return getPortalData(code);
}

function releaseSlot_(slot) {
  const sh = sheet_(SHEETS.SLOTS);
  const H = headerIndex_(sh);
  if (slot.eventId) {
    try { const ev = CalendarApp.getDefaultCalendar().getEventById(slot.eventId); if (ev) ev.deleteEvent(); }
    catch (e) { Logger.log('Could not remove calendar event: ' + e.message); }
  }
  ['Booked Session', 'Session Title', 'Booked On', 'Calendar Event ID'].forEach(h => sh.getRange(slot.row, H[h] + 1).setValue(''));
}

/** All participant addresses from PARTICIPANT_EMAIL (several can be separated by commas). */
function participantEmails_(cfg) {
  return String((cfg || getConfig_()).PARTICIPANT_EMAIL || '').split(/[,;\s]+/).map(e => e.trim()).filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
}

function calendarEvent_(cfg, session, slot) {
  if (!/^(yes|y|true)$/i.test(String(cfg.BOOKING_CALENDAR || '').trim())) return '';
  try {
    const start = new Date(slot.at), end = new Date(slot.at + slot.minutes * 60000);
    const guest = participantEmails_(cfg).join(',');
    const opts = {
      description: session.title + ' with ' + (cfg.PARTICIPANT_NAME || 'participant') + (slot.link ? '\n\nJoin: ' + slot.link : '') + '\n\nBooked through the coaching portal.',
      location: slot.link || slot.mode
    };
    if (guest) { opts.guests = guest; opts.sendInvites = true; }
    const ev = CalendarApp.getDefaultCalendar().createEvent((cfg.PARTICIPANT_NAME || 'Coaching') + ': ' + session.title, start, end, opts);
    return ev.getId();
  } catch (e) {
    Logger.log('Could not add the calendar event: ' + e.message);
    return '';
  }
}

function findSession_(id) {
  const sh = sheet_(SHEETS.SESSIONS);
  const last = sh.getLastRow();
  if (last < 2) return null;
  const H = headerIndex_(sh);
  const vals = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getDisplayValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][H['ID']]).trim() === String(id)) {
      return { row: i + 2, id: id, type: String(vals[i][H['Type']]).trim(), title: String(vals[i][H['Title']]).trim(), status: String(vals[i][H['Status']]).trim(),
        eventId: H['Calendar Event ID'] !== undefined ? String(vals[i][H['Calendar Event ID']] || '').trim() : '' };
    }
  }
  return null;
}

function updateSession_(row, v) {
  delete ROWS_[SHEETS.SESSIONS];
  const sh = sheet_(SHEETS.SESSIONS);
  const H = headerIndex_(sh);
  const set = (h, val) => { if (H[h] !== undefined) sh.getRange(row, H[h] + 1).setNumberFormat('@').setValue(val); };
  set('Date (YYYY-MM-DD)', v.date);
  set('Time', v.time);
  set('Duration', v.duration);
  set('Mode', v.mode);
  set('Location / Link', v.link);
  set('Status', v.status);
}

function headerIndex_(sh) {
  const H = {};
  sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].forEach((h, i) => { H[String(h).trim()] = i; });
  return H;
}

function fmt12_(hhmm) {
  const p = String(hhmm).split(':');
  let h = parseInt(p[0], 10);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + p[1] + ' ' + ap;
}

function longDate_(iso) {
  const d = new Date(iso + 'T12:00:00' + BOOK_OFFSET);
  return Utilities.formatDate(d, BOOK_TZ, 'EEE, MMM d');
}

/* ---------- Sending email: always from your ICF address ---------- */

/** The address every portal email is sent from and replies go to. Set SEND_FROM on the Config tab to change it. */
function sendFrom_() {
  let cfg = {};
  try { cfg = getConfig_(); } catch (e) { /* no config yet */ }
  const a = String(cfg.SEND_FROM || COACH_EMAIL_DEFAULT).trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a) ? a : COACH_EMAIL_DEFAULT;
}

/** True when the ICF address is set up as a "Send mail as" address in this Gmail account. */
function canSendAs_(from) {
  const cache = CacheService.getScriptCache();
  const key = 'sendAs:' + from.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit === 'yes';
  let ok = false;
  try { ok = GmailApp.getAliases().some(a => String(a).toLowerCase() === from.toLowerCase()); }
  catch (e) { Logger.log('Could not check Gmail aliases: ' + e.message); }
  cache.put(key, ok ? 'yes' : 'no', ok ? 21600 : 600);
  return ok;
}

/** Sends from the ICF address (when Gmail allows it); replies always go to the ICF address. */
function sendMail_(o) {
  const from = sendFrom_();
  const opts = { replyTo: from, name: o.name || 'Coach Jeff' };
  if (o.cc) opts.cc = o.cc;
  if (o.htmlBody) opts.htmlBody = o.htmlBody;
  if (canSendAs_(from)) {
    opts.from = from;
    GmailApp.sendEmail(o.to, o.subject, o.body || '', opts);
    return 'from';
  }
  const m = { to: o.to, subject: o.subject, body: o.body || '', replyTo: from, name: opts.name };
  if (o.cc) m.cc = o.cc;
  if (o.htmlBody) m.htmlBody = o.htmlBody;
  MailApp.sendEmail(m);
  return 'replyTo';
}

/** Menu: checks which address portal emails are sent from. Run once from the editor to approve Gmail access. */
function checkSendFrom() {
  const from = sendFrom_();
  CacheService.getScriptCache().remove('sendAs:' + from.toLowerCase());
  const ok = canSendAs_(from);
  const me = Session.getEffectiveUser().getEmail();
  const msg = ok
    ? 'All portal emails are sent from ' + from + '. Replies go to ' + from + '.'
    : 'Portal emails are sent from ' + me + ' with replies going to ' + from + '.\n\nTo send from ' + from + ' itself, add it in Gmail (' + me + '): Settings > See all settings > Accounts and Import > Send mail as > Add another email address. Then run this check again.';
  notify_('Sending address', msg);
  return msg;
}

function mailCoach_(cfg, subject, body) {
  const to = String(cfg.COACH_EMAIL || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return;
  try { sendMail_({ to: to, subject: subject, body: body }); }
  catch (e) { Logger.log('Could not email the coach: ' + e.message); }
}

/* ---------- Request mode: participant picks any free time, coach confirms ---------- */

function bookingMode_(cfg) {
  return /^slots?$/i.test(String(cfg.BOOKING_MODE || '').trim()) ? 'slots' : 'request';
}

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "Mon-Sat" or "Mon,Wed,Fri" -> [1..6]. Empty means every day. */
function bookingDays_(cfg) {
  const s = String(cfg.BOOKING_DAYS || '').toLowerCase().replace(/\s/g, '');
  if (!s) return [0, 1, 2, 3, 4, 5, 6];
  const days = [];
  s.split(',').forEach(part => {
    const m = /^([a-z]{3})[a-z]*(?:-([a-z]{3})[a-z]*)?$/.exec(part);
    if (!m) return;
    const a = DAY_NAMES.indexOf(m[1]), b = m[2] ? DAY_NAMES.indexOf(m[2]) : a;
    if (a < 0 || b < 0) return;
    for (let i = a; ; i = (i + 1) % 7) { if (days.indexOf(i) === -1) days.push(i); if (i === b) break; }
  });
  return days.length ? days.sort() : [0, 1, 2, 3, 4, 5, 6];
}

function bookingHours_(cfg) {
  const m = /^\s*([\d:.apm\s]+?)\s*(?:-|to)\s*([\d:.apm\s]+?)\s*$/i.exec(String(cfg.BOOKING_HOURS || ''));
  const from = m ? cellTime_(m[1], BOOK_TZ) : '', to = m ? cellTime_(m[2], BOOK_TZ) : '';
  return from && to && from < to ? { from: from, to: to } : { from: '08:00', to: '20:00' };
}

/** "Tue 12:00-20:00, Wed 6 PM-8 PM" -> { 2: [[720, 1200]], 3: [[1080, 1200]] } (minutes from midnight). */
function weeklyBlocks_(cfg) {
  const out = {};
  String(cfg.BOOKING_BLOCKED_TIMES || '').split(/[,;\n]+/).forEach(part => {
    const m = /^\s*([a-z]{3})[a-z]*\s+(.+?)\s*(?:-|to)\s*(.+?)\s*$/i.exec(part);
    if (!m) return;
    const day = DAY_NAMES.indexOf(m[1].toLowerCase());
    const a = cellTime_(m[2], BOOK_TZ), b = cellTime_(m[3], BOOK_TZ);
    if (day < 0 || !a || !b || a >= b) return;
    (out[day] = out[day] || []).push([toMin_(a), toMin_(b)]);
  });
  return out;
}

function bookingMinutes_(cfg) {
  const n = parseInt(cfg.BOOKING_MINUTES, 10);
  return n >= 15 && n <= 240 ? n : 45;
}

function toMin_(hhmm) { const p = hhmm.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
function fromMin_(m) { return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }

/** Requested and confirmed coaching sessions, read from the Sessions tab. */
function readRequests_(cfg) {
  const requests = {};
  rows_(SHEETS.SESSIONS).forEach(r => {
    const status = String(r['Status'] || '').trim();
    if (!/^(requested|confirmed|booked)$/i.test(status)) return;
    const date = cellDate_(r['Date (YYYY-MM-DD)'], BOOK_TZ), start = cellTime_(r['Time'], BOOK_TZ);
    if (!date || !start) return;
    const minutes = parseInt(r['Duration'], 10) || bookingMinutes_(cfg);
    requests[String(r['ID']).trim()] = {
      date: date, start: start, minutes: minutes,
      at: Date.parse(date + 'T' + start + ':00' + BOOK_OFFSET),
      status: /^requested$/i.test(status) ? 'requested' : 'confirmed',
      mode: String(r['Mode'] || 'Online').trim() || 'Online',
      link: normUrl_(r['Location / Link'])
    };
  });
  const h = bookingHours_(cfg);
  return {
    enabled: true, mode: 'request', minHours: minNoticeMs_(cfg) / 3600000,
    minutes: bookingMinutes_(cfg), days: bookingDays_(cfg), from: h.from, to: h.to, step: 30,
    bookings: requests, now: Date.now()
  };
}

function checkCalendarIds_(cfg) {
  const ids = String(cfg.BOOKING_CHECK_CALENDARS || '').split(/[,;\s]+/).map(x => x.trim()).filter(Boolean);
  return ids.length ? ids : ['primary'];
}

function calendarFor_(id) {
  if (id === 'primary') return CalendarApp.getDefaultCalendar();
  return CalendarApp.getCalendarById(id);
}

/**
 * Busy times (Manila HH:mm ranges) on one date across all checked calendars and
 * already requested sessions. Only times are returned, never event titles.
 */
function busyOn_(cfg, date, ignoreEventId, ignoreSessionId) {
  const dayStart = new Date(date + 'T00:00:00' + BOOK_OFFSET);
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const busy = [];
  const add = (s, e) => {
    const a = Math.max(0, Math.round((s - dayStart) / 60000)), b = Math.min(1440, Math.round((e - dayStart) / 60000));
    if (b > a) busy.push([a, b]);
  };
  checkCalendarIds_(cfg).forEach(id => {
    try {
      const cal = calendarFor_(id);
      if (!cal) return;
      cal.getEvents(dayStart, dayEnd).forEach(ev => {
        if (ignoreEventId && ev.getId && ev.getId() === ignoreEventId) return;
        if (isDeclined_(ev)) return; // invitations you said no to
        if (ev.isAllDayEvent && ev.isAllDayEvent()) {
          // All-day items (holidays, reminders) only block the day when you marked them "Busy"
          if (!isMarkedBusy_(ev)) return;
          add(dayStart.getTime(), dayEnd.getTime());
          return;
        }
        add(ev.getStartTime().getTime(), ev.getEndTime().getTime());
      });
    } catch (e) { Logger.log('Could not read calendar ' + id + ': ' + e.message); }
  });
  // Weekly times the coach is never free (BOOKING_BLOCKED_TIMES)
  const weekday = new Date(date + 'T12:00:00' + BOOK_OFFSET).getUTCDay();
  (weeklyBlocks_(cfg)[weekday] || []).forEach(b => busy.push(b));
  // Other sessions already requested in this portal (in case they are not on a calendar yet)
  const reqs = readRequests_(cfg).bookings;
  Object.keys(reqs).forEach(sid => {
    if (sid === ignoreSessionId || reqs[sid].date !== date) return;
    add(reqs[sid].at, reqs[sid].at + reqs[sid].minutes * 60000);
  });
  return busy;
}

function isDeclined_(ev) {
  try { return ev.getMyStatus && ev.getMyStatus() === CalendarApp.GuestStatus.NO; } catch (e) { return false; }
}

function isMarkedBusy_(ev) {
  try {
    if (ev.getTransparency) return ev.getTransparency() === CalendarApp.EventTransparency.OPAQUE;
  } catch (e) { /* not available */ }
  return false;
}

/** Times on a date the participant could request: within hours, not busy, far enough ahead. */
function openTimes_(cfg, date, sessionId) {
  const day = new Date(date + 'T12:00:00' + BOOK_OFFSET).getUTCDay();
  if (bookingDays_(cfg).indexOf(day) === -1) return { closedDay: true, times: [] };
  const h = bookingHours_(cfg), len = bookingMinutes_(cfg), notice = minNoticeMs_(cfg);
  const current = readRequests_(cfg).bookings[sessionId];
  const session = sessionId ? findSession_(sessionId) : null;
  const busy = busyOn_(cfg, date, session && session.eventId, sessionId);
  const times = [];
  for (let t = toMin_(h.from); t + len <= toMin_(h.to); t += 30) {
    const at = Date.parse(date + 'T' + fromMin_(t) + ':00' + BOOK_OFFSET);
    const clash = busy.some(b => t < b[1] && t + len > b[0]);
    times.push({ start: fromMin_(t), open: !clash && at - Date.now() >= notice, busy: clash });
  }
  return { closedDay: false, times: times, current: current ? current.date === date ? current.start : '' : '' };
}

/** Client: open times for a date. */
function getOpenTimes(code, sessionId, date) {
  checkCode_(code);
  const cfg = getConfig_();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) throw new Error('Please pick a date.');
  return openTimes_(cfg, date, String(sessionId || ''));
}

/** Client: request (or change) a coaching session time. */
function requestSession(code, sessionId, date, start) {
  checkCode_(code);
  const cfg = getConfig_();
  if (!/^(yes|y|true)$/i.test(String(cfg.BOOKING_ENABLED || '').trim())) throw new Error('Booking is not open.');
  sessionId = String(sessionId || '').trim();
  withLock_(() => {
    const shS = sheet_(SHEETS.SESSIONS);
    ensureColumns_(shS, HEADERS.SESSIONS);
    const session = findSession_(sessionId);
    if (!session) throw new Error('That session no longer exists. Please refresh the page.');
    if (!/^coaching$/i.test(session.type)) throw new Error('Only coaching sessions can be booked here.');
    if (/^(done|completed?)\b/i.test(session.status)) throw new Error('That session is already done.');
    if (/^missed$/i.test(session.status)) throw new Error('That session was missed and cannot be booked. Please use your remaining coaching sessions.');
    const notice = minNoticeMs_(cfg);
    const prev = readRequests_(cfg).bookings[sessionId];
    if (prev && prev.status === 'confirmed' && prev.at <= Date.now()) {
      throw new Error('This session has already started, so it can no longer be changed here. Please message your coach.');
    }
    const open = openTimes_(cfg, String(date), sessionId);
    if (open.closedDay) throw new Error('Coach Jeff is not available on that day. Please pick another day.');
    const slot = open.times.filter(t => t.start === String(start))[0];
    if (!slot) throw new Error('Please pick one of the times shown.');
    if (slot.busy) throw new Error('Sorry, that time just became busy. Please pick another.');
    if (!slot.open) throw new Error('Please choose a time at least ' + (notice / 3600000) + ' hours ahead.');

    const len = bookingMinutes_(cfg);
    const startAt = new Date(date + 'T' + start + ':00' + BOOK_OFFSET), endAt = new Date(startAt.getTime() + len * 60000);
    const link = normUrl_(cfg.BOOKING_LINK);
    // Hold the time on the coach's calendar, marked as a request (no invite yet)
    let eventId = session.eventId;
    try {
      const cal = CalendarApp.getDefaultCalendar();
      const title = '[Requested] ' + (cfg.PARTICIPANT_NAME || 'Coaching') + ': ' + session.title;
      let ev = eventId ? cal.getEventById(eventId) : null;
      if (ev) { ev.setTime(startAt, endAt); ev.setTitle(title); }
      else if (/^(yes|y|true)$/i.test(String(cfg.BOOKING_CALENDAR || '').trim())) {
        ev = cal.createEvent(title, startAt, endAt, { description: 'Requested through the coaching portal. Confirm it from the email or the Coach Portal menu.', location: link || 'Online' });
      }
      eventId = ev ? ev.getId() : '';
    } catch (e) { Logger.log('Could not hold the time on the calendar: ' + e.message); }

    updateSession_(session.row, { date: date, time: fmt12_(start), duration: len + ' min', mode: 'Online', link: link, status: 'Requested' });
    setSessionCell_(session.row, 'Calendar Event ID', eventId);

    const confirmUrl = confirmUrl_(sessionId);
    mailCoach_(cfg, (prev ? 'Change request: ' : 'Session request: ') + session.title + ' on ' + longDate_(date) + ', ' + fmt12_(start),
      (cfg.PARTICIPANT_NAME || 'Your participant') + (prev ? ' would like to move ' : ' requested ') + session.title + '.\n\n' +
      'Requested time: ' + longDate_(date) + ', ' + fmt12_(start) + ' (Manila), ' + len + ' minutes' +
      (prev ? '\nPreviously: ' + longDate_(prev.date) + ', ' + fmt12_(prev.start) : '') +
      '\n\nTo accept this time, click:\n' + confirmUrl +
      '\n\nTo suggest a different time, change Date (YYYY-MM-DD) and Time for ' + sessionId + ' on the Sessions tab, then click the same link. ' +
      (cfg.PARTICIPANT_NAME || 'The participant') + ' will get the calendar invite for whatever time is on the Sessions tab.\n\nSessions tab: ' + getSS_(false).getUrl());
  });
  return getPortalData(code);
}

/** Client: cancel a requested or confirmed session. */
function cancelRequest(code, sessionId) {
  checkCode_(code);
  const cfg = getConfig_();
  withLock_(() => {
    const req = readRequests_(cfg).bookings[String(sessionId)];
    if (!req) return;
    const notice = minNoticeMs_(cfg);
    if (req.status === 'confirmed' && req.at <= Date.now()) throw new Error('This session has already started, so it can no longer be cancelled here. Please message your coach.');
    const short = req.status === 'confirmed' && req.at - Date.now() < notice;
    const session = findSession_(sessionId);
    if (!session) return;
    if (session.eventId) {
      try { const ev = CalendarApp.getDefaultCalendar().getEventById(session.eventId); if (ev) ev.deleteEvent(); }
      catch (e) { Logger.log('Could not remove calendar event: ' + e.message); }
    }
    updateSession_(session.row, { date: '', time: 'TBC', duration: '30–45 min', mode: 'Online', link: '', status: 'Upcoming' });
    setSessionCell_(session.row, 'Calendar Event ID', '');
    mailCoach_(cfg, (short ? 'Short notice: ' : '') + 'Cancelled: ' + session.title + ' on ' + longDate_(req.date) + ', ' + fmt12_(req.start),
      (cfg.PARTICIPANT_NAME || 'Your participant') + ' cancelled ' + session.title + ' (' + longDate_(req.date) + ', ' + fmt12_(req.start) + ')' +
      (short ? ', less than ' + (notice / 3600000) + ' hours before it was due to start' : '') + '. The calendar hold was removed.');
  });
  return getPortalData(code);
}

/** Confirms one session at the time now on the Sessions tab: moves the calendar event there and invites the participant. */
function confirmSession_(cfg, sessionId) {
  const session = findSession_(sessionId);
  if (!session) throw new Error('Session ' + sessionId + ' was not found on the Sessions tab.');
  const req = readRequests_(cfg).bookings[sessionId];
  if (!req) throw new Error(sessionId + ' has no date and time to confirm. Add them on the Sessions tab first.');
  const startAt = new Date(req.at), endAt = new Date(req.at + req.minutes * 60000);
  const guests = participantEmails_(cfg), guest = guests.join(', ');
  const link = req.link || normUrl_(cfg.BOOKING_LINK);
  let eventId = session.eventId, invited = false;
  if (/^(yes|y|true)$/i.test(String(cfg.BOOKING_CALENDAR || '').trim())) {
    try {
      const cal = CalendarApp.getDefaultCalendar();
      const title = (cfg.PARTICIPANT_NAME || 'Coaching') + ': ' + session.title;
      let ev = eventId ? cal.getEventById(eventId) : null;
      if (!ev) ev = cal.createEvent(title, startAt, endAt, { location: link || req.mode });
      ev.setTime(startAt, endAt); ev.setTitle(title);
      ev.setDescription(session.title + ' with ' + (cfg.PARTICIPANT_NAME || 'participant') + (link ? '\n\nJoin: ' + link : ''));
      if (link) ev.setLocation(link);
      if (guests.length) {
        const have = (ev.getGuestList ? ev.getGuestList() : []).map(g => String(g.getEmail()).toLowerCase());
        guests.forEach(g => { if (have.indexOf(g.toLowerCase()) < 0) ev.addGuest(g); });
        invited = true;
      }
      eventId = ev.getId();
    } catch (e) { Logger.log('Calendar update failed: ' + e.message); }
  }
  setSessionCell_(session.row, 'Status', 'Confirmed');
  setSessionCell_(session.row, 'Calendar Event ID', eventId);
  if (invited && eventId) {
    // addGuest does not email; send the participant a short confirmation
    try {
      sendMail_({
        to: guests.join(','),
        subject: 'Confirmed: ' + session.title + ' on ' + longDate_(req.date) + ', ' + fmt12_(req.start),
        body: 'Hi ' + String(cfg.PARTICIPANT_NAME || '').split(' ')[0] + ',\n\nYour ' + session.title + ' is confirmed for ' + longDate_(req.date) + ', ' + fmt12_(req.start) +
          ' (Manila time), ' + req.minutes + ' minutes.' + (link ? '\nJoin: ' + link : '') + '\n\nIt is now on your calendar and in your portal.\n\n' + (cfg.COACH_NAME || 'Coach Jeff')
      });
    } catch (e) { Logger.log('Could not email the participant: ' + e.message); }
  }
  return { title: session.title, date: req.date, start: req.start, minutes: req.minutes, invited: invited, guest: guest };
}

function setSessionCell_(row, header, value) {
  bumpVer_();
  delete ROWS_[SHEETS.SESSIONS];
  const sh = sheet_(SHEETS.SESSIONS);
  const H = headerIndex_(sh);
  if (H[header] !== undefined) sh.getRange(row, H[header] + 1).setNumberFormat('@').setValue(value);
}

function coachKey_() {
  const props = PropertiesService.getScriptProperties();
  let k = props.getProperty('COACH_KEY');
  if (!k) { k = Utilities.getUuid().replace(/-/g, ''); props.setProperty('COACH_KEY', k); }
  return k;
}

function confirmUrl_(sessionId) {
  let base = '';
  try { base = ScriptApp.getService().getUrl() || ''; } catch (e) { /* not deployed */ }
  if (!base) return '(Deploy the portal as a web app to get a confirm link. Meanwhile use Coach Portal > Confirm requested sessions.)';
  return base + '?confirm=' + encodeURIComponent(sessionId) + '&k=' + coachKey_();
}

/** Web page shown when the coach clicks the Confirm link in a request email. */
function confirmPage_(p) {
  let title, body;
  if (String(p.k || '') !== coachKey_()) {
    title = 'Link not valid';
    body = 'This confirmation link is not valid. Please use the latest email, or Coach Portal > Confirm requested sessions in the Sheet.';
  } else {
    try {
      const cfg = getConfig_();
      const r = withLock_(() => confirmSession_(cfg, String(p.confirm)));
      title = 'Confirmed';
      body = r.title + ' is confirmed for ' + longDate_(r.date) + ', ' + fmt12_(r.start) + ' (Manila), ' + r.minutes + ' minutes.' +
        (r.invited ? ' A calendar invite and confirmation email were sent to ' + r.guest + '.' : ' Add PARTICIPANT_EMAIL on the Config tab to send calendar invites.');
    } catch (e) {
      title = 'Not confirmed';
      body = e.message;
    }
  }
  const html = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;font-family:system-ui,sans-serif;background:#F0F5FA;color:#1B1E33">' +
    '<div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #DCE3ED">' +
    '<div style="font-weight:800;font-size:20px;color:#2F2B7F">coachjeff<span style="color:#F79E43">.</span></div>' +
    '<h1 style="color:#2F2B7F;font-size:26px;margin:18px 0 8px">' + escHtml_(title) + '</h1><p style="line-height:1.55">' + escHtml_(body) + '</p></div></body>';
  return HtmlService.createHtmlOutput(html).setTitle(title);
}

/* ---------------- Missed sessions: participant confirms, session becomes "Done (missed)" ---------------- */

const MISSED_DONE = 'Done (missed)';
const WEBAPP_URL_DEFAULT = 'https://script.google.com/macros/s/AKfycby-o4i1L58ciiZ2hHdK7Pps-2CfPRKYqY7d3IILO7hC4KQevFOcwwhTb4Y54_3kbxOPPw/exec';

/** A one-click link for the participant to confirm a missed session. */
function missedConfirmUrl_(sessionId) {
  const props = PropertiesService.getScriptProperties();
  const token = Utilities.getUuid().replace(/-/g, '');
  props.setProperty('missedtok:' + token, String(sessionId));
  const base = normUrl_(getConfig_().WEBAPP_URL) || WEBAPP_URL_DEFAULT;
  return base + '?missed=' + token;
}

/** Confirm and decline links for one missed session (same one-time token). */
function missedLinks_(sessionId) {
  const u = missedConfirmUrl_(sessionId);
  return { confirm: u + '&a=yes', decline: u + '&a=no' };
}

/** Marks a missed session as done (missed). Returns the session title, or '' if it was already done. */
function closeMissed_(sessionId, by) {
  const s = findSession_(String(sessionId));
  if (!s) throw new Error('Session ' + sessionId + ' was not found.');
  if (/^(done|completed?)\b/i.test(s.status)) return { title: s.title, already: true };
  withLock_(() => {
    setSessionCell_(s.row, 'Status', MISSED_DONE);
    const row = rows_(SHEETS.SESSIONS).filter(r => String(r['ID']).trim() === String(sessionId))[0] || {};
    const note = String(row['Notes'] || '').trim();
    const stamp = Utilities.formatDate(new Date(), BOOK_TZ, 'MMM d, yyyy');
    setSessionCell_(s.row, 'Notes', (note ? note + ' · ' : '') + 'Missed; confirmed by ' + by + ' on ' + stamp + ' (not counted as held)');
  });
  return { title: s.title, already: false };
}

function missedConfirmPage_(token, action) {
  let title, body;
  const sid = PropertiesService.getScriptProperties().getProperty('missedtok:' + String(token).replace(/[^\w]/g, ''));
  if (!sid) {
    title = 'Link not valid';
    body = 'This confirmation link is not valid. Please reply to Coach Jeff\'s email instead.';
  } else if (/^(no|decline)/i.test(String(action || ''))) {
    // Declined: nothing changes; the coach follows up
    const cfg = getConfig_();
    const name = String(cfg.PARTICIPANT_NAME || 'the participant').trim().split(/\s+/)[0];
    const s0 = findSession_(sid) || { title: sid, status: '' };
    if (/^(done|completed?)\b/i.test(s0.status)) {
      title = 'Already confirmed';
      body = s0.title + ' was already confirmed as missed. If this is not right, please reply to Coach Jeff\'s email.';
    } else {
      title = 'Thank you, noted';
      body = 'You declined. ' + s0.title + ' stays open for now, and Coach Jeff will get in touch with you about it.';
      try {
        mailCoach_(cfg, name + ' declined: ' + s0.title + ' as missed',
          name + ' clicked Declined on the email about ' + s0.title + '. The session is still marked "Missed" (not done). Please follow up with ' + name + '.');
      } catch (e) { Logger.log('Could not email the coach: ' + e.message); }
    }
  } else {
    try {
      const cfg = getConfig_();
      const name = String(cfg.PARTICIPANT_NAME || 'the participant').trim().split(/\s+/)[0];
      const r = closeMissed_(sid, name);
      title = 'Thank you, confirmed';
      body = r.already ? r.title + ' was already confirmed. Nothing else to do.'
        : 'You confirmed that ' + r.title + ' was missed and will not be counted as a held session. It is now closed in your portal. Please use your remaining coaching sessions in the Book tab.';
      if (!r.already) {
        try {
          mailCoach_(cfg, name + ' confirmed: ' + r.title + ' was missed',
            name + ' clicked Confirm: ' + r.title + ' was missed and is not counted as a held session. It is now marked "' + MISSED_DONE + '" on the Sessions tab and in both dashboards.');
        } catch (e) { Logger.log('Could not email the coach: ' + e.message); }
      }
    } catch (e) {
      title = 'Not confirmed';
      body = e.message;
    }
  }
  const html = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;font-family:system-ui,sans-serif;background:#F0F5FA;color:#1B1E33">' +
    '<div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #DCE3ED">' +
    '<div style="font-weight:800;font-size:20px;color:#2F2B7F">coachjeff<span style="color:#F79E43">.</span></div>' +
    '<h1 style="color:#2F2B7F;font-size:26px;margin:18px 0 8px">' + escHtml_(title) + '</h1><p style="line-height:1.55">' + escHtml_(body) + '</p></div></body>';
  return HtmlService.createHtmlOutput(html).setTitle(title);
}

/** Coach dashboard: closes a missed session as "Done (missed)" without sending the usual thank-you email. */
function coachCloseMissed(key, sessionId) {
  checkCoach_(key);
  closeMissed_(sessionId, 'Coach Jeff');
  return coachData(key);
}

/** Editor: prints a fresh confirm link for each session marked Missed. */
function missedConfirmLinks() {
  const out = rows_(SHEETS.SESSIONS).filter(r => /^missed$/i.test(String(r['Status'] || '').trim()))
    .map(r => { const l = missedLinks_(String(r['ID']).trim()); return r['ID'] + ' ' + r['Title'] + '\nCONFIRM ' + l.confirm + '\nDECLINE ' + l.decline; });
  Logger.log(out.join('\n') || 'No sessions are marked Missed.');
  return out;
}

function escHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Coach menu: confirms every session marked Requested, at the time now on the Sessions tab. */
function confirmRequested() {
  const cfg = getConfig_();
  const ids = Object.keys(readRequests_(cfg).bookings).filter(id => readRequests_(cfg).bookings[id].status === 'requested');
  const lines = ids.map(id => {
    try { const r = withLock_(() => confirmSession_(cfg, id)); delete ROWS_[SHEETS.SESSIONS]; return 'Confirmed ' + r.title + ': ' + longDate_(r.date) + ', ' + fmt12_(r.start) + (r.invited ? ' (invite sent)' : ''); }
    catch (e) { return id + ': ' + e.message; }
  });
  notify_('Confirm requested sessions', lines.length ? lines.join('\n') : 'There are no requested sessions waiting.');
}

/** Coach tool: shows which calendars the portal can read for busy times. */
function checkCalendars() {
  const cfg = getConfig_();
  const lines = checkCalendarIds_(cfg).map(id => {
    try {
      const cal = calendarFor_(id);
      if (!cal) return id + ': NOT READABLE. Share this calendar with ' + Session.getEffectiveUser().getEmail() + ' (at least "See only free/busy").';
      const n = cal.getEvents(new Date(), new Date(Date.now() + 14 * 86400000)).length;
      return id + ': OK (' + n + ' events in the next 2 weeks)';
    } catch (e) { return id + ': NOT READABLE (' + e.message + ')'; }
  });
  notify_('Calendars checked for busy times', lines.join('\n'));
}

/** Coach tool: lists the times the portal can read from the Availability tab. */
function checkAvailability() {
  const cfg = getConfig_();
  const now = Date.now(), notice = minNoticeMs_(cfg);
  const sh = getSS_(false).getSheetByName(SHEETS.SLOTS);
  if (!sh) { notify_('Availability', 'There is no Availability tab yet. Run setup first.'); return; }
  const slots = readSlots_();
  const rows = sh.getLastRow() - 1;
  const lines = slots.map(s => longDate_(s.date) + ', ' + fmt12_(s.start) + ' (' + s.minutes + ' min)' +
    (s.booked ? ': BOOKED for ' + s.booked : s.at - now < notice ? ': too soon or past, hidden' : ': open') + (s.only ? ' [only ' + s.only + ']' : ''));
  if (rows > slots.length) lines.push((rows - slots.length) + ' row(s) skipped: the Date or Start Time could not be read. Use dates like 2026-11-10 and times like 9:30 AM.');
  if (!lines.length) lines.push('No times yet. Add rows with a Date and Start Time.');
  notify_('Availability', lines.join('\n'));
}

function readDiagnostic_(cfg) {
  const ss = getSS_(false);
  const enabled = /^(yes|y|true)$/i.test(String(cfg.DIAGNOSTIC_ENABLED || '').trim());
  if (!enabled || !ss.getSheetByName(SHEETS.DIAG_Q)) return { enabled: false };
  const questions = diagQuestions_();
  const answers = {};
  if (ss.getSheetByName(SHEETS.DIAG_A)) {
    rows_(SHEETS.DIAG_A).forEach(r => { answers[String(r['ID']).trim()] = r['Answer']; });
  }
  return {
    enabled: true,
    due: configDate_('DIAGNOSTIC_DUE'),
    intro: cfg.DIAGNOSTIC_INTRO || '',
    submittedOn: cfg.DIAGNOSTIC_SUBMITTED || '',
    scale: DIAG_SCALE,
    questions: questions,
    answers: answers,
    summary: diagSummary_(questions, answers)
  };
}

function diagQuestions_() {
  return rows_(SHEETS.DIAG_Q)
    .map(r => ({
      id: String(r['ID']).trim(),
      area: String(r['Area'] || 'General').trim(),
      type: /^text$/i.test(String(r['Type']).trim()) ? 'text' : 'rating',
      text: String(r['Question'] || '').trim(),
      required: !/^(no|n|false)$/i.test(String(r['Required']).trim())
    }))
    .filter(q => q.id && q.text);
}

/** Average rating per area, with the top area(s) marked Strength and the lowest Focus area. */
function diagSummary_(questions, answers) {
  const areas = [];
  const by = {};
  questions.filter(q => q.type === 'rating').forEach(q => {
    if (!by[q.area]) { by[q.area] = { area: q.area, total: 0, count: 0 }; areas.push(by[q.area]); }
    const v = parseInt(answers[q.id], 10);
    if (v >= 1 && v <= 5) { by[q.area].total += v; by[q.area].count++; }
  });
  const rated = areas.filter(a => a.count);
  rated.forEach(a => { a.avg = Math.round((a.total / a.count) * 10) / 10; });
  const max = Math.max.apply(null, rated.map(a => a.avg));
  const min = Math.min.apply(null, rated.map(a => a.avg));
  return areas.map(a => ({
    area: a.area,
    avg: a.count ? a.avg : null,
    count: a.count,
    reading: !a.count ? '' : (max === min ? 'Steady' : a.avg === max ? 'Strength' : a.avg === min ? 'Focus area' : 'Steady')
  }));
}

/** Saves diagnostic answers. With submit = true, all required questions must be answered. */
function saveDiagnostic(code, answers, submit) {
  checkCode_(code);
  const cfg = getConfig_();
  if (!/^(yes|y|true)$/i.test(String(cfg.DIAGNOSTIC_ENABLED || '').trim())) throw new Error('The diagnostic is not open.');
  answers = answers || {};
  const questions = diagQuestions_();
  const clean = {};
  questions.forEach(q => {
    let v = String(answers[q.id] == null ? '' : answers[q.id]).trim();
    if (q.type === 'rating' && v && !/^[1-5]$/.test(v)) throw new Error('Ratings must be from 1 to 5.');
    clean[q.id] = v;
  });
  if (submit) {
    const missing = questions.filter(q => q.required && !clean[q.id]).length;
    if (missing) throw new Error('Please answer the ' + missing + ' remaining required question' + (missing > 1 ? 's' : '') + ' before submitting.');
  }

  withLock_(() => {
    const now = now_();
    const sh = sheet_(SHEETS.DIAG_A);
    const rows = questions.map(q => [q.id, q.area, q.text, clean_(clean[q.id]), now]);
    writeRows_(sh, rows, HEADERS.DIAG_A.length);
    if (submit) {
      setConfig_('DIAGNOSTIC_SUBMITTED', now);
      const summary = diagSummary_(questions, clean);
      writeRows_(sheet_(SHEETS.DIAG_S), summary.map(a => [a.area, a.avg == null ? '' : a.avg, a.count, a.reading]), HEADERS.DIAG_S.length);
      emailCoach_(cfg, summary, questions, clean);
    }
  });
  return getPortalData(code);
}

/**
 * Coach tool: replaces the questions in the Diagnostic tab with the 30 default
 * priority questions and clears any draft answers. Refuses once the participant
 * has submitted, so submitted answers are never lost.
 */
function loadDiagnosticQuestions() {
  const ss = getSS_(false);
  if (!ss.getSheetByName(SHEETS.DIAG_Q)) {
    notify_('Diagnostic', 'The Diagnostic tab does not exist yet. Run setup first: it creates the tab with the 30 priority questions.');
    return;
  }
  if (String(getConfig_().DIAGNOSTIC_SUBMITTED || '').trim()) {
    notify_('Diagnostic', 'Not changed: the participant has already submitted the diagnostic. Replacing the questions now would disconnect their answers.\n\n' +
      'If you really want a fresh start, clear DIAGNOSTIC_SUBMITTED on the Config tab first, then run this again.');
    return;
  }
  withLock_(() => {
    writeRows_(sheet_(SHEETS.DIAG_Q), DIAG_DEFAULT_QUESTIONS, HEADERS.DIAG_Q.length);
    writeRows_(sheet_(SHEETS.DIAG_A), [], HEADERS.DIAG_A.length);
    writeRows_(sheet_(SHEETS.DIAG_S), [], HEADERS.DIAG_S.length);
  });
  const areas = [];
  DIAG_DEFAULT_QUESTIONS.forEach(q => { if (areas.indexOf(q[1]) === -1) areas.push(q[1]); });
  notify_('Diagnostic', 'Loaded ' + DIAG_DEFAULT_QUESTIONS.length + ' questions across ' + areas.length + ' priorities:\n• ' + areas.join('\n• ') +
    '\n\nAny draft answers were cleared. The participant sees the new questions the next time they open the portal.');
}

/** Replaces all data rows under the header (blanks out leftover rows). */
function writeRows_(sh, rows, width) {
  const old = Math.max(sh.getLastRow() - 1, 0);
  const out = rows.slice();
  while (out.length < old) out.push(new Array(width).fill(''));
  if (out.length) sh.getRange(2, 1, out.length, width).setValues(out);
}

function emailCoach_(cfg, summary, questions, answers) {
  const to = String(cfg.COACH_EMAIL || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return;
  try {
    const name = cfg.PARTICIPANT_NAME || 'Your participant';
    const lines = summary.filter(a => a.avg != null).map(a => '• ' + a.area + ': ' + a.avg + ' / 5' + (a.reading && a.reading !== 'Steady' ? ' (' + a.reading + ')' : ''));
    const text = questions.filter(q => q.type === 'text' && answers[q.id]).map(q => q.text + '\n' + answers[q.id]);
    sendMail_({
      to: to,
      subject: name + ' completed the leadership diagnostic',
      body: name + ' submitted the leadership diagnostic.\n\nArea averages\n' + lines.join('\n') +
        (text.length ? '\n\nIn their words\n\n' + text.join('\n\n') : '') +
        '\n\nFull answers: ' + getSS_(false).getUrl()
    });
  } catch (e) {
    Logger.log('Could not email the coach: ' + e.message);
  }
}

/** Adds missing Config keys from CONFIG_DEFAULTS. Returns the keys added. */
function ensureConfig_(sh) {
  if (!sh) return [];
  const keys = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues().map(r => String(r[0]).trim());
  const added = [];
  CONFIG_DEFAULTS.forEach(([k, v, note]) => {
    if (keys.indexOf(k) === -1) { sh.appendRow([k, v, note]); added.push(k); }
  });
  // Fill in the coach email if it was left blank (or add it if missing)
  const i = keys.indexOf('COACH_EMAIL');
  if (i === -1) { sh.appendRow(['COACH_EMAIL', COACH_EMAIL_DEFAULT, 'Where request, confirmation and diagnostic emails go']); added.push('COACH_EMAIL'); }
  else if (!String(sh.getRange(i + 1, 2).getValues()[0][0] || '').trim()) { sh.getRange(i + 1, 2).setValue(COACH_EMAIL_DEFAULT); added.push('COACH_EMAIL'); }
  return added;
}

function setConfig_(key, value) {
  bumpVer_();
  delete ROWS_[SHEETS.CONFIG];
  const sh = sheet_(SHEETS.CONFIG);
  const keys = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues().map(r => String(r[0]).trim());
  const i = keys.indexOf(key);
  if (i === -1) sh.appendRow([key, value, '']);
  else sh.getRange(i + 1, 2).setValue(value);
}

/** Reads a date from Config whether it was typed as text or picked as a Sheets date. Returns YYYY-MM-DD or ''. */
function configDate_(key) {
  const sh = sheet_(SHEETS.CONFIG);
  const vals = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 2).getValues();
  const row = vals.filter(r => String(r[0]).trim() === key)[0];
  if (!row || row[1] === '' || row[1] == null) return '';
  const v = row[1];
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, 'Asia/Manila', 'yyyy-MM-dd');
  const s = String(v).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s); // M/D/YYYY
  if (m) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
  return '';
}

function setChallenge(code, moduleNum, done, note) {
  checkCode_(code);
  const mod = String(moduleNum || '').trim();
  const released = rows_(SHEETS.MODULES).some(r => String(r['Module']).trim() === mod && /^(yes|y|true)$/i.test(String(r['Released']).trim()));
  if (!released) throw new Error('This challenge is not open yet.');
  markChallenge_(mod, done, note);
  if (done) autoOpenNext_();
  return getPortalData(code);
}

/** Writes one module's challenge row (adds the row if it is missing). */
function markChallenge_(mod, done, note) {
  withLock_(() => {
    delete ROWS_[SHEETS.CHALLENGES];
    const sh = sheet_(SHEETS.CHALLENGES);
    const last = sh.getLastRow();
    const mods = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim()) : [];
    let row = mods.indexOf(mod) + 2;
    if (row < 2) { sh.appendRow([mod, 'No', '', '', '']); row = sh.getLastRow(); }
    sh.getRange(row, 2, 1, 3).setValues([[done ? 'Yes' : 'No', done ? now_() : '', clean_(note)]]);
  });
}

/** Adds or updates a Goal or Action Plan item. Coach Notes are never overwritten. */
function saveItem(code, kind, item) {
  checkCode_(code);
  const def = ITEM_KINDS[kind];
  if (!def) throw new Error('Unknown item type.');
  item = item || {};
  if (!String(item[def.required] || '').trim()) throw new Error(def.requiredMsg || 'Please fill in the required field.');
  (def.dates || []).forEach(k => {
    const v = String(item[k] == null ? '' : item[k]).trim();
    if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error('Please pick a valid target date.');
    item[k] = v;
  });

  def.ratings.forEach(k => {
    const v = String(item[k] == null ? '' : item[k]).trim();
    if (v && !/^(10|[1-9])$/.test(v)) throw new Error('Ratings must be a number from 1 to 10.');
    item[k] = v;
  });
  if (kind === 'plan' && PLAN_STATUSES.indexOf(item.status) === -1) item.status = PLAN_STATUSES[0];

  withLock_(() => {
    const sh = sheet_(def.sheet);
    ensureColumns_(sh, HEADERS[kind === 'goal' ? 'GOALS' : 'PLAN']); // works even if setup was not re-run
    if (kind === 'goal') textColumn_(sh, 'Target Date');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
    const col = name => {
      const i = headers.indexOf(name);
      if (i === -1) throw new Error('The "' + def.sheet + '" tab is missing the column "' + name + '".');
      return i;
    };
    const now = now_();

    if (item.id) {
      const row = findRow_(sh, item.id);
      const values = sh.getRange(row, 1, 1, headers.length).getValues()[0];
      def.fields.forEach(([key, header]) => {
        const i = col(header);
        if (def.lockOnceSet.indexOf(key) !== -1 && String(values[i]).trim() !== '') return; // keep locked value
        values[i] = clean_(item[key]);
      });
      values[col('Updated')] = now;
      sh.getRange(row, 1, 1, headers.length).setValues([values]);
    } else {
      const count = Math.max(sh.getLastRow() - 1, 0);
      if (count >= def.max) throw new Error('You can have up to ' + def.max + '. Edit an existing one instead.');
      const values = headers.map(() => '');
      values[col('ID')] = Utilities.getUuid();
      values[col('Created')] = now;
      values[col('Updated')] = now;
      def.fields.forEach(([key, header]) => { values[col(header)] = clean_(item[key]); });
      sh.appendRow(values);
    }
  });
  return getPortalData(code);
}

function deleteItem(code, kind, id) {
  checkCode_(code);
  const def = ITEM_KINDS[kind];
  if (!def) throw new Error('Unknown item type.');
  withLock_(() => {
    const sh = sheet_(def.sheet);
    sh.deleteRow(findRow_(sh, id));
  });
  return getPortalData(code);
}

/* ---------------- Agreed Goal (the official goal, set by the coach) ---------------- */

/** One row per part. Text is written as the participant ("I"). Measurable: one item per line. */
const AGREED_GOAL_DEFAULT = [
  // [REDACTED] The original defaults held one participant's personal goal (employer, team and targets).
  ['Specific', '[REDACTED]', ''],
  ['Measurable', '[REDACTED]', 'One item per line'],
  ['Measured by', 'Tracked weekly in my Tracker (Growth > Tracker).', 'Short note shown under Measurable'],
  ['Achievable', '[REDACTED]', ''],
  ['Relevant', '[REDACTED]', ''],
  ['Time-bound', '[REDACTED]', ''],
  ['Target Date', '[REDACTED]', 'YYYY-MM-DD, used for the countdown'],
  ['Agreed On', '', 'Date you agreed it with the participant (optional)']
];
const AGREED_PARTS = { 'Specific': 'specific', 'Measurable': 'measurable', 'Measured by': 'measuredBy', 'Achievable': 'achievable', 'Relevant': 'relevant', 'Time-bound': 'timebound', 'Target Date': 'target', 'Agreed On': 'agreedOn' };

function ensureAgreedGoal_() {
  const ss = getSS_(false);
  if (ss.getSheetByName(SHEETS.AGREED)) return [];
  const sh = seedSheet_(ss, SHEETS.AGREED, HEADERS.AGREED, AGREED_GOAL_DEFAULT);
  sh.getRange(2, 2, AGREED_GOAL_DEFAULT.length, 1).setNumberFormat('@');
  sh.getRange(1, 2).setNote('Edit the text here or from the coach dashboard (Goals & plan). It shows in the participant\'s Goals tab when the Tracker is switched on.');
  return [SHEETS.AGREED];
}

/** The agreed goal. The participant sees it only when the Tracker is switched on. */
function readAgreedGoal_(cfg, all) {
  const visible = yes_(cfg.TRACKER_ENABLED);
  if (!visible && !all) return { visible: false };
  const g = { visible: visible };
  Object.keys(AGREED_PARTS).forEach(k => { g[AGREED_PARTS[k]] = ''; });
  rows_(SHEETS.AGREED).forEach(r => {
    const k = AGREED_PARTS[String(r['Part']).trim()];
    if (k) g[k] = String(r['Text'] == null ? '' : r['Text']).trim();
  });
  g.measurableItems = lines_(g.measurable);
  return g;
}

/** Coach: saves the agreed goal (any of its parts). */
function coachSaveAgreedGoal(key, goal) {
  checkCoach_(key);
  goal = goal || {};
  if (goal.target && !/^\d{4}-\d{2}-\d{2}$/.test(String(goal.target).trim())) throw new Error('Target date must look like 2026-12-04.');
  if (goal.agreedOn && !/^\d{4}-\d{2}-\d{2}$/.test(String(goal.agreedOn).trim())) throw new Error('Agreed on must look like 2026-11-18.');
  withLock_(() => {
    ensureAgreedGoal_();
    const sh = sheet_(SHEETS.AGREED);
    const last = sh.getLastRow();
    const parts = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim()) : [];
    Object.keys(AGREED_PARTS).forEach(label => {
      const k = AGREED_PARTS[label];
      if (goal[k] === undefined) return;
      const v = String(goal[k] == null ? '' : goal[k]).replace(/\r\n?/g, '\n').trim().slice(0, MAX_TEXT);
      const i = parts.indexOf(label);
      if (i === -1) { sh.appendRow([label, v, '']); parts.push(label); sh.getRange(sh.getLastRow(), 2).setNumberFormat('@'); }
      else sh.getRange(i + 2, 2).setNumberFormat('@').setValue(v);
    });
    delete ROWS_[SHEETS.AGREED];
  });
  return coachData(key);
}

/* ---------------- Tracker: weekly scorecard and request log ---------------- */

/** The weekly activities, from the integrated goal. Edit them in the Tracker Activities tab. */
const TRACKER_ACTIVITIES_DEFAULT = [
  ['1', 'Delegated: every new request had an owner and a clear brief', 'Ownership, 30-day plan', 'Every request had an owner, the result and a check-in date', 'Yes'],
  ['2', 'Let go: I coached instead of taking work back', 'Doing to directing', 'I did not take back or redo work that could be coached', 'Yes'],
  ['3', 'Built the team: 1:1s, feedback, and progress on structure or skills', 'Structure, capability', 'Every designer had a 1:1 and one step forward', 'Yes'],
  ['4', 'Protected priorities: I said "not now" when a request did not fit', 'Priorities', 'No low-priority request pushed aside a top-3 priority', 'Yes']
];
// The first version had 8 activities. If no week has been rated yet, the tab is switched to the 4 above.
const TRACKER_ACTIVITIES_V1_FIRST = 'Logged every new request in my LEAD™ tracker, with an owner';
const TRACKER_SCALE = ['Didn\'t do it', 'Started', 'About half', 'Most of the time', 'Fully'];
const REQUEST_STATUSES = ['Open', 'In progress', 'Done'];
const REQUEST_FEEDBACK = ['', 'Exceeded', 'Met', 'Partly met', 'Not met'];
const DELEGATION_LEVELS = ['Follow my steps', 'Explore and report', 'Recommend', 'Decide and inform', 'Own it'];
const REQUESTS_MAX = 400;

function ensureTracker_() {
  const ss = getSS_(false);
  const created = [];
  if (!ss.getSheetByName(SHEETS.TRACK_ACT)) {
    const sh = seedSheet_(ss, SHEETS.TRACK_ACT, HEADERS.TRACK_ACT, TRACKER_ACTIVITIES_DEFAULT);
    sh.getRange(1, 2).setNote('One weekly activity per row. The participant rates each from 1 (didn\'t do it) to 5 (fully) every Friday.');
    sh.getRange(1, 5).setNote('Yes shows the activity. No hides it (past ratings are kept).');
    created.push(SHEETS.TRACK_ACT);
  } else {
    // Switch an unused first-version tab (8 activities) to the simpler 4
    const sh = ss.getSheetByName(SHEETS.TRACK_ACT), wk = ss.getSheetByName(SHEETS.TRACK_WEEK);
    const unused = !wk || wk.getLastRow() < 2;
    if (unused && sh.getLastRow() === 9 && String(sh.getRange(2, 2).getValues()[0][0]).trim() === TRACKER_ACTIVITIES_V1_FIRST) {
      sh.getRange(2, 1, 8, HEADERS.TRACK_ACT.length).clearContent();
      sh.getRange(2, 1, TRACKER_ACTIVITIES_DEFAULT.length, HEADERS.TRACK_ACT.length).setValues(TRACKER_ACTIVITIES_DEFAULT);
      delete ROWS_[SHEETS.TRACK_ACT];
    }
  }
  if (!ss.getSheetByName(SHEETS.TRACK_WEEK)) {
    const sh = seedSheet_(ss, SHEETS.TRACK_WEEK, HEADERS.TRACK_WEEK, [], { textColumn: 1 });
    sh.getRange(1, 3).setNote('Used by the portal. Do not edit.');
    created.push(SHEETS.TRACK_WEEK);
  }
  if (!ss.getSheetByName(SHEETS.REQUESTS)) {
    const sh = seedSheet_(ss, SHEETS.REQUESTS, HEADERS.REQUESTS, []);
    textColumn_(sh, 'Check-in Date');
    created.push(SHEETS.REQUESTS);
  }
  // First time only: add the tracker settings to Config
  if (created.length) ensureConfig_(ss.getSheetByName(SHEETS.CONFIG));
  return created.concat(ensureAgreedGoal_());
}

/** YYYY-MM-DD in Manila for a Date. */
function manilaISO_(d) { return Utilities.formatDate(d, 'Asia/Manila', 'yyyy-MM-dd'); }
function isoAddDays_(iso, n) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]) + n * 86400000);
  return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
}
/** The Friday that ends the week (Saturday to Friday) containing this date. */
function weekEnding_(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return '';
  const dow = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay(); // 0 Sun .. 6 Sat
  return isoAddDays_(m[1] + '-' + m[2] + '-' + m[3], (5 - dow + 7) % 7);
}

function readTracker_(cfg, all) {
  const enabled = yes_(cfg.TRACKER_ENABLED);
  if (!enabled && !all) return { enabled: false };
  const activities = rows_(SHEETS.TRACK_ACT)
    .filter(r => String(r['Activity'] || '').trim() && !/^(no|n|false)$/i.test(String(r['Active']).trim()))
    .map(r => ({ n: String(r['#']).trim(), text: String(r['Activity']).trim(), goal: String(r['From Goal'] || '').trim(), five: String(r['What a 5 Looks Like'] || '').trim() }));

  const requests = rows_(SHEETS.REQUESTS).map(r => ({
    id: r['ID'], created: r['Created'], updated: r['Updated'], request: r['Request'], by: r['Requested By'],
    owner: r['Owner'], level: String(r['Level (1-5)'] || '').trim(), agreement: yes_(r['Agreement']),
    checkin: r['Check-in Date'], status: r['Status'] || 'Open', takenBack: yes_(r['Taken Back']),
    feedback: r['Owner Feedback'] || '', notes: r['Notes'] || ''
  }));

  // Requests and take-backs per week, counted from the log (by the date each request was logged)
  const counts = {};
  requests.forEach(q => {
    const w = weekEnding_(q.created);
    if (!w) return;
    counts[w] = counts[w] || { requests: 0, takenBack: 0 };
    counts[w].requests++;
    if (q.takenBack) counts[w].takenBack++;
  });

  const weeks = rows_(SHEETS.TRACK_WEEK).map(r => {
    let ratings = {};
    try { ratings = JSON.parse(r['Ratings'] || '{}') || {}; } catch (e) { ratings = {}; }
    const w = String(r['Week Ending']).trim();
    const c = counts[w];
    return {
      week: w, updated: r['Updated'], ratings: ratings,
      total: Number(r['Total']) || 0, max: Number(r['Max']) || activities.length * 5,
      overall: String(r['Overall (1-10)'] || '').trim(),
      requests: c ? c.requests : (r['Requests'] === '' ? null : Number(r['Requests'])),
      takenBack: c ? c.takenBack : (r['Taken Back'] === '' ? null : Number(r['Taken Back'])),
      helped: r['What Helped'] || '', blocked: r['What Got in the Way'] || '', adjust: r['Adjustment'] || '',
      note: r['Note'] || '', coachNotes: r['Coach Notes'] || '',
      did: (function () { try { return JSON.parse(r['What I Did Data'] || '{}') || {}; } catch (e) { return {}; } })(),
      blockers: (function () { try { return JSON.parse(r['Blockers'] || '{}') || {}; } catch (e) { return {}; } })()
    };
  }).filter(w => /^\d{4}-\d{2}-\d{2}$/.test(w.week)).sort((a, b) => a.week < b.week ? -1 : 1);

  const today = manilaISO_(new Date());
  const current = weekEnding_(today);
  const start = weekEnding_(configDate_('TRACKER_START') || today);
  // Weeks he can rate: from the start week to this week (newest first), plus any week already saved
  const choices = [];
  for (let w = current; w >= start && choices.length < 26; w = isoAddDays_(w, -7)) choices.push(w);
  weeks.forEach(x => { if (choices.indexOf(x.week) === -1) choices.push(x.week); });
  choices.sort().reverse();

  return {
    enabled: enabled, activities: activities, scale: TRACKER_SCALE, weeks: weeks,
    currentWeek: current, weekChoices: choices, counts: counts,
    requests: requests.reverse(), statuses: REQUEST_STATUSES, feedbackOptions: REQUEST_FEEDBACK.slice(1), levels: DELEGATION_LEVELS
  };
}

function trackerOn_() {
  if (!yes_(getConfig_().TRACKER_ENABLED)) throw new Error('The tracker is not open yet.');
}

/** Saves one week's scorecard (adds the week or updates it). Coach Notes are never overwritten. */
function saveTrackerWeek(code, wk) {
  checkCode_(code);
  trackerOn_();
  wk = wk || {};
  const week = String(wk.week || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || weekEnding_(week) !== week) throw new Error('Please choose a week.');
  if (week > weekEnding_(manilaISO_(new Date()))) throw new Error('You can only rate this week or an earlier one.');
  const acts = readTracker_(getConfig_(), true).activities;
  const ratings = {};
  let total = 0;
  acts.forEach(a => {
    const v = String((wk.ratings || {})[a.n] == null ? '' : wk.ratings[a.n]).trim();
    if (v && !/^[1-5]$/.test(v)) throw new Error('Ratings must be from 1 to 5.');
    if (v) { ratings[a.n] = Number(v); total += Number(v); }
  });
  const overall = String(wk.overall == null ? '' : wk.overall).trim();
  if (overall && !/^(10|[1-9])$/.test(overall)) throw new Error('The overall rating must be from 1 to 10.');
  if (!Object.keys(ratings).length && !overall) throw new Error('Please rate at least one activity before saving.');
  const tbIn = String(wk.takenBack == null ? '' : wk.takenBack).trim();
  if (tbIn && !/^\d{1,2}$/.test(tbIn)) throw new Error('Please enter how many requests you took back (a number).');

  // "What I did": one answer per open module challenge. Answering here marks that challenge as done.
  const openMods = rows_(SHEETS.MODULES).filter(r => yes_(r['Released']) && String(r['Weekly Challenge'] || '').trim()).map(r => String(r['Module']).trim());
  const did = {};
  openMods.forEach(k => { const t = String((wk.did || {})[k] == null ? '' : wk.did[k]).trim().slice(0, MAX_TEXT); if (t) did[k] = t; });
  const didText = Object.keys(did).map(k => 'Module ' + k + ': ' + did[k]).join('\n\n');

  const tr = readTracker_(getConfig_(), true);
  const c = tr.counts[week] || { requests: 0, takenBack: 0 };
  withLock_(() => {
    const sh = sheet_(SHEETS.TRACK_WEEK);
    ensureColumns_(sh, HEADERS.TRACK_WEEK);
    const H = headerIndex_(sh);
    const last = sh.getLastRow();
    const weeks = last >= 2 ? sh.getRange(2, H['Week Ending'] + 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim()) : [];
    const idx = weeks.indexOf(week);
    const width = sh.getLastColumn();
    const values = idx === -1 ? new Array(width).fill('') : sh.getRange(idx + 2, 1, 1, width).getValues()[0];
    const set = (h, v) => { values[H[h]] = v; };
    set('Week Ending', week); set('Updated', now_()); set('Ratings', JSON.stringify(ratings));
    set('Total', total); set('Max', acts.length * 5); set('Overall (1-10)', overall);
    // From the request log when he uses it; otherwise the number he entered
    const fromLog = c.requests > 0;
    set('Requests', fromLog ? c.requests : ''); set('Taken Back', fromLog ? c.takenBack : tbIn);
    if (wk.helped !== undefined) set('What Helped', clean_(wk.helped));
    if (wk.blocked !== undefined) set('What Got in the Way', clean_(wk.blocked));
    if (wk.adjust !== undefined) set('Adjustment', clean_(wk.adjust));
    set('Note', clean_(wk.note));
    const bl = {};
    acts.forEach(a => { const t = clean_((wk.blockers || {})[a.n]); if (t && ratings[a.n] && ratings[a.n] <= 3) bl[a.n] = t.slice(0, 500); });
    set('Blockers', JSON.stringify(bl));
    if (wk.did !== undefined) { set('What I Did', clean_(didText)); set('What I Did Data', JSON.stringify(did)); }
    if (idx === -1) {
      sh.getRange(last + 1, H['Week Ending'] + 1).setNumberFormat('@');
      sh.getRange(last + 1, 1, 1, width).setValues([values]);
    } else sh.getRange(idx + 2, 1, 1, width).setValues([values]);
  });
  // Mark each answered challenge as done (a challenge already done keeps its first answer)
  const doneAlready = {};
  delete ROWS_[SHEETS.CHALLENGES];
  rows_(SHEETS.CHALLENGES).forEach(r => { if (/^(yes|y|true|done)$/i.test(String(r['Done']).trim())) doneAlready[String(r['Module']).trim()] = true; });
  let marked = 0;
  Object.keys(did).forEach(k => { if (!doneAlready[k]) { markChallenge_(k, true, did[k]); marked++; } });
  if (marked) autoOpenNext_();
  return getPortalData(code);
}

/** Adds or updates one request in the request log. */
function saveRequest(code, q) {
  checkCode_(code);
  trackerOn_();
  q = q || {};
  if (!String(q.request || '').trim()) throw new Error('Please describe the request.');
  const level = String(q.level == null ? '' : q.level).trim();
  if (level && !/^[1-5]$/.test(level)) throw new Error('Please choose a delegation level from 1 to 5.');
  const checkin = String(q.checkin || '').trim();
  if (checkin && !/^\d{4}-\d{2}-\d{2}$/.test(checkin)) throw new Error('Please pick a valid check-in date.');
  const status = REQUEST_STATUSES.indexOf(q.status) === -1 ? 'Open' : q.status;
  const feedback = REQUEST_FEEDBACK.indexOf(q.feedback || '') === -1 ? '' : (q.feedback || '');
  withLock_(() => {
    const sh = sheet_(SHEETS.REQUESTS);
    ensureColumns_(sh, HEADERS.REQUESTS);
    const H = headerIndex_(sh);
    const width = sh.getLastColumn();
    const now = now_();
    let row, values;
    if (q.id) {
      row = findRow_(sh, q.id);
      values = sh.getRange(row, 1, 1, width).getValues()[0];
    } else {
      if (Math.max(sh.getLastRow() - 1, 0) >= REQUESTS_MAX) throw new Error('The request log is full. Ask your coach to archive older requests.');
      row = sh.getLastRow() + 1;
      values = new Array(width).fill('');
      values[H['ID']] = Utilities.getUuid();
      values[H['Created']] = now;
    }
    const set = (h, v) => { values[H[h]] = v; };
    set('Updated', now); set('Request', clean_(q.request)); set('Requested By', clean_(q.by)); set('Owner', clean_(q.owner));
    set('Level (1-5)', level); set('Agreement', q.agreement ? 'Yes' : 'No'); set('Check-in Date', checkin);
    set('Status', status); set('Taken Back', q.takenBack ? 'Yes' : 'No'); set('Owner Feedback', feedback); set('Notes', clean_(q.notes));
    sh.getRange(row, H['Check-in Date'] + 1).setNumberFormat('@');
    sh.getRange(row, 1, 1, width).setValues([values]);
  });
  return getPortalData(code);
}

function deleteRequest(code, id) {
  checkCode_(code);
  trackerOn_();
  withLock_(() => { const sh = sheet_(SHEETS.REQUESTS); sh.deleteRow(findRow_(sh, id)); });
  return getPortalData(code);
}

/** Coach: shows or hides the Tracker tab in the participant's portal. */
function coachSetTracker(key, on) {
  checkCoach_(key);
  withLock_(() => { ensureTracker_(); setConfig_('TRACKER_ENABLED', on ? 'Yes' : 'No'); });
  return coachData(key);
}

/**
 * Wix custom element <ema-portal>: shows the portal in a frame that fills the browser window
 * under the site header, so the participant scrolls one area instead of a small box inside the page.
 * In the Wix editor: Add > Embed Code > Custom element > Server URL = <web app URL>?ce=1, Tag name = ema-portal.
 * Optional attribute src = another portal URL.
 */
const CUSTOM_ELEMENT_JS_ = String.raw`(function () {
  if (window.customElements.get('ema-portal')) return;
  var DEFAULT_SRC = '__SRC__';
  function headerHeight() {
    var h = document.querySelector('header');
    return h ? Math.round(h.getBoundingClientRect().height) : 0;
  }
  class EmaPortal extends HTMLElement {
    connectedCallback() {
      if (this._frame) return;
      var self = this;
      this.style.display = 'block';
      this.style.width = '100%';
      var f = document.createElement('iframe');
      f.src = this.getAttribute('src') || DEFAULT_SRC;
      f.title = this.getAttribute('title') || 'Participant portal';
      f.setAttribute('allow', 'clipboard-write; fullscreen');
      f.style.cssText = 'display:block;width:100%;height:100%;border:0;margin:0;';
      this.appendChild(f);
      this._frame = f;
      this._fit = function () {
        var h = Math.max(480, window.innerHeight - headerHeight());
        self.style.height = h + 'px';
        var p = self.parentElement;
        // Let the Wix wrapper grow with the element
        for (var i = 0; i < 3 && p; i++) { if (p.style) p.style.minHeight = h + 'px'; p = p.parentElement; }
      };
      this._fit();
      window.addEventListener('resize', this._fit);
      setTimeout(this._fit, 800);
      // One scroll only: the portal scrolls, the page around it stays put (not inside the Wix editor)
      if (!/(^|\.)wix\.com$/.test(window.location.hostname)) {
        this._lock = [document.documentElement, document.body];
        this._lock.forEach(function (el) { el.style.overflow = 'hidden'; });
        window.scrollTo(0, 0);
      }
    }
    disconnectedCallback() {
      if (this._fit) window.removeEventListener('resize', this._fit);
      if (this._lock) this._lock.forEach(function (el) { el.style.overflow = ''; });
    }
  }
  window.customElements.define('ema-portal', EmaPortal);
})();`;

/* ---------------- Helpers ---------------- */

function readItems_(kind) {
  const def = ITEM_KINDS[kind];
  return rows_(def.sheet).map(r => {
    const o = { id: r['ID'], created: r['Created'], updated: r['Updated'], coachNotes: r['Coach Notes'] };
    def.fields.forEach(([key, header]) => {
      o[key] = r[header] !== undefined ? r[header] : (r[LEGACY_COLUMNS[header]] !== undefined ? r[LEGACY_COLUMNS[header]] : '');
    });
    return o;
  });
}

/**
 * Makes sure a tab has every expected column. Renames columns from the earlier
 * version (so existing goals carry over) and adds any missing ones at the end.
 * Returns true if anything changed.
 */
function ensureColumns_(sh, expected) {
  if (!sh) return false;
  const RENAMED = LEGACY_COLUMNS;
  const width = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1, 1, 1, width).getValues()[0].map(h => String(h).trim());
  let changed = false;
  expected.forEach(name => {
    if (headers.indexOf(name) !== -1) return;
    const old = RENAMED[name] ? headers.indexOf(RENAMED[name]) : -1;
    if (old !== -1) {
      sh.getRange(1, old + 1).setValue(name);
      headers[old] = name;
    } else {
      headers.push(name);
      sh.getRange(1, headers.length).setValue(name)
        .setFontWeight('bold').setBackground('#2F2B7F').setFontColor('#FFFFFF');
    }
    changed = true;
  });
  return changed;
}

/** Keeps a column as plain text so dates like 2026-12-15 are never reformatted. */
function textColumn_(sh, name) {
  if (!sh) return;
  const headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  const i = headers.indexOf(name);
  if (i !== -1) sh.getRange(2, i + 1, 500, 1).setNumberFormat('@');
}

function findRow_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) throw new Error('Entry not found. Please refresh the page.');
  const ids = sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(r => r[0]);
  const idx = ids.indexOf(String(id));
  if (idx === -1) throw new Error('Entry not found. Please refresh the page.');
  return idx + 2;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { bumpVer_(); lock.releaseLock(); }
}

/* ---------------- Speed: short-lived cache of what the pages load ---------------- */
// Every save goes through withLock_, which marks the data as changed, so the next load is always fresh.
// Edits typed straight into the Sheet show within a few minutes (or at once with the dashboard's Refresh).
function dataVer_() { try { return CacheService.getScriptCache().get('dataVer') || '0'; } catch (e) { return 'x'; } }
function bumpVer_() { try { CacheService.getScriptCache().put('dataVer', String(Date.now()) + Math.random().toString(36).slice(2, 6), 21600); } catch (e) { /* ignore */ } }
function cached_(name, seconds, force, build) {
  const cache = CacheService.getScriptCache();
  const k = name + ':' + dataVer_();
  if (!force) {
    try { const hit = cache.get(k); if (hit) return JSON.parse(hit); } catch (e) { /* rebuild */ }
  }
  const data = build();
  try { const json = JSON.stringify(data); if (json.length < 95000) cache.put(k, json, seconds); } catch (e) { /* too big to cache */ }
  return data;
}

function now_() {
  return Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd HH:mm');
}

/**
 * Reads the Slides Link column so it works however the link was pasted:
 * as plain text, as a Google Drive/Slides chip that shows the file title,
 * as linked text, or as a =HYPERLINK() formula. Returns { moduleNumber: url }.
 */
function slideLinks_() {
  const out = {};
  const sh = sheet_(SHEETS.MODULES);
  const last = sh.getLastRow();
  if (last < 2) return out;
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const c = headers.indexOf('Slides Link'), m = headers.indexOf('Module');
  if (c === -1 || m === -1) return out;
  const n = last - 1;
  const cell = sh.getRange(2, c + 1, n, 1);
  const mods = sh.getRange(2, m + 1, n, 1).getDisplayValues();
  const shown = cell.getDisplayValues();
  let rich = [], formulas = [];
  try { rich = cell.getRichTextValues(); } catch (e) { /* not available: fall back to text */ }
  try { formulas = cell.getFormulas(); } catch (e) { /* ignore */ }
  for (let i = 0; i < n; i++) {
    const candidates = [];
    const r = rich[i] && rich[i][0];
    if (r) {
      try {
        candidates.push(r.getLinkUrl());
        (r.getRuns() || []).forEach(run => candidates.push(run.getLinkUrl()));
      } catch (e) { /* ignore */ }
    }
    const f = formulas[i] && formulas[i][0];
    const hm = f && /HYPERLINK\(\s*"([^"]+)"/i.exec(f);
    if (hm) candidates.push(hm[1]);
    candidates.push(shown[i][0]);
    const url = candidates.map(normUrl_).filter(Boolean)[0] || '';
    out[String(mods[i][0]).trim()] = url;
  }
  return out;
}

/** Cleans a link: adds https:// when it was left out; returns '' for anything that is not a web link. */
function normUrl_(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u) && /^(docs\.google\.com|drive\.google\.com|www\.|[\w-]+(\.[\w-]+)+\/)/i.test(u)) u = 'https://' + u;
  u = u.replace(/^http:\/\//i, 'https://');
  return /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : '';
}

/** Coach tool: shows what the portal reads from each module's Slides Link cell. */
function checkSlides() {
  const links = slideLinks_();
  const rows = rows_(SHEETS.MODULES);
  const report = rows.map(r => {
    const num = String(r['Module']).trim();
    const released = /^(yes|y|true)$/i.test(String(r['Released']).trim());
    const url = links[num];
    const cellText = String(r['Slides Link'] || '').trim();
    let status;
    if (url) status = 'OK: ' + url;
    else if (cellText) status = 'NOT READ. The cell shows "' + cellText + '". Paste the full link as plain text (Ctrl+Shift+V).';
    else status = 'No link yet.';
    return 'Module ' + num + (released ? '' : ' (not released, so hidden from the participant)') + ': ' + status;
  });
  if (!rows.length) report.push('The Modules tab has no rows.');
  if (rows.length && !('Slides Link' in rows[0])) report.unshift('The Modules tab has no "Slides Link" column. Run setup to add it.');
  notify_('Slides links', report.join('\n'));
}

function lines_(s) {
  return String(s || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

function clean_(s) {
  let t = String(s == null ? '' : s).slice(0, MAX_TEXT);
  if (/^[=+\-@]/.test(t)) t = "'" + t; // prevent spreadsheet formula injection
  return t;
}

/** Coach tool: run this if a calendar or email feature says it does not have permission. Google then asks for anything missing. */
function authorize() {
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  notify_('Permissions', 'All permissions are granted. Calendar checks, holds, invites and emails can now work.');
}

/* ---------------- Assessment ---------------- */

/** Creates the assessment tabs the first time they are needed (safe to call on every load). Returns the tabs created. */
function ensureAssessment_() {
  const ss = getSS_(false);
  const created = [];
  if (!ss.getSheetByName(SHEETS.CASES)) {
    const rows = [];
    CASE_MODULES.forEach(m => {
      rows.push([String(m), '1', CASE_TYPES.coach, '', '', CASE_QUESTIONS_DEFAULT, '', 'No', '', '', '', '', '']);
      rows.push([String(m), '2', CASE_TYPES.own, 'My own case', CASE_OWN_PROMPT, CASE_QUESTIONS_OWN, '', 'No', '', '', '', '', '']);
    });
    const sh = seedSheet_(ss, SHEETS.CASES, HEADERS.CASES, rows);
    sh.getRange(1, 3).setNote('Coach case, Hypothetical, or My own case');
    sh.getRange(1, 5).setNote('The case scenario. For My own case, a short instruction: the participant describes their own situation.');
    sh.getRange(1, 6).setNote('One question per line');
    sh.getRange(1, 7).setNote('Optional link to a document, slides or video for this case');
    sh.getRange(1, 8).setNote('Yes shows the case to the participant');
    sh.getRange(1, 13).setNote('Used by the portal. Do not edit.');
    created.push(SHEETS.CASES);
  }
  if (!ss.getSheetByName(SHEETS.FINAL_A)) { seedSheet_(ss, SHEETS.FINAL_A, HEADERS.FINAL_A, []); created.push(SHEETS.FINAL_A); }
  if (!ss.getSheetByName(SHEETS.FINAL_R)) {
    seedSheet_(ss, SHEETS.FINAL_R, HEADERS.FINAL_R, FINAL_REFLECTION_DEFAULT.map(r => [r[0], r[1], '', '', '']));
    created.push(SHEETS.FINAL_R);
  }
  if (!ss.getSheetByName(SHEETS.FINAL_S)) { seedSheet_(ss, SHEETS.FINAL_S, HEADERS.FINAL_S, []); created.push(SHEETS.FINAL_S); }
  if (!ss.getSheetByName(SHEETS.JOURNEY)) {
    const sh = seedSheet_(ss, SHEETS.JOURNEY, HEADERS.JOURNEY, JOURNEY_DEFAULT);
    sh.getRange(1, 3).setNote('Diagnostic, Kickoff, Module, Coaching or Review');
    sh.getRange(1, 4).setNote('Optional: the session ID from the Sessions tab. Its date shows, and the item is ticked when that session is Done.');
    sh.getRange(1, 5).setNote('Yes ticks this item as done (for items without a session)');
    created.push(SHEETS.JOURNEY);
  }
  if (created.length) {
    const added = ensureConfig_(ss.getSheetByName(SHEETS.CONFIG));
    if (added.length) delete ROWS_[SHEETS.CONFIG];
  }
  return created;
}

function yes_(v) { return /^(yes|y|true)$/i.test(String(v == null ? '' : v).trim()); }

function caseType_(v) {
  const t = String(v || '').toLowerCase();
  if (/own|my |actual|real|personal/.test(t)) return 'own';
  if (/hypo|scenario|what if/.test(t)) return 'hypothetical';
  return 'coach';
}

function readCases_(cfg, all) {
  if (!all && !yes_(cfg.CASES_ENABLED || 'Yes')) return { enabled: false, items: [] };
  const items = rows_(SHEETS.CASES).map(r => {
    const type = caseType_(r['Type']);
    const released = yes_(r['Released']);
    const base = {
      module: String(r['Module']).trim(), num: String(r['Case']).trim(), type: type,
      typeLabel: CASE_TYPES[type], title: String(r['Title'] || '').trim(), released: released
    };
    if (!released && !all) return base;
    let data = {};
    try { data = JSON.parse(r['Response Data'] || '{}') || {}; } catch (e) { data = {}; }
    const level = String(r['Level'] || '').trim(), sent = String(r['Grade Sent On'] || '').trim();
    const qs = lines_(r['Questions']);
    return Object.assign(base, {
      scenario: String(r['Scenario'] || '').trim(),
      questions: qs.length ? qs : lines_(type === 'own' ? CASE_QUESTIONS_OWN : CASE_QUESTIONS_DEFAULT),
      link: normUrl_(r['Link']),
      status: /^submitted$/i.test(String(r['Status']).trim()) ? 'Submitted' : (data.answers || data.file ? 'Draft' : ''),
      // The participant only sees the file name; the Drive link is for the coach
      file: data.file && data.file.name ? Object.assign({ name: String(data.file.name), uploadedOn: String(data.file.uploadedOn || '') }, all ? { url: String(data.file.url || '') } : {}) : null,
      submittedOn: r['Submitted On'] || '',
      // A grade (level + feedback) is shown to the participant only after it has been sent (see releaseDueGrades).
      // Plain feedback saved without a level (the older way) is shown straight away.
      feedback: all || !level || sent ? (r['Coach Feedback'] || '') : '',
      level: all || sent ? level : '',
      gradedOn: all ? String(r['Graded On'] || '') : '',
      gradeSentOn: sent,
      gradeDue: all && level && !sent ? gradeDue_(r['Submitted On']) : '',
      myTitle: String(data.title || ''),
      answers: Array.isArray(data.answers) ? data.answers : []
    });
  }).filter(c => c.module && c.num);
  return { enabled: true, items: items };
}

/** Saves a case response. With submit = true, every question needs an answer. */
function saveCase(code, moduleNum, caseNum, payload, submit) {
  checkCode_(code);
  const cfg = getConfig_();
  payload = payload || {};
  const mod = String(moduleNum || '').trim(), num = String(caseNum || '').trim();
  const c = readCases_(cfg).items.filter(x => x.module === mod && x.num === num)[0];
  if (!c || !c.released) throw new Error('This case is not open yet.');
  const answers = c.questions.map((q, i) => String((payload.answers || [])[i] == null ? '' : payload.answers[i]).slice(0, MAX_TEXT));
  const myTitle = String(payload.title || '').trim().slice(0, 200);
  if (submit) {
    const missing = answers.filter(a => !a.trim()).length;
    if (missing && !c.file) throw new Error('Please answer the ' + missing + ' remaining question' + (missing > 1 ? 's' : '') + ' before submitting, or upload your case study as a file.');
    if (c.type === 'own' && !myTitle) throw new Error('Please give your case a short title.');
  }
  let readable = '', fileUrl = '';
  let firstSubmit = false;
  withLock_(() => {
    const sh = sheet_(SHEETS.CASES);
    const H = headerIndex_(sh);
    const last = sh.getLastRow();
    const vals = sh.getRange(2, 1, Math.max(last - 1, 1), sh.getLastColumn()).getDisplayValues();
    const idx = vals.findIndex(r => String(r[H['Module']]).trim() === mod && String(r[H['Case']]).trim() === num);
    if (idx === -1) throw new Error('Case not found. Please refresh the page.');
    const row = idx + 2;
    const wasSubmitted = /^submitted$/i.test(String(vals[idx][H['Status']]).trim());
    firstSubmit = submit && !wasSubmitted;
    const set = (name, v) => sh.getRange(row, H[name] + 1).setValue(v);
    let old = {};
    try { old = JSON.parse(vals[idx][H['Response Data']] || '{}') || {}; } catch (e) { old = {}; }
    const data = { title: myTitle, answers: answers };
    if (old.file) { data.file = old.file; fileUrl = String(old.file.url || ''); }
    readable = caseReadable_(c, myTitle, answers, data.file);
    set('Response Data', JSON.stringify(data));
    set('Response', clean_(readable));
    if (submit) set('Status', 'Submitted');
    else if (!wasSubmitted) set('Status', 'Draft');
    if (firstSubmit) set('Submitted On', now_());
  });
  if (submit) {
    const name = cfg.PARTICIPANT_NAME || 'Your participant';
    const label = 'Module ' + mod + ', Case ' + num + (c.type === 'own' ? ' (own case: ' + myTitle + ')' : c.title ? ': ' + c.title : '');
    mailCoach_(cfg, name + (firstSubmit ? ' submitted ' : ' updated ') + label,
      name + (firstSubmit ? ' submitted ' : ' updated ') + 'a case study response.\n\n' + label + '\n\n' + readable +
      '\n\nAdd your feedback in the Coach Feedback column of the Case Studies tab: ' + getSS_(false).getUrl());
    autoOpenNext_();
  }
  return getPortalData(code);
}

/* ---------------- Grading case studies ----------------
 * The coach saves a level and feedback. The participant sees it, and gets an email,
 * no earlier than GRADE_DELAY_HOURS after he submitted. */

const GRADE_DELAY_HOURS = 2;
const GRADE_LEVELS = ['Exceeds expectations', 'Meets expectations', 'Developing'];

/** 'yyyy-MM-dd HH:mm' (Manila time) to milliseconds. Manila is UTC+8 all year. */
function stampMs_(s) {
  const m = String(s || '').match(/(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 8, +m[5]) : 0;
}
function msStamp_(ms) { return Utilities.formatDate(new Date(ms), 'Asia/Manila', 'yyyy-MM-dd HH:mm'); }
/** When a grade may be shown: the submission time plus the delay. Empty when the submission time is unknown. */
function gradeDue_(submittedOn) {
  const t = stampMs_(submittedOn);
  return t ? msStamp_(t + GRADE_DELAY_HOURS * 3600000) : '';
}

function gradesDue_() {
  const now = Date.now();
  return rows_(SHEETS.CASES).some(r => {
    if (!String(r['Level'] || '').trim() || String(r['Grade Sent On'] || '').trim() || !/^submitted$/i.test(String(r['Status'] || '').trim())) return false;
    const t = stampMs_(gradeDue_(r['Submitted On']));
    return !t || t <= now;
  });
}

function ensureCaseGradeCols_(sh) {
  const H = headerIndex_(sh);
  const missing = ['Level', 'Graded On', 'Grade Sent On'].filter(h => H[h] === undefined);
  if (!missing.length) return;
  const start = sh.getLastColumn() + 1, src = sh.getRange(1, start - 1);
  missing.forEach((h, i) => {
    const cell = sh.getRange(1, start + i).setValue(h);
    try { cell.setFontWeight('bold').setBackground(src.getBackground()).setFontColor(src.getFontColor()); } catch (e) { /* styling is optional */ }
  });
  delete ROWS_[SHEETS.CASES];
}

/** Coach saves the level and feedback for a submitted case. It is sent now, or later when the delay has passed. */
function coachGradeCase(key, moduleNum, caseNum, level, feedback) {
  checkCoach_(key);
  const cfg = getConfig_();
  const mod = String(moduleNum || '').trim(), num = String(caseNum || '').trim();
  level = String(level || '').trim(); feedback = clean_(String(feedback || '').trim());
  if (GRADE_LEVELS.indexOf(level) === -1) throw new Error('Please choose a level.');
  if (!feedback) throw new Error('Please write the feedback before saving the grade.');
  ensureCaseGradeCols_(sheet_(SHEETS.CASES));
  const c = readCases_(cfg, true).items.filter(x => x.module === mod && x.num === num)[0];
  if (!c) throw new Error('Case not found. Please refresh.');
  if (c.status !== 'Submitted') throw new Error('This case has not been submitted yet.');
  withLock_(() => {
    setByKey_(SHEETS.CASES, ['Module', 'Case'], [mod, num], 'Level', level);
    setByKey_(SHEETS.CASES, ['Module', 'Case'], [mod, num], 'Coach Feedback', feedback);
    setByKey_(SHEETS.CASES, ['Module', 'Case'], [mod, num], 'Graded On', now_());
  });
  delete ROWS_[SHEETS.CASES];
  const out = releaseDueGrades();
  const d = coachData(key);
  if (out.sent.length) d.mail = out.mail || { note: 'Grade is now visible to the participant.' };
  if (out.triggerError) d.gradeNote = 'The grade is saved. It will show when he next opens his portal after the release time, but the email timer could not be set: ' + out.triggerError;
  return d;
}

/** Sends every grade whose release time has passed, then sets a timer for the next one. Also run by a time trigger. */
function releaseDueGrades() {
  const out = { sent: [], mail: null, triggerError: '' };
  let next = 0;
  const cfg = getConfig_();
  delete ROWS_[SHEETS.CASES];
  const sh = getSS_(false).getSheetByName(SHEETS.CASES);
  if (!sh || headerIndex_(sh)['Grade Sent On'] === undefined) return out;
  const now = Date.now(), due = [];
  readCases_(cfg, true).items.forEach(c => {
    if (!c.level || c.gradeSentOn || c.status !== 'Submitted') return;
    const t = stampMs_(c.gradeDue);
    if (!t || t <= now) due.push(c); else if (!next || t < next) next = t;
  });
  due.forEach(c => {
    withLock_(() => setByKey_(SHEETS.CASES, ['Module', 'Case'], [c.module, c.num], 'Grade Sent On', now_()));
    const title = c.type === 'own' ? (c.myTitle || 'Your own case') : (c.title || 'Case ' + c.num);
    out.mail = mailParticipant_('Your assessment has been graded: ' + title, 'Your assessment has been graded',
      ['I have reviewed your work on <b>' + h_(title) + '</b> (Module ' + h_(c.module) + ').',
       'Your result: <b>' + h_(c.level) + '</b>',
       'Open your portal and go to <b>Assessment</b> to read my feedback.']);
    out.sent.push(c.module + '.' + c.num);
  });
  delete ROWS_[SHEETS.CASES];
  try {
    ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'releaseDueGrades').forEach(t => ScriptApp.deleteTrigger(t));
    if (next) ScriptApp.newTrigger('releaseDueGrades').timeBased().at(new Date(next + 60000)).create();
  } catch (e) { out.triggerError = e.message; Logger.log('Grade timer: ' + e.message); }
  return out;
}

function caseReadable_(c, myTitle, answers, file) {
  return (c.type === 'own' && myTitle ? 'Case: ' + myTitle + '\n\n' : '') +
    (file ? 'Uploaded file: ' + file.name + '\n' + (file.url || '') + '\n\n' : '') +
    c.questions.map((q, i) => q + '\n' + (answers[i] || (file ? '(see the uploaded file)' : '(no answer yet)'))).join('\n\n');
}

const CASE_FILE_MAX_MB = 15;
const CASE_FILE_TYPES = /\.(pdf|docx?|pptx?|xlsx?|txt|rtf|odt|pages|key|png|jpe?g)$/i;

/** Folder in the coach's Google Drive that holds case study files uploaded by the participant. */
function caseFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CASE_FOLDER_ID');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) { /* recreate */ } }
  const cfg = getConfig_();
  const folder = DriveApp.createFolder('Coaching Portal – Case Study Uploads' + (cfg.PARTICIPANT_NAME ? ' – ' + cfg.PARTICIPANT_NAME : ''));
  props.setProperty('CASE_FOLDER_ID', folder.getId());
  return folder;
}

/** Finds a case row and hands its parsed Response Data to fn(data, set, wasSubmitted). Runs inside the lock. */
function withCaseRow_(mod, num, fn) {
  withLock_(() => {
    delete ROWS_[SHEETS.CASES];
    const sh = sheet_(SHEETS.CASES);
    const H = headerIndex_(sh);
    const last = sh.getLastRow();
    const vals = sh.getRange(2, 1, Math.max(last - 1, 1), sh.getLastColumn()).getDisplayValues();
    const idx = vals.findIndex(r => String(r[H['Module']]).trim() === mod && String(r[H['Case']]).trim() === num);
    if (idx === -1) throw new Error('Case not found. Please refresh the page.');
    let data = {};
    try { data = JSON.parse(vals[idx][H['Response Data']] || '{}') || {}; } catch (e) { data = {}; }
    fn(data, (name, v) => sh.getRange(idx + 2, H[name] + 1).setValue(v), /^submitted$/i.test(String(vals[idx][H['Status']]).trim()));
    delete ROWS_[SHEETS.CASES];
  });
}

/** Participant uploads a file for a case study. It is kept private in the coach's Drive. One file per case. */
function uploadCaseFile(code, moduleNum, caseNum, fileName, mimeType, base64) {
  checkCode_(code);
  const cfg = getConfig_();
  const mod = String(moduleNum || '').trim(), num = String(caseNum || '').trim();
  const c = readCases_(cfg).items.filter(x => x.module === mod && x.num === num)[0];
  if (!c || !c.released) throw new Error('This case is not open yet.');
  const clean = String(fileName || '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120);
  if (!CASE_FILE_TYPES.test(clean)) throw new Error('Please upload a PDF, Word, PowerPoint, Excel, text or image file.');
  const bytes = Utilities.base64Decode(String(base64 || ''));
  if (!bytes.length) throw new Error('The file is empty.');
  if (bytes.length > CASE_FILE_MAX_MB * 1024 * 1024) throw new Error('The file is larger than ' + CASE_FILE_MAX_MB + ' MB. Please upload a smaller file.');
  const file = caseFolder_().createFile(Utilities.newBlob(bytes, mimeType || 'application/octet-stream', 'Module ' + mod + ' Case ' + num + ' – ' + clean));
  const info = { id: file.getId(), name: clean, url: 'https://drive.google.com/file/d/' + file.getId() + '/view', uploadedOn: now_() };
  let oldId = '', submitted = false;
  withCaseRow_(mod, num, (data, set, wasSubmitted) => {
    oldId = data.file && data.file.id ? String(data.file.id) : '';
    submitted = wasSubmitted;
    data.file = info;
    if (!Array.isArray(data.answers)) data.answers = c.questions.map(() => '');
    set('Response Data', JSON.stringify(data));
    set('Response', clean_(caseReadable_(c, String(data.title || ''), data.answers, info)));
    if (!wasSubmitted) set('Status', 'Draft');
  });
  if (oldId) { try { DriveApp.getFileById(oldId).setTrashed(true); } catch (e) { Logger.log('Could not remove the earlier file: ' + e.message); } }
  if (submitted) {
    const name = cfg.PARTICIPANT_NAME || 'Your participant';
    mailCoach_(cfg, name + ' uploaded a new file for Module ' + mod + ', Case ' + num,
      name + ' replaced the file on a case study that was already submitted.\n\nFile: ' + info.name + '\n' + info.url);
  }
  return getPortalData(code);
}

/** Participant removes the file from a case study. The file goes to the Drive bin, where the coach can restore it. */
function removeCaseFile(code, moduleNum, caseNum) {
  checkCode_(code);
  const cfg = getConfig_();
  const mod = String(moduleNum || '').trim(), num = String(caseNum || '').trim();
  const c = readCases_(cfg).items.filter(x => x.module === mod && x.num === num)[0];
  if (!c || !c.released) throw new Error('This case is not open yet.');
  let oldId = '';
  withCaseRow_(mod, num, (data, set) => {
    oldId = data.file && data.file.id ? String(data.file.id) : '';
    delete data.file;
    set('Response Data', JSON.stringify(data));
    set('Response', clean_(caseReadable_(c, String(data.title || ''), Array.isArray(data.answers) ? data.answers : [], null)));
  });
  if (oldId) { try { DriveApp.getFileById(oldId).setTrashed(true); } catch (e) { Logger.log('Could not remove the file: ' + e.message); } }
  return getPortalData(code);
}

function finalQuestions_() {
  return getSS_(false).getSheetByName(SHEETS.DIAG_Q) ? diagQuestions_().filter(q => q.type === 'rating') : [];
}

function todayManila_() { return Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd'); }

function finalOpen_(cfg, modules) {
  if (!yes_(cfg.FINAL_ENABLED || 'Yes')) return false;
  const opens = configDate_('FINAL_OPENS');
  if (opens) return todayManila_() >= opens;
  const mods = modules || rows_(SHEETS.MODULES).map(r => ({ released: yes_(r['Released']) }));
  return mods.length > 0 && !!mods[mods.length - 1].released;
}

function finalReflections_() {
  return rows_(SHEETS.FINAL_R).map(r => ({
    id: String(r['ID']).trim(), text: String(r['Question'] || '').trim(),
    answer: r['Answer'] || '', coachNotes: r['Coach Notes'] || ''
  })).filter(q => q.id && q.text);
}

function readFinal_(cfg, diagnostic, modules) {
  if (!yes_(cfg.FINAL_ENABLED || 'Yes')) return { enabled: false };
  const questions = finalQuestions_();
  const answers = {};
  rows_(SHEETS.FINAL_A).forEach(r => { answers[String(r['ID']).trim()] = r['Answer']; });
  const start = diagnostic && diagnostic.enabled && diagnostic.submittedOn ? diagnostic.summary : [];
  const end = diagSummary_(questions, answers);
  return {
    enabled: true,
    open: finalOpen_(cfg, modules),
    opens: configDate_('FINAL_OPENS'),
    due: configDate_('FINAL_DUE'),
    submittedOn: cfg.FINAL_SUBMITTED || '',
    scale: DIAG_SCALE,
    questions: questions,
    answers: answers,
    reflections: finalReflections_(),
    growth: growth_(start, end)
  };
}

/** Start vs final average per priority area. */
function growth_(start, end) {
  const s = {};
  (start || []).forEach(a => { s[a.area] = a.avg; });
  return end.map(a => {
    const from = s[a.area] == null ? null : s[a.area];
    const to = a.avg;
    return { area: a.area, start: from, end: to, change: from != null && to != null ? Math.round((to - from) * 10) / 10 : null };
  });
}

/** Saves the final assessment (ratings + written reflection). With submit = true, everything must be answered. */
function saveFinal(code, ratings, reflections, submit) {
  checkCode_(code);
  const cfg = getConfig_();
  if (!finalOpen_(cfg)) throw new Error('The final assessment is not open yet.');
  ratings = ratings || {}; reflections = reflections || {};
  const questions = finalQuestions_();
  const refl = finalReflections_();
  const clean = {};
  questions.forEach(q => {
    const v = String(ratings[q.id] == null ? '' : ratings[q.id]).trim();
    if (v && !/^[1-5]$/.test(v)) throw new Error('Ratings must be from 1 to 5.');
    clean[q.id] = v;
  });
  const text = {};
  refl.forEach(q => { text[q.id] = String(reflections[q.id] == null ? '' : reflections[q.id]).slice(0, MAX_TEXT); });
  if (submit) {
    const missing = questions.filter(q => q.required && !clean[q.id]).length + refl.filter(q => !text[q.id].trim()).length;
    if (missing) throw new Error('Please answer the ' + missing + ' remaining question' + (missing > 1 ? 's' : '') + ' before submitting.');
  }
  const first = submit && !String(cfg.FINAL_SUBMITTED || '').trim();
  withLock_(() => {
    const now = now_();
    writeRows_(sheet_(SHEETS.FINAL_A), questions.map(q => [q.id, q.area, q.text, clean[q.id], now]), HEADERS.FINAL_A.length);
    const sh = sheet_(SHEETS.FINAL_R);
    const H = headerIndex_(sh);
    const last = sh.getLastRow();
    if (last >= 2) {
      const ids = sh.getRange(2, H['ID'] + 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim());
      ids.forEach((id, i) => {
        if (!(id in text)) return;
        sh.getRange(i + 2, H['Answer'] + 1).setValue(clean_(text[id]));
        sh.getRange(i + 2, H['Saved On'] + 1).setValue(now);
      });
    }
    if (submit) {
      setConfig_('FINAL_SUBMITTED', now);
      delete ROWS_[SHEETS.DIAG_A];
      const dg = readDiagnostic_(getConfig_());
      const g = growth_(dg.enabled && dg.submittedOn ? dg.summary : [], diagSummary_(questions, clean));
      writeRows_(sheet_(SHEETS.FINAL_S), g.map(a => [a.area, a.start == null ? '' : a.start, a.end == null ? '' : a.end, a.change == null ? '' : (a.change > 0 ? '+' : '') + a.change]), HEADERS.FINAL_S.length);
      const name = cfg.PARTICIPANT_NAME || 'Your participant';
      const lines = g.map(a => '• ' + a.area + ': ' + (a.start == null ? '–' : a.start) + ' → ' + (a.end == null ? '–' : a.end) + (a.change == null ? '' : ' (' + (a.change > 0 ? '+' : '') + a.change + ')'));
      const words = refl.filter(q => text[q.id].trim()).map(q => q.text + '\n' + text[q.id]);
      mailCoach_(cfg, name + (first ? ' completed' : ' updated') + ' the final assessment',
        name + (first ? ' submitted' : ' updated') + ' the final assessment.\n\nGrowth by priority (start → final, out of 5)\n' + lines.join('\n') +
        (words.length ? '\n\nReflection\n\n' + words.join('\n\n') : '') + '\n\nFull answers: ' + getSS_(false).getUrl());
    }
  });
  return getPortalData(code);
}

/* ---------------- Coach dashboard ---------------- */

/** Coach tool: shows your private dashboard link (keep it to yourself: anyone with it can see the participant's answers). */
function coachDashboardLink() {
  let base = '';
  try { base = ScriptApp.getService().getUrl() || ''; } catch (e) { /* not deployed */ }
  if (!base) { notify_('Coach dashboard', 'Deploy the portal as a web app first (Deploy > New deployment > Web app).'); return; }
  notify_('Coach dashboard', 'Your private dashboard link (do not share it):\n\n' + base + '?coach=' + coachKey_());
}

function coachPage_(key) {
  if (!coachKeyOk_(key)) {
    return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;font-family:system-ui,sans-serif;background:#F0F5FA;color:#1B1E33"><div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #DCE3ED"><div style="font-weight:800;font-size:20px;color:#2F2B7F">coachjeff<span style="color:#F79E43">.</span></div><h1 style="color:#2F2B7F;font-size:24px;margin:18px 0 8px">Link not valid</h1><p style="line-height:1.55">This coach dashboard link is not valid. In the script editor, run <b>coachDashboardLink</b> to get your current link.</p></div></body>')
      .setTitle('Coach dashboard');
  }
  const t = HtmlService.createTemplateFromFile('Admin');
  t.coachKey = String(key);
  return t.evaluate().setTitle('Coach Dashboard · coachjeff.')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/** Checks the coach key, with the same lockout as the participant code. */
function coachKeyOk_(key) {
  const cache = CacheService.getScriptCache();
  if (cache.get('coach_lock')) return false;
  const ok = String(key || '') !== '' && String(key) === coachKey_();
  if (!ok) {
    const fails = Number(cache.get('coach_fails') || 0) + 1;
    if (fails >= MAX_FAILS) { cache.put('coach_lock', '1', LOCK_SECONDS); cache.remove('coach_fails'); }
    else cache.put('coach_fails', String(fails), LOCK_SECONDS);
  }
  return ok;
}

function checkCoach_(key) {
  if (!coachKeyOk_(key)) throw new Error('Your coach link is not valid. Reopen it from the latest link.');
}

/** Everything the participant has done, including content not yet released to them. */
function coachData(key, force) {
  checkCoach_(key);
  return cached_('coach', 300, !!force, buildCoachData_);
}

function buildCoachData_() {
  SS_ = null; ROWS_ = {};
  ensureAssessment_();
  ensureTracker_();
  const cfg = getConfig_();
  const ss = getSS_(false);
  const slideLinks = slideLinks_();
  const modules = rows_(SHEETS.MODULES).map(r => ({
    number: String(r['Module']).trim(), title: r['Title'], date: r['Session Date'],
    released: yes_(r['Released']), focus: r['Focus'], topics: lines_(r['Key Topics']),
    prework: r['Pre-work'], prompts: lines_(r['Reflection Prompts']), challenge: r['Weekly Challenge'] || '',
    resources: lines_(r['Resources']), slides: slideLinks[String(r['Module']).trim()] || ''
  }));
  const sessions = rows_(SHEETS.SESSIONS).map(r => ({
    id: r['ID'], type: r['Type'], title: r['Title'], date: r['Date (YYYY-MM-DD)'], dateNote: r['Date Note'],
    time: r['Time'], duration: r['Duration'], mode: r['Mode'], location: r['Location / Link'],
    status: r['Status'], notes: r['Notes']
  }));
  const challenges = rows_(SHEETS.CHALLENGES).map(r => ({
    module: String(r['Module']).trim(), done: /^(yes|y|true|done)$/i.test(String(r['Done']).trim()),
    doneOn: r['Done On'], note: r['What Happened'], coachNotes: r['Coach Notes']
  }));
  const journal = rows_(SHEETS.JOURNAL).map(r => ({
    id: r['ID'], created: r['Created'], updated: r['Updated'], module: r['Module'],
    learnings: r['Key Learnings'], applied: r['How I Applied It'], questions: r['Questions for Coach'], coachNotes: r['Coach Notes'],
    closed: /^(closed|done)\b/i.test(String(r['Status'] || '').trim())
  })).reverse();
  const diagnostic = readDiagnostic_(cfg);
  const id = ss.getId();
  return {
    participant: { name: cfg.PARTICIPANT_NAME || '', role: cfg.PARTICIPANT_ROLE || '', org: cfg.ORGANIZATION || '', email: participantEmails_(cfg).join(', ') },
    program: cfg.PROGRAM_TITLE || 'Leadership Accelerator',
    accessCode: cfg.ACCESS_CODE || '',
    sheetUrl: ss.getUrl(),
    xlsxUrl: 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx',
    portalUrl: (function () { try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; } })(),
    loadedAt: now_(),
    modules: modules, sessions: sessions, challenges: challenges, journal: journal,
    goals: readItems_('goal'), plan: readItems_('plan'),
    diagnostic: diagnostic,
    cases: readCases_(cfg, true),
    final: readFinal_(cfg, diagnostic, modules),
    booking: readBooking_(cfg),
    journey: readJourney_(),
    tracker: readTracker_(cfg, true),
    agreedGoal: readAgreedGoal_(cfg, true)
  };
}

/** Writes one coach note or feedback cell. target: journal, goal, plan, challenge, case, final. */
function coachSave(key, target, id, value) {
  checkCoach_(key);
  const map = {
    journal: [SHEETS.JOURNAL, ['ID'], 'Coach Notes'],
    goal: [SHEETS.GOALS, ['ID'], 'Coach Notes'],
    plan: [SHEETS.PLAN, ['ID'], 'Coach Notes'],
    challenge: [SHEETS.CHALLENGES, ['Module'], 'Coach Notes'],
    'case': [SHEETS.CASES, ['Module', 'Case'], 'Coach Feedback'],
    final: [SHEETS.FINAL_R, ['ID'], 'Coach Notes'],
    week: [SHEETS.TRACK_WEEK, ['Week Ending'], 'Coach Notes']
  };
  const m = map[target];
  if (!m) throw new Error('Unknown item.');
  withLock_(() => setByKey_(m[0], m[1], String(id).split('|'), m[2], clean_(value)));
  return coachData(key);
}

/** Adds the Status column to an older Journal tab (Open = in progress, Closed = done). */
function ensureJournalStatus_(sh) {
  const H = headerIndex_(sh);
  if (H['Status'] !== undefined) return;
  const col = Math.max(sh.getLastColumn(), HEADERS.JOURNAL.length - 1) + 1;
  const src = sh.getRange(1, col - 1);
  const cell = sh.getRange(1, col).setValue('Status');
  try { cell.setFontWeight('bold').setBackground(src.getBackground()).setFontColor(src.getFontColor()); } catch (e) { /* styling is optional */ }
  delete ROWS_[SHEETS.JOURNAL];
}

/** Coach closes a journal entry (done) or reopens it (in progress). */
function coachSetJournalStatus(key, id, closed) {
  checkCoach_(key);
  withLock_(() => {
    ensureJournalStatus_(sheet_(SHEETS.JOURNAL));
    setByKey_(SHEETS.JOURNAL, ['ID'], [String(id)], 'Status', closed ? 'Closed' : 'Open');
  });
  return coachData(key);
}

/** Opens or locks a module or a case for the participant. */
function coachRelease(key, kind, id, on) {
  checkCoach_(key);
  const m = kind === 'module' ? [SHEETS.MODULES, ['Module']] : kind === 'case' ? [SHEETS.CASES, ['Module', 'Case']] : null;
  if (!m) throw new Error('Unknown item.');
  let was = null;
  if (kind === 'module') {
    const row = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === String(id).trim())[0];
    was = row ? isYes_(row['Released']) : null;
  }
  withLock_(() => setByKey_(m[0], m[1], String(id).split('|'), 'Released', on ? 'Yes' : 'No'));
  let mail = null;
  if (kind === 'module' && was !== !!on) {
    const num = String(id).trim();
    if (on) {
      // Unlocking sends a calendar invite for the module's session (not an email)
      const inv = moduleInvite_(num);
      mail = inv.invited ? inv : mailModuleChange_(num, true);
      if (!inv.invited && mail && !mail.error) mail.note = inv.reason;
    } else {
      mail = mailModuleChange_(num, false);
    }
  }
  return withMail_(coachData(key), mail);
}

/** Confirms a requested coaching session (moves the calendar hold, invites and emails the participant). */
function coachConfirm(key, sessionId) {
  checkCoach_(key);
  const cfg = getConfig_();
  withLock_(() => confirmSession_(cfg, String(sessionId)));
  return coachData(key);
}

function setByKey_(sheetName, keyHeaders, keyValues, header, value) {
  delete ROWS_[sheetName];
  const sh = sheet_(sheetName);
  const H = headerIndex_(sh);
  if (H[header] === undefined) throw new Error('The ' + sheetName + ' tab has no "' + header + '" column.');
  const last = sh.getLastRow();
  if (last < 2) throw new Error('Entry not found. Please refresh.');
  const vals = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getDisplayValues();
  const idx = vals.findIndex(r => keyHeaders.every((k, i) => String(r[H[k]]).trim() === String(keyValues[i] || '').trim()));
  if (idx === -1) throw new Error('Entry not found. Please refresh.');
  sh.getRange(idx + 2, H[header] + 1).setValue(value);
}

/* ---------------- Coach dashboard: module files ---------------- */

const MODULE_FILE_MAX_MB = 30;

/** Folder in your Google Drive that holds uploaded module files. */
function moduleFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('MODULE_FOLDER_ID');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) { /* recreate */ } }
  const cfg = getConfig_();
  const folder = DriveApp.createFolder('Coaching Portal – Module Files' + (cfg.PARTICIPANT_NAME ? ' – ' + cfg.PARTICIPANT_NAME : ''));
  props.setProperty('MODULE_FOLDER_ID', folder.getId());
  return folder;
}

/** Uploads a module file (PDF, PowerPoint, etc.) to your Drive and links it to the module. */
function coachUploadModule(key, moduleNum, fileName, mimeType, base64) {
  checkCoach_(key);
  const mod = String(moduleNum || '').trim();
  if (!mod) throw new Error('Unknown module.');
  const bytes = Utilities.base64Decode(String(base64 || ''));
  if (!bytes.length) throw new Error('The file is empty.');
  if (bytes.length > MODULE_FILE_MAX_MB * 1024 * 1024) throw new Error('The file is larger than ' + MODULE_FILE_MAX_MB + ' MB. Upload it to Google Drive and paste the link instead.');
  const m = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === mod)[0];
  if (!m) throw new Error('Module ' + mod + ' was not found.');
  const clean = String(fileName || 'module-file').replace(/[\\/:*?"<>|]+/g, ' ').trim();
  const name = 'Module ' + mod + ' – ' + String(m['Title'] || '').trim() + ' – ' + clean;
  const file = moduleFolder_().createFile(Utilities.newBlob(bytes, mimeType || 'application/octet-stream', name));
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { Logger.log('Could not set link sharing: ' + e.message); }
  const url = 'https://drive.google.com/file/d/' + file.getId() + '/view';
  withLock_(() => setByKey_(SHEETS.MODULES, ['Module'], [mod], 'Slides Link', url));
  return coachData(key);
}

/* Extra files for a module (videos, readings). Kept in the Resources column, one per line: Label | link */

function moduleResources_(mod) {
  const m = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === mod)[0];
  if (!m) throw new Error('Module ' + mod + ' was not found.');
  return lines_(m['Resources']);
}
function resourceLabel_(label, fallback) {
  return String(label || fallback || 'Resource').replace(/[|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Resource';
}

/** Adds a link (YouTube, Google Drive, article) to a module's resources. */
function coachAddResource(key, moduleNum, label, url) {
  checkCoach_(key);
  const mod = String(moduleNum || '').trim();
  const u = normUrl_(url);
  if (!u) throw new Error('Please paste a full link that starts with https://');
  withLock_(() => {
    const list = moduleResources_(mod);
    list.push(resourceLabel_(label, 'Link') + ' | ' + u);
    setByKey_(SHEETS.MODULES, ['Module'], [mod], 'Resources', list.join('\n'));
  });
  return coachData(key);
}

/** Uploads an extra file (video, PDF, etc.) to the coach's Drive and adds it to a module's resources. */
function coachUploadResource(key, moduleNum, label, fileName, mimeType, base64) {
  checkCoach_(key);
  const mod = String(moduleNum || '').trim();
  moduleResources_(mod);
  const bytes = Utilities.base64Decode(String(base64 || ''));
  if (!bytes.length) throw new Error('The file is empty.');
  if (bytes.length > MODULE_FILE_MAX_MB * 1024 * 1024) throw new Error('The file is larger than ' + MODULE_FILE_MAX_MB + ' MB. Upload it to Google Drive or YouTube and paste the link instead.');
  const clean = String(fileName || 'file').replace(/[\\/:*?"<>|]+/g, ' ').trim();
  const file = moduleFolder_().createFile(Utilities.newBlob(bytes, mimeType || 'application/octet-stream', 'Module ' + mod + ' – ' + clean));
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { Logger.log('Could not set link sharing: ' + e.message); }
  const url = 'https://drive.google.com/file/d/' + file.getId() + '/view';
  withLock_(() => {
    const list = moduleResources_(mod);
    list.push(resourceLabel_(label, clean.replace(/\.[a-z0-9]{2,5}$/i, '')) + ' | ' + url);
    setByKey_(SHEETS.MODULES, ['Module'], [mod], 'Resources', list.join('\n'));
  });
  return coachData(key);
}

/** Removes one resource from a module. line is the exact text of the row, so a stale screen cannot remove the wrong one. */
function coachRemoveResource(key, moduleNum, line) {
  checkCoach_(key);
  const mod = String(moduleNum || '').trim();
  withLock_(() => {
    const list = moduleResources_(mod);
    const i = list.indexOf(String(line || '').trim());
    if (i === -1) throw new Error('That file is no longer in the list. Please refresh.');
    list.splice(i, 1);
    setByKey_(SHEETS.MODULES, ['Module'], [mod], 'Resources', list.join('\n'));
  });
  return coachData(key);
}

/** Sets (or clears, with an empty link) a module's slides link, e.g. a Google Slides URL. */
function coachSetModuleLink(key, moduleNum, url) {
  checkCoach_(key);
  const u = String(url || '').trim() ? normUrl_(url) : '';
  if (String(url || '').trim() && !u) throw new Error('Please paste a full link that starts with https://');
  withLock_(() => setByKey_(SHEETS.MODULES, ['Module'], [String(moduleNum).trim()], 'Slides Link', u));
  return coachData(key);
}

/* ---------------- Coach dashboard: session status ---------------- */

/** Marks a session Done (switch off) or open again (switch on: Confirmed if it has a calendar event, otherwise Upcoming). */
function coachSetSessionDone(key, sessionId, done) {
  checkCoach_(key);
  const s = findSession_(String(sessionId));
  if (!s) throw new Error('Session not found. Please refresh.');
  const wasDone = /^(done|completed?)\b/i.test(s.status);
  withLock_(() => setSessionCell_(s.row, 'Status', done ? 'Done' : (s.eventId ? 'Confirmed' : 'Upcoming')));
  const mail = done && !wasDone ? mailSessionDone_(String(sessionId)) : null;
  return withMail_(coachData(key), mail);
}

/* ---------------- Calendar invites (module sessions) ---------------- */

/** First clock time in a cell like "9:30 AM (to confirm)" or "2:00 PM – 3:00 PM" -> ["09:30", "15:00"]. */
function schedTimes_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return [Utilities.formatDate(v, BOOK_TZ, 'HH:mm')];
  const out = [];
  const re = /(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/ig;
  let m;
  while ((m = re.exec(String(v || ''))) && out.length < 2) {
    let h = parseInt(m[1], 10); const mi = m[2] ? parseInt(m[2], 10) : 0; const ap = m[3].toLowerCase();
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (h < 24 && mi < 60) out.push(('0' + h).slice(-2) + ':' + ('0' + mi).slice(-2));
  }
  if (!out.length) { const t = cellTime_(v, BOOK_TZ); if (t) out.push(t); }
  return out;
}

/** "1.5 hours" -> 90, "1 hour" -> 60, "30–45 min" -> 45. */
function durMinutes_(v) {
  const s = String(v || '').toLowerCase();
  const nums = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!nums.length) return 0;
  const n = nums[nums.length - 1];
  return Math.round(/h/.test(s) && !/min/.test(s) ? n * 60 : n);
}

/** The calendar invites come from: your ICF calendar when this Google account can edit it, otherwise the default calendar. */
function inviteCalendars_() {
  const cfg = getConfig_();
  const id = String(cfg.INVITE_CALENDAR || sendFrom_()).trim();
  const out = [];
  try { const c = CalendarApp.getCalendarById(id); if (c) out.push(c); } catch (e) { /* not shared */ }
  out.push(CalendarApp.getDefaultCalendar());
  return out;
}

/** Sends (or keeps) a calendar invite for a module's session, using the date and time on the Sessions tab. */
function moduleInvite_(num) {
  try { return moduleInviteRun_(num); }
  catch (e) { Logger.log('Invite failed: ' + e.message); return { reason: 'The calendar invite could not be created (' + e.message + '), so an email went instead.' }; }
}

function moduleInviteRun_(num) {
  const cfg = getConfig_();
  const people = participantEmails_(cfg);
  if (!people.length) return { reason: 'No invite sent: add PARTICIPANT_EMAIL on the Config tab.' };
  const guest = people[0];
  const all = rows_(SHEETS.SESSIONS);
  const sess = all.filter(r => new RegExp('^\\s*module\\s*' + num + '\\b', 'i').test(String(r['Title'] || '')))[0];
  if (!sess) return { reason: 'No invite sent: no "Module ' + num + '" session on the Sessions tab.' };
  const date = cellDate_(sess['Date (YYYY-MM-DD)'], BOOK_TZ);
  const times = schedTimes_(sess['Time']);
  if (!date || !times.length) return { reason: 'No invite sent: Module ' + num + ' has no date and time on the Sessions tab yet, so an email went instead.' };
  const start = new Date(Date.parse(date + 'T' + times[0] + ':00' + BOOK_OFFSET));
  let minutes = times[1] ? (Date.parse(date + 'T' + times[1] + ':00' + BOOK_OFFSET) - start.getTime()) / 60000 : 0;
  if (!(minutes > 0)) minutes = durMinutes_(sess['Duration']) || bookingMinutes_(cfg);
  const end = new Date(start.getTime() + minutes * 60000);
  const meet = normUrl_(sess['Location / Link']) || normUrl_(cfg.BOOKING_LINK);
  const portal = normUrl_(cfg.PORTAL_URL) || PORTAL_URL_DEFAULT;
  const m = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === num)[0] || {};
  const name = 'Module ' + num + (m['Title'] ? ': ' + String(m['Title']).trim() : '');
  const title = name + ' – ' + (cfg.PARTICIPANT_NAME || 'Participant') + ' & Coach Jeff';
  const topics = String(m['Key Topics'] || '').split(/\s*[\r\n]+\s*/).filter(Boolean).join('; ');
  const desc = 'Hi ' + (String(cfg.PARTICIPANT_NAME || '').trim().split(/\s+/)[0] || 'there') + ',\n\n' +
    name + ' is now open in your portal, in the Learn tab:\n' + portal + '\n\n' +
    (meet ? 'Join with Google Meet: ' + meet + '\n\n' : '') +
    (m['Focus'] || topics || m['Slides Link'] ? 'WHAT IS INSIDE\n' +
      (m['Focus'] ? '- Focus: ' + m['Focus'] + '\n' : '') + (topics ? '- Key topics: ' + topics + '\n' : '') +
      (m['Slides Link'] ? '- The module slides, ready to view or download\n' : '') + '\n' : '') +
    (m['Pre-work'] ? 'BEFORE WE MEET\n- ' + m['Pre-work'] + '\n\n' : '') +
    (cfg.COACH_NAME || 'Coach Jeff');
  const coach = String(cfg.COACH_EMAIL || COACH_EMAIL_DEFAULT).trim().toLowerCase();
  const cals = inviteCalendars_();
  const oldId = String(sess['Calendar Event ID'] || '').trim();
  let ev = null, cal = null, existing = false;
  if (oldId) {
    for (const c of cals) { try { const e = c.getEventById(oldId); if (e) { ev = e; cal = c; break; } } catch (e) { /* not on this calendar */ } }
  }
  if (ev && ev.getGuestList().some(g => String(g.getEmail()).toLowerCase() === guest.toLowerCase())) {
    existing = true;
    if (ev.getStartTime().getTime() !== start.getTime()) ev.setTime(start, end);
    const have = ev.getGuestList().map(g => String(g.getEmail()).toLowerCase());
    people.forEach(p => { if (have.indexOf(p.toLowerCase()) < 0) ev.addGuest(p); });
  } else {
    ev = null;
    for (const c of cals) {
      const own = String(c.getId()).toLowerCase() === coach;
      const guests = people.concat(own ? [] : [coach]).join(',');
      try {
        ev = c.createEvent(title, start, end, { description: desc, location: meet || '', guests: guests, sendInvites: true });
        cal = c; break;
      } catch (e) { Logger.log('Could not create the invite on ' + c.getId() + ': ' + e.message); }
    }
    if (!ev) return { reason: 'The calendar invite could not be created, so an email went instead.' };
  }
  const row = all.indexOf(sess) + 2;
  setSessionCell_(row, 'Calendar Event ID', ev.getId());
  if (!/^(done|completed?)\b/i.test(String(sess['Status'] || '').trim())) setSessionCell_(row, 'Status', 'Confirmed');
  if (meet && !normUrl_(sess['Location / Link'])) setSessionCell_(row, 'Location / Link', meet);
  if (meet && /^(tbc|tbd|)$/i.test(String(sess['Mode'] || '').trim())) setSessionCell_(row, 'Mode', 'Online');
  return { invited: true, existing: existing, to: people.join(', '), when: longDate_(date) + ', ' + fmt12_(times[0]), calendar: cal ? cal.getId() : '' };
}

/* ---------------- Reminders: 2 days before each scheduled session ---------------- */

const REMIND_DAYS_BEFORE = 2;

/** Menu / editor: installs the daily reminder check (8:00 AM Manila). Run once; Google asks for permission the first time. */
function setupReminders() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendSessionReminders').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendSessionReminders').timeBased().everyDays(1).atHour(8).inTimezone(BOOK_TZ).create();
  const sent = sendSessionReminders();
  const msg = 'Session reminders are on. Every morning at 8:00 AM (Manila) the portal emails ' + (participantEmails_(getConfig_()).join(' and ') || 'the participant') +
    ' about any session ' + REMIND_DAYS_BEFORE + ' days away, with you in cc.' + (sent.length ? '\n\nSent just now: ' + sent.join('; ') : '');
  notify_('Session reminders', msg);
  return msg;
}

/** The sessions that have a set date and time, with their start. */
function scheduledSessions_(cfg) {
  let bookings = {};
  try { bookings = readRequests_(cfg).bookings || {}; } catch (e) { /* no booking data */ }
  const out = [];
  rows_(SHEETS.SESSIONS).forEach(r => {
    const id = String(r['ID'] || '').trim();
    if (!id || /^(done|completed?|cancell?ed|missed)\b/i.test(String(r['Status'] || '').trim())) return;
    const b = bookings[id];
    let date = '', time = '';
    if (b && b.status === 'confirmed') { date = b.date; time = b.start; }
    else if (!/^coaching$/i.test(String(r['Type'] || '').trim())) {
      // Modules and other fixed activities use the date on the Sessions tab
      date = cellDate_(r['Date (YYYY-MM-DD)'], BOOK_TZ);
      time = schedTimes_(r['Time'])[0] || '';
    }
    if (date) out.push({ row: r, id: id, date: date, time: time, booking: b });
  });
  return out;
}

/** Daily trigger: emails the participant (cc coach) about sessions REMIND_DAYS_BEFORE days away. Each reminder is sent once. */
function sendSessionReminders() {
  const cfg = getConfig_();
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), BOOK_TZ, 'yyyy-MM-dd');
  const target = Utilities.formatDate(new Date(Date.parse(today + 'T12:00:00' + BOOK_OFFSET) + REMIND_DAYS_BEFORE * 86400000), BOOK_TZ, 'yyyy-MM-dd');
  const sent = [];
  scheduledSessions_(cfg).filter(x => x.date === target).forEach(x => {
    const key = 'reminded:' + x.id + ':' + x.date;
    if (props.getProperty(key)) return;
    const res = mailReminder_(cfg, x);
    if (res && !res.error) { props.setProperty(key, new Date().toISOString()); sent.push(x.row['Title'] + ' (' + x.date + ')'); }
    else Logger.log('Reminder not sent for ' + x.id + ': ' + (res && res.error));
  });
  return sent;
}

function mailReminder_(cfg, x) {
  const r = x.row;
  const title = String(r['Title'] || 'our session').trim();
  const when = longDate_(x.date) + (x.time ? ', ' + fmt12_(x.time) + ' (Manila time)' : '');
  const meet = (x.booking && x.booking.link) || normUrl_(r['Location / Link']) || normUrl_(cfg.BOOKING_LINK);
  const isModule = /^module$/i.test(String(r['Type'] || '').trim()) || /^\s*module\s*\d/i.test(title);
  const sessionBox =
    '<div style="background:#F0F5FA;border:1px solid #DCE3ED;border-radius:12px;padding:14px 16px;margin:0 0 14px;">' +
    '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#5A6377;">' + h_(title) + '</p>' +
    '<p style="margin:0 0 6px;font-size:15px;color:#1B1E33;"><b>' + h_(when) + '</b>' + (r['Duration'] ? ' · ' + h_(r['Duration']) : '') + '</p>' +
    (meet ? '<p style="margin:0;font-size:15px;color:#1B1E33;">Google Meet: <a href="' + h_(meet) + '" style="color:#2C4777;font-weight:bold;">' + h_(meet.replace(/^https:\/\//, '')) + '</a></p>' : '') +
    '</div>';
  let extra = sessionBox;
  const paras = ['This is a friendly reminder that our <b>' + h_(title) + '</b> is in ' + REMIND_DAYS_BEFORE + ' days.'];
  if (isModule) {
    const num = (title.match(/module\s*(\d+)/i) || [])[1];
    const m = num ? rows_(SHEETS.MODULES).filter(z => String(z['Module']).trim() === num)[0] || {} : {};
    const open = isYes_(m['Released']);
    paras.push(open ? 'The module is open in your portal, in the Learn tab. Please go through it before we meet.'
                    : 'The module materials will open in your portal, in the Learn tab, before our session.');
    extra += list_('To prepare', [
      m['Pre-work'] ? h_(m['Pre-work']) : '',
      'Answer your weekly challenge in your weekly rating (Growth, then Tracker).',
      'Update your goal progress in the Growth tab.'
    ]);
  } else {
    paras.push('Please come with one situation from this week you would like to work on.');
    if (r['Notes']) extra += list_('Focus', [h_(r['Notes'])]);
  }
  paras.push('If you need to move it, just reply to this email.');
  return mailParticipant_('Reminder: ' + title + ' on ' + when.replace(' (Manila time)', ''), title + ' is in ' + REMIND_DAYS_BEFORE + ' days', paras, extra);
}

/* ---------------- Participant emails (cc the coach) ---------------- */

/** [REDACTED]'s portal link, used in the emails. Set PORTAL_URL on the Config tab to change it. */
/* ---------------- Pending tasks: the next module opens by itself when they are done ----------------
 * Pending tasks = the weekly challenge of every open module + every open case study not yet submitted.
 * When none are left, the next locked module is opened and the participant is emailed (button only).
 * Config: AUTO_OPEN_MODULES = No switches the automatic opening off. */
const PENDING_REMINDER_AT = '2026-11-27T09:00:00+08:00'; // Friday 9:00 AM, Manila

function pendingTasks_() {
  const cfg = getConfig_();
  const mods = rows_(SHEETS.MODULES).map(r => ({
    num: String(r['Module']).trim(), title: String(r['Title'] || '').trim(), date: String(r['Session Date'] || '').trim(),
    released: yes_(r['Released']), challenge: String(r['Weekly Challenge'] || '').trim()
  })).filter(m => m.num);
  const next = mods.filter(m => !m.released)[0] || null;
  const done = {};
  rows_(SHEETS.CHALLENGES).forEach(r => { if (/^(yes|y|true|done)$/i.test(String(r['Done']).trim())) done[String(r['Module']).trim()] = true; });
  const tracker = yes_(cfg.TRACKER_ENABLED);
  const tasks = [];
  mods.filter(m => m.released && m.challenge && !done[m.num]).forEach(m => tasks.push({
    kind: 'challenge', module: m.num,
    text: 'Module ' + m.num + ' weekly challenge: tell me what you did',
    where: tracker ? 'Growth, then Tracker: answer it in your weekly rating' : 'Home: tap "I did it" and add a short note'
  }));
  if (yes_(cfg.CASES_ENABLED || 'Yes')) {
    readCases_(cfg, true).items.filter(c => c.released && c.status !== 'Submitted').forEach(c => tasks.push({
      kind: 'case', module: c.module, num: c.num,
      text: 'Module ' + c.module + ' case study: ' + (c.type === 'own' ? 'your own case' : (c.title || 'Case ' + c.num)),
      where: 'Assessment: answer the questions or upload your file, then submit'
    }));
  }
  return { next: next, tasks: tasks };
}

/** What the participant sees on Home: the next locked module and what is still to do. */
function gateForPortal_() {
  try {
    if (!autoOpenOn_()) return null;
    const p = pendingTasks_();
    if (!p.next) return null;
    return { module: p.next.num, title: p.next.title, tasks: p.tasks.map(t => ({ kind: t.kind, module: t.module, num: t.num || '', text: t.text, where: t.where })) };
  } catch (e) { Logger.log('Gate: ' + e.message); return null; }
}

function autoOpenOn_() { return !/^(no|n|false|off)$/i.test(String(getConfig_().AUTO_OPEN_MODULES || '').trim()); }

/** Opens the next locked module when nothing is pending, and emails the participant. Never throws. */
function autoOpenNext_() {
  try {
    ROWS_ = {};
    if (!autoOpenOn_()) return null;
    const p = pendingTasks_();
    if (!p.next || p.tasks.length) return null;
    const num = p.next.num;
    withLock_(() => setByKey_(SHEETS.MODULES, ['Module'], [num], 'Released', 'Yes'));
    ROWS_ = {};
    // The participant always gets the "now open" email with the portal button
    const mail = mailModuleChange_(num, true);
    // The calendar invite for the module's session goes out too, as it does when the coach opens a module
    let invite = '';
    try { const inv = moduleInvite_(num); invite = inv.invited ? 'A calendar invite was sent for the session.' : (inv.reason || ''); } catch (e) { invite = ''; }
    const cfg = getConfig_();
    const name = 'Module ' + num + (p.next.title ? ': ' + p.next.title : '');
    mailCoach_(cfg, name + ' opened automatically',
      (cfg.PARTICIPANT_NAME || 'Your participant') + ' finished every pending task, so ' + name + ' is now open in the portal.\n\n' +
      (mail && mail.error ? 'The email to the participant could not be sent: ' + mail.error : 'An email with the portal button went to ' + ((mail && mail.to) || 'the participant') + '.') +
      (invite ? '\n' + invite : ''));
    ROWS_ = {};
    return { opened: num, mail: mail };
  } catch (e) { Logger.log('Auto-open: ' + e.message); return null; }
}

/** Emails the participant the list of tasks still pending before the next module. Sends nothing when all is done. */
function sendPendingReminder() {
  ROWS_ = {};
  const p = pendingTasks_();
  if (!p.next) return { skipped: 'Every module is already open.' };
  if (!p.tasks.length) { const o = autoOpenNext_(); return { skipped: 'Nothing is pending.', opened: o && o.opened }; }
  const name = 'Module ' + p.next.num + (p.next.title ? ': ' + p.next.title : '');
  const n = p.tasks.length;
  const when = /^\d{4}-\d{2}-\d{2}$/.test(p.next.date) ? ' Our session is on <b>' + h_(longDate_(p.next.date)) + '</b>.' : '';
  const extra = list_('Still to do', p.tasks.map(t => '<b>' + h_(t.text) + '</b><br><span style="color:#5A6377;font-size:14px;">Where: ' + h_(t.where) + '</span>')) +
    '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1B1E33;">When the last one is done, ' + h_('Module ' + p.next.num) + ' opens by itself and you will get an email from me.</p>';
  const mail = mailParticipant_('Before ' + name + ': ' + n + ' thing' + (n > 1 ? 's' : '') + ' to finish', 'Before ' + name,
    ['You have <b>' + n + ' task' + (n > 1 ? 's' : '') + '</b> to finish before <b>' + h_(name) + '</b> opens in your portal.' + when], extra);
  return { sent: n, mail: mail };
}

/** Menu / editor: schedules the pending-tasks email for PENDING_REMINDER_AT. Run once. */
function schedulePendingReminder() {
  const at = new Date(PENDING_REMINDER_AT);
  if (at.getTime() <= Date.now()) { notify_('Pending-tasks email', 'The date set in PENDING_REMINDER_AT has passed. Nothing was scheduled.'); return 'past'; }
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendPendingReminder').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendPendingReminder').timeBased().at(at).create();
  const msg = 'The pending-tasks email is scheduled for ' + Utilities.formatDate(at, 'Asia/Manila', 'yyyy-MM-dd HH:mm') + ' (Manila).';
  notify_('Pending-tasks email', msg);
  return msg;
}

const PORTAL_URL_DEFAULT = 'https://www.coachjeffrosales.com/ema-portal';

function isYes_(v) { return /^(yes|y|true|released|open)$/i.test(String(v || '').trim()); }

function withMail_(data, mail) {
  if (!mail) return data;
  const out = {};
  Object.keys(data).forEach(k => { out[k] = data[k]; });
  out.mail = mail;
  return out;
}

function h_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/** Sends a branded email to the participant with the coach in cc. Returns {to, cc} or {error}. */
function mailParticipant_(subject, heading, paragraphs, extraHtml) {
  const cfg = getConfig_();
  const toList = participantEmails_(cfg), to = toList.join(',');
  const cc = String(cfg.COACH_EMAIL || COACH_EMAIL_DEFAULT).trim();
  if (!toList.length) return { error: 'No email sent: add PARTICIPANT_EMAIL on the Config tab.' };
  const first = String(cfg.PARTICIPANT_NAME || '').trim().split(/\s+/)[0] || 'there';
  const coach = String(cfg.COACH_NAME || 'Coach Jeff').trim();
  const url = normUrl_(cfg.PORTAL_URL) || PORTAL_URL_DEFAULT;
  const paras = paragraphs.map(p => '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1B1E33;">' + p + '</p>').join('');
  const html =
    '<div style="background:#F0F5FA;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">' +
    '<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #DCE3ED;">' +
    '<div style="background:#2F2B7F;padding:18px 24px;"><span style="color:#FFFFFF;font-size:20px;font-weight:bold;">coachjeff<span style="color:#F79E43;">.</span></span>' +
    '<div style="color:#C9CCF0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">' + h_(cfg.PROGRAM_TITLE || 'Leadership Accelerator') + '</div></div>' +
    '<div style="padding:24px;">' +
    '<h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;color:#2F2B7F;">' + h_(heading) + '</h1>' +
    '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1B1E33;">Hi ' + h_(first) + ',</p>' + paras + (extraHtml || '') +
    '<p style="margin:22px 0;"><a href="' + h_(url) + '" style="background:#F79E43;color:#221F63;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;display:inline-block;">Open my portal</a></p>' +
    '<p style="margin:0;font-size:15px;line-height:1.6;color:#1B1E33;">' + h_(coach) + '</p>' +
    '</div></div></div>';
  const text = 'Hi ' + first + ',\n\n' + paragraphs.map(p => String(p).replace(/<[^>]+>/g, '')).join('\n\n') +
    (extraHtml ? '\n\n' + String(extraHtml).replace(/<a href="([^"]+)"[^>]*>[^<]*<\/a>/g, '$1').replace(/<br\s*\/?>/g, '\n  ').replace(/<\/(p|div)>/g, '\n').replace(/<li[^>]*>/g, '\n- ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n') : '') +
    '\n\nOpen your portal: ' + url + '\n\n' + coach;
  try {
    const how = sendMail_({ to: to, cc: toList.some(t => t.toLowerCase() === cc.toLowerCase()) ? '' : cc, subject: subject, body: text, htmlBody: html, name: coach });
    return { to: toList.join(', '), cc: cc, from: how === 'from' ? sendFrom_() : '' };
  } catch (e) {
    Logger.log('Could not email the participant: ' + e.message);
    return { error: 'Saved, but the email could not be sent: ' + e.message };
  }
}

function list_(title, items) {
  items = items.filter(Boolean);
  if (!items.length) return '';
  return '<p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#2F2B7F;">' + h_(title) + '</p>' +
    '<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6;color:#1B1E33;">' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
}

/** Module opened or locked. */
function mailModuleChange_(num, open) {
  const m = rows_(SHEETS.MODULES).filter(r => String(r['Module']).trim() === num)[0] || {};
  const name = 'Module ' + num + (m['Title'] ? ': ' + String(m['Title']).trim() : '');
  if (!open) {
    return mailParticipant_('Update: ' + name + ' is closed for now', name + ' is closed for now',
      ['I have closed <b>' + h_(name) + '</b> in your portal for the moment. I will let you know as soon as it is open again.',
       'Anything you already wrote, like your goals and weekly ratings, stays saved.']);
  }
  const extra =
    list_('What is inside', [
      m['Focus'] ? '<b>Focus:</b> ' + h_(m['Focus']) : '',
      m['Key Topics'] ? '<b>Key topics:</b> ' + h_(String(m['Key Topics']).split(/\s*[\r\n]+\s*/).filter(Boolean).join(', ')) : '',
      m['Slides Link'] ? 'The module slides, ready to view or download' : '',
      m['Pre-work'] ? '<b>Before we meet:</b> ' + h_(m['Pre-work']) : ''
    ]) +
    (m['Weekly Challenge'] ? list_('Your challenge this week', [h_(m['Weekly Challenge'])]) : '');
  // The module's online session: its own link, or the fixed Google Meet link
  const cfg = getConfig_();
  const sess = rows_(SHEETS.SESSIONS).filter(r => new RegExp('^\\s*module\\s*' + num + '\\b', 'i').test(String(r['Title'] || '')))[0];
  const meet = (sess && normUrl_(sess['Location / Link'])) || normUrl_(cfg.BOOKING_LINK);
  let when = '';
  if (sess) {
    let b = null;
    try { b = (readRequests_(cfg).bookings || {})[String(sess['ID']).trim()]; } catch (e) { /* none */ }
    const iso = String(sess['Date (YYYY-MM-DD)'] || '').trim();
    when = b ? longDate_(b.date) + ', ' + fmt12_(b.start) + ' (Manila time)' :
      /^\d{4}-\d{2}-\d{2}$/.test(iso) ? longDate_(iso) + (sess['Time'] ? ', ' + sess['Time'] : '') : '';
  }
  const meetHtml = meet ?
    '<div style="background:#F0F5FA;border:1px solid #DCE3ED;border-radius:12px;padding:14px 16px;margin:0 0 14px;">' +
    '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#5A6377;">Online session</p>' +
    (when ? '<p style="margin:0 0 10px;font-size:15px;color:#1B1E33;"><b>' + h_(when) + '</b></p>' : '') +
    '<p style="margin:0;"><a href="' + h_(meet) + '" style="background:#2F2B7F;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:10px 20px;border-radius:999px;display:inline-block;font-size:14px;">Join Google Meet</a></p></div>' : '';
  return mailParticipant_(name + ' is now open', name + ' is now open',
    ['<b>' + h_(name) + '</b> is now open in your portal, in the Learn tab.',
     'Take a look before our session so we can use our time together well.'], meetHtml + extra);
}

/** Session marked done: thank-you plus what comes next. */
function mailSessionDone_(id) {
  const all = rows_(SHEETS.SESSIONS);
  const i = all.findIndex(r => String(r['ID']).trim() === id);
  const s = all[i] || {};
  const title = String(s['Title'] || 'our session').trim();
  const cfg = getConfig_();
  let bookings = {};
  try { bookings = readRequests_(cfg).bookings || {}; } catch (e) { /* no requests tab */ }
  const next = all.slice(i + 1).filter(r => !/^(done|completed?|cancell?ed|missed)\b/i.test(String(r['Status'] || '').trim()))[0];
  let nextLine = '';
  if (next) {
    const b = bookings[String(next['ID']).trim()];
    const d = b ? longDate_(b.date) + ', ' + fmt12_(b.start) : (/^\d{4}-\d{2}-\d{2}$/.test(String(next['Date (YYYY-MM-DD)'] || '').trim()) ? longDate_(String(next['Date (YYYY-MM-DD)']).trim()) + (next['Time'] ? ', ' + next['Time'] : '') : '');
    nextLine = '<b>Next up:</b> ' + h_(next['Title']) + (d ? ' on ' + h_(d) + (/\(/.test(d) ? '' : ' (Manila time)') : '. You can book a time for it in your portal');
  }
  const extra = list_('Before our next session', [
    'In your weekly rating, tell me what you took away and one thing you will try this week.',
    'Update your goal progress in the Growth tab.',
    nextLine
  ]);
  return mailParticipant_('Thank you: ' + title + ' is complete', title + ' is complete',
    ['Thank you for our <b>' + h_(title) + '</b>. I have marked it as done in your portal, so your journey board is up to date.'], extra);
}

/* ---------------- Journey ---------------- */

function readJourney_() {
  const ss = getSS_(false);
  if (!ss.getSheetByName(SHEETS.JOURNEY)) return [];
  return rows_(SHEETS.JOURNEY).map(r => ({
    week: String(r['Week']).trim(), item: String(r['Item'] || '').trim(), type: String(r['Type'] || '').trim(),
    session: String(r['Session ID'] || '').trim(), done: yes_(r['Done'])
  })).filter(j => j.week && j.item);
}

/** Coach: tick or untick a journey item that has no session (row by week and item). */
function coachSetJourneyDone(key, week, item, done) {
  checkCoach_(key);
  withLock_(() => setByKey_(SHEETS.JOURNEY, ['Week', 'Item'], [String(week), String(item)], 'Done', done ? 'Yes' : ''));
  return coachData(key);
}
