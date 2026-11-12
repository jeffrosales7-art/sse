/**
 * Coach Jeff Rosales — Readiness Assessments (Google Apps Script web app)
 *
 * One project serves both assessments:
 *   .../exec?a=manager   → New Manager Readiness Assessment
 *   .../exec?a=grad      → Workplace Readiness Assessment
 *
 * What it does:
 *   - Shows the assessment (Index.html), embeddable in Wix like the gVIP pages.
 *   - Scores answers on the server, shows the result instantly.
 *   - Saves every response to a Google Sheet.
 *   - Emails the result immediately, then follow-ups on day 2, 5 and 9.
 *   - Every email has an unsubscribe link.
 *
 * Setup: see SETUP.md in this folder.
 */

const CONFIG = {
  bookingUrl: 'https://www.coachjeffrosales.com/book',
  siteUrl: 'https://www.coachjeffrosales.com',
  senderName: 'Jeff Rosales',
  signature: 'Jeff Rosales<br>Leadership &amp; Career Coach · <a href="https://www.coachjeffrosales.com">coachjeffrosales.com</a>',
  sheetName: 'Responses',
  followUpDays: [2, 5, 9],   // emails 2, 3 and 4
  notifyOwner: true          // send yourself a short note for each new response
};

const SCALE = ['Rarely', 'Occasionally', 'Sometimes', 'Often', 'Almost always'];

const ASSESSMENTS = {
  manager: {
    key: 'manager',
    name: 'New Manager Readiness Assessment',
    label: 'FREE · 3 MINUTES · INSTANT RESULTS',
    headline: 'How ready are you to lead a team?',
    intro: 'Most new managers are promoted for being great at their job, then measured by what their team delivers. This 3-minute assessment shows where you stand on the five shifts that matter most, with practical next steps.',
    profile: [
      { id: 'stage', q: 'Where are you right now?', type: 'choice', required: true,
        options: ['About to become a manager', 'Manager for less than 1 year', 'Manager for 1–3 years', 'HR or L&D, assessing for my team'] },
      { id: 'teamSize', q: 'How many people do you lead (or will you lead)?', type: 'choice', required: true,
        options: ['None yet', '1–3', '4–8', '9 or more'] },
      { id: 'challenge', q: "What's your biggest leadership challenge right now? (optional)", type: 'text', required: false }
    ],
    areas: ['Mindset shift', 'Delegation', 'Feedback', 'Team clarity', 'Self-management & influence'],
    statements: [
      { a: 0, t: 'I measure my success by what my team achieves, not only by my own output.' },
      { a: 0, t: 'When a team member is struggling, I coach them instead of jumping in to do the work myself.' },
      { a: 1, t: 'I delegate work with a clear outcome, a deadline and the authority to make decisions.' },
      { a: 1, t: 'I follow up on delegated work without micromanaging.' },
      { a: 2, t: 'I give specific, timely feedback, both positive and corrective.' },
      { a: 2, t: 'I address performance issues early instead of hoping they resolve themselves.' },
      { a: 3, t: 'Everyone on my team knows their priorities and how their work connects to our goals.' },
      { a: 3, t: 'I hold regular one-on-ones that focus on the person, not just task updates.' },
      { a: 4, t: 'I protect time in my week for leading (planning, coaching, thinking), not just doing.' },
      { a: 4, t: 'I can influence my peers and my own manager to get support and resources for my team.' }
    ],
    bands: [
      { max: 24, name: 'The Expert in Transition',
        text: "You're still leading mostly through your own expertise, which is completely normal early on, and exactly where many new managers get stuck. The biggest gains will come from shifting how you define success and from delegating with clarity.",
        tip: 'Pick one task you usually do yourself and delegate it with a clear outcome, a deadline and the decision rights. Then resist taking it back.' },
      { max: 37, name: 'The Developing Leader',
        text: "You've made the shift in some areas but not yet in all of them. You likely have a few strong habits (often feedback or one-on-ones) and a few gaps that cost you time and energy every week.",
        tip: 'Look at your two lowest-scoring areas. Choose one, and set a single, visible habit for it, for example a weekly 20-minute one-on-one with each team member.' },
      { max: 50, name: 'Ready to Accelerate',
        text: 'You have solid leadership foundations. Your next step is moving from good habits to a repeatable leadership system, and building influence beyond your own team.',
        tip: 'Ask two team members and one peer: "What\'s one thing I could do to make your work easier?" Act on one answer and tell them you did.' }
    ],
    resultCta: 'Want to talk through your results? Book a free 30-minute discovery call.',
    emails: [
      { subject: 'Your New Manager Readiness results',
        body: '<p>Hi {name},</p><p>Thanks for taking the New Manager Readiness Assessment. Your score: <b>{score}/50 — {band}</b>.</p><p>{bandText}</p>{areaTable}<p><b>One thing to try this week:</b> {tip}</p><p>Over the next week or so I\'ll send you three short, practical notes on the shifts new managers find hardest. If you\'d rather talk through your results now, you can <a href="{book}">book a free 30-minute call</a>.</p>' },
      { subject: 'Why great performers struggle as new managers',
        body: '<p>Hi {name},</p><p>Most new managers are promoted because they were excellent at the work. Then, overnight, they\'re measured on what other people deliver.</p><p>The trap: under pressure, you go back to what made you successful, which is doing the work yourself. Your team learns to wait for you, and you end up with two jobs.</p><p>The fix starts with one question each morning: <i>"What will my team achieve today because of something I did?"</i></p><p>P.S. If this sounds familiar, a <a href="{book}">free discovery call</a> is a good place to start.</p>' },
      { subject: 'The delegation mistake almost every new manager makes',
        body: '<p>Hi {name},</p><p>Delegating isn\'t handing off a task. It\'s handing off an outcome, with three things made clear:</p><ol><li><b>What "done" looks like</b> (the result, not the steps)</li><li><b>By when</b></li><li><b>What they can decide without asking you</b></li></ol><p>Skip the third one, and the work comes back to your desk.</p><p>This is one of the tools we build in the <a href="{site}/emerging-manager-accelerator">Emerging Manager Accelerator™</a>, an eight-week program with live sessions, one-to-one coaching and a real workplace project. Here\'s what one participant said:</p><p><i>"Through Jeff\'s structured and thought-provoking approach, I identified my strengths, uncovered blind spots, and gained practical direction on how to grow as a leader."</i> — Mito, Finance Associate</p>' },
      { subject: 'Shall we talk about your team?',
        body: '<p>Hi {name},</p><p>You took the assessment because leading people matters to you. That\'s already a good sign.</p><p>If you\'d like to talk through your results, your team and what would help most right now, I offer a free 30-minute discovery call. No pressure and no obligation, just a focused conversation.</p><p><a href="{book}">Pick a time that suits you</a></p><p>P.S. In HR or L&amp;D? I also run the program as a dedicated cohort for organizations: <a href="{site}/for-organizations">coachjeffrosales.com/for-organizations</a></p>' }
    ]
  },

  grad: {
    key: 'grad',
    name: 'Workplace Readiness Assessment',
    label: 'FREE · 3 MINUTES · INSTANT RESULTS',
    headline: 'Are you ready for your first job?',
    intro: 'A degree gets you hired. Professional maturity keeps you there. Find out how ready you are for the realities of work in five areas employers care about, with practical tips to close the gaps.',
    profile: [
      { id: 'stage', q: 'Which best describes you?', type: 'choice', required: true,
        options: ['Graduating within 12 months', 'Graduated less than 1 year ago', 'Working for 1–2 years', 'Parent of a student or graduate', 'University staff'],
        note: { when: ['Parent of a student or graduate', 'University staff'], text: 'Answer the statements as you think your graduate or student would.' } },
      { id: 'field', q: "What's your field of study or work? (optional)", type: 'text', required: false },
      { id: 'challenge', q: 'What worries you most about starting work? (optional)', type: 'text', required: false }
    ],
    areas: ['Ownership', 'Communication', 'Self-management', 'Working with others', 'Career direction'],
    statements: [
      { a: 0, t: 'I finish what I commit to without needing reminders.' },
      { a: 0, t: 'When I make a mistake, I own it and fix it instead of explaining it away.' },
      { a: 1, t: 'I write clear, professional emails and messages.' },
      { a: 1, t: 'I can explain my ideas confidently in meetings or presentations.' },
      { a: 2, t: 'I plan my week and meet deadlines without last-minute rushes.' },
      { a: 2, t: "I stay composed and focused when I'm under pressure." },
      { a: 3, t: "I ask for feedback and act on it, even when it's uncomfortable." },
      { a: 3, t: 'I work well with people whose style or background is different from mine.' },
      { a: 4, t: 'I know what kind of role and workplace fits my strengths and values.' },
      { a: 4, t: 'I can clearly describe what I offer an employer, with real examples.' }
    ],
    bands: [
      { max: 24, name: 'Getting Started',
        text: "You're at the beginning of the move from student to professional, and that's okay. Most graduates are never taught these skills directly. Building a few habits now will make your first year much easier.",
        tip: "Choose one commitment you've made (to a teacher, a group or a family member) and deliver it early, without a reminder. Notice how people respond." },
      { max: 37, name: 'Building Foundations',
        text: 'You have real strengths, and some clear gaps that employers will notice in your first months. The good news: these are learnable, and small habits make a big difference.',
        tip: 'Look at your two lowest-scoring areas. Ask someone who knows you well for one specific example of how you could improve in one of them.' },
      { max: 50, name: 'Workplace Ready',
        text: 'You already show many of the behaviors employers expect from day one. Your next step is direction: being clear about where you want to grow, and how to describe your value.',
        tip: 'Write three sentences that answer "What do I offer an employer?", each with a real example. Practice saying them out loud.' }
    ],
    resultCta: 'Want help preparing for your first job? Book a free 30-minute discovery call.',
    emails: [
      { subject: 'Your Workplace Readiness results',
        body: '<p>Hi {name},</p><p>Thanks for taking the Workplace Readiness Assessment. Your score: <b>{score}/50 — {band}</b>.</p><p>{bandText}</p>{areaTable}<p><b>One thing to try this week:</b> {tip}</p><p>Over the next week or so I\'ll send you three short notes on what employers really expect from new graduates. If you\'d like to talk sooner, you can <a href="{book}">book a free 30-minute call</a>.</p>' },
      { subject: 'What employers notice in your first 90 days',
        body: '<p>Hi {name},</p><p>After more than 12 years teaching at UA&amp;P and 20+ years in corporate leadership, I\'ve seen what separates graduates who thrive from those who struggle. It\'s rarely technical knowledge.</p><p>It\'s the small things: replying on time, owning mistakes, asking good questions, and finishing what you said you would.</p><p>Managers form their impression of you in the first 90 days. The good news is that every one of those behaviors can be learned.</p><p>P.S. Want to prepare properly? <a href="{book}">Book a free call</a>.</p>' },
      { subject: 'A degree opens the door. Professional maturity keeps you there.',
        body: '<p>Hi {name},</p><p>That\'s the idea behind the <a href="{site}/early-career-foundations">Early Career Foundation™</a>, a six-session program that builds the mindset, behaviors and self-leadership employers expect from day one. It includes workshops, one-on-one coaching, and a personal Career Blueprint you keep.</p><p>It\'s available for individuals, small groups and university cohorts.</p><p>One client described it like this:</p><p><i>"Through our sessions, I developed a clearer mindset, stronger discipline, and a renewed commitment to my education and career path."</i> — Brandon</p>' },
      { subject: "Let's map your first step",
        body: '<p>Hi {name},</p><p>If you\'re about to start work, or you\'ve just started, a short conversation can save you months of trial and error.</p><p>I offer a free 30-minute discovery call to talk through your results, your goals and what kind of support would help. No pressure and no obligation.</p><p><a href="{book}">Pick a time</a></p><p>P.S. Parents and university staff are welcome to book too.</p>' }
    ]
  }
};

const HEADERS = ['Timestamp', 'Assessment', 'First name', 'Email', 'Stage', 'Detail 1', 'Detail 2',
  'Score', 'Result', 'Area scores', 'Answers', 'Consent', 'Id', 'Emails sent', 'Unsubscribed'];
const COL = { ts: 1, assessment: 2, name: 3, email: 4, emailsSent: 14, unsub: 15, id: 13 };

/* ------------------------------------------------------------------ */
/* One-time setup: run this once from the editor (Run → setup).        */
/* ------------------------------------------------------------------ */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (!id) {
    const ss = SpreadsheetApp.create('Coach Jeff — Assessment Responses');
    const sh = ss.getSheets()[0];
    sh.setName(CONFIG.sheetName);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    props.setProperty('SHEET_ID', ss.getId());
    id = ss.getId();
  }
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendFollowUps')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendFollowUps').timeBased().everyDays(1).atHour(9).create();
  Logger.log('Setup complete. Responses sheet: https://docs.google.com/spreadsheets/d/' + id);
}

function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Run setup() first.');
  return SpreadsheetApp.openById(id).getSheetByName(CONFIG.sheetName);
}

/* ------------------------------------------------------------------ */
/* Web app                                                              */
/* ------------------------------------------------------------------ */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.u) return unsubscribePage_(p.u);
  const a = ASSESSMENTS[p.a] ? p.a : 'manager';
  const t = HtmlService.createTemplateFromFile('Index');
  t.cfgJson = JSON.stringify(publicConfig_(ASSESSMENTS[a]));
  return t.evaluate()
    .setTitle(ASSESSMENTS[a].name)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function publicConfig_(A) {
  return {
    key: A.key, name: A.name, label: A.label, headline: A.headline, intro: A.intro,
    profile: A.profile, areas: A.areas, scale: SCALE,
    statements: A.statements.map(s => s.t),
    bookingUrl: CONFIG.bookingUrl, resultCta: A.resultCta
  };
}

/** Called from the page with google.script.run.submit(payload). */
function submit(payload) {
  const A = ASSESSMENTS[payload && payload.key];
  if (!A) throw new Error('Unknown assessment.');

  const name = clean_(payload.name, 60);
  const email = clean_(payload.email, 120).toLowerCase();
  if (!name) throw new Error('Please enter your first name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (payload.consent !== true) throw new Error('Please tick the consent box to receive your results.');

  const answers = (payload.answers || []).map(Number);
  if (answers.length !== A.statements.length || answers.some(v => !(v >= 1 && v <= 5))) {
    throw new Error('Please answer all 10 statements.');
  }
  const profile = payload.profile || {};
  for (const q of A.profile) {
    if (q.required && !clean_(profile[q.id], 200)) throw new Error('Please answer: ' + q.q);
  }

  const score = answers.reduce((s, v) => s + v, 0);
  const band = A.bands.find(b => score <= b.max);
  const areaScores = A.areas.map((area, i) => {
    const vals = A.statements.map((s, j) => (s.a === i ? answers[j] : null)).filter(v => v !== null);
    return { area: area, score: vals.reduce((s, v) => s + v, 0), max: vals.length * 5 };
  });

  const id = Utilities.getUuid();
  const profileVals = A.profile.map(q => clean_(profile[q.id], 300));
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([
      new Date(), A.name, safeCell_(name), safeCell_(email),
      safeCell_(profileVals[0] || ''), safeCell_(profileVals[1] || ''), safeCell_(profileVals[2] || ''),
      score, band.name,
      areaScores.map(x => x.area + ': ' + x.score + '/' + x.max).join(' | '),
      answers.join(','), 'Yes', id, 1, ''
    ]);
  } finally {
    lock.releaseLock();
  }

  sendEmail_(A, 0, { name: name, email: email, id: id, score: score, band: band, areaScores: areaScores });

  if (CONFIG.notifyOwner) {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'New assessment: ' + A.name + ' — ' + name + ' (' + score + '/50)',
      htmlBody: '<p><b>' + esc_(name) + '</b> (' + esc_(email) + ') scored <b>' + score + '/50 — ' + esc_(band.name) + '</b>.</p>' +
        '<p>' + A.profile.map((q, i) => esc_(q.q) + ': <b>' + esc_(profileVals[i] || '—') + '</b>').join('<br>') + '</p>',
      name: CONFIG.senderName
    });
  }

  return { score: score, band: band.name, text: band.text, tip: band.tip, areaScores: areaScores };
}

/* ------------------------------------------------------------------ */
/* Follow-up emails (runs daily via trigger)                           */
/* ------------------------------------------------------------------ */
function sendFollowUps() {
  const sh = sheet_();
  const rows = sh.getDataRange().getValues();
  const now = new Date();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row[COL.unsub - 1]) continue;
    const A = Object.values(ASSESSMENTS).find(x => x.name === row[COL.assessment - 1]);
    if (!A) continue;
    const sent = Number(row[COL.emailsSent - 1]) || 0;            // emails already sent (1 = result email)
    if (sent >= A.emails.length) continue;
    const dueDay = CONFIG.followUpDays[sent - 1];
    const ageDays = (now - new Date(row[COL.ts - 1])) / 86400000;
    if (ageDays < dueDay) continue;
    try {
      sendEmail_(A, sent, { name: String(row[COL.name - 1]).replace(/^'/, ''),
        email: String(row[COL.email - 1]).replace(/^'/, ''), id: row[COL.id - 1] });
      sh.getRange(r + 1, COL.emailsSent).setValue(sent + 1);
    } catch (err) {
      Logger.log('Follow-up failed for row ' + (r + 1) + ': ' + err);
    }
  }
}

function sendEmail_(A, index, d) {
  const tpl = A.emails[index];
  const unsubUrl = ScriptApp.getService().getUrl() + '?u=' + encodeURIComponent(d.id);
  const areaTable = d.areaScores
    ? '<table style="border-collapse:collapse;margin:8px 0">' + d.areaScores.map(x =>
        '<tr><td style="padding:4px 12px 4px 0">' + esc_(x.area) + '</td><td style="padding:4px 0"><b>' + x.score + '/' + x.max + '</b></td></tr>').join('') + '</table>'
    : '';
  const body = tpl.body
    .replace(/\{name\}/g, esc_(d.name))
    .replace(/\{score\}/g, d.score != null ? String(d.score) : '')
    .replace(/\{band\}/g, d.band ? esc_(d.band.name) : '')
    .replace(/\{bandText\}/g, d.band ? esc_(d.band.text) : '')
    .replace(/\{tip\}/g, d.band ? esc_(d.band.tip) : '')
    .replace(/\{areaTable\}/g, areaTable)
    .replace(/\{book\}/g, CONFIG.bookingUrl)
    .replace(/\{site\}/g, CONFIG.siteUrl);
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222;max-width:600px">' +
    body + '<p>' + CONFIG.signature + '</p>' +
    '<p style="font-size:12px;color:#777">You received this because you took the ' + esc_(A.name) +
    ' on coachjeffrosales.com. <a href="' + unsubUrl + '">Unsubscribe</a>.</p></div>';
  MailApp.sendEmail({ to: d.email, subject: tpl.subject, htmlBody: html, name: CONFIG.senderName });
}

function unsubscribePage_(id) {
  const sh = sheet_();
  const ids = sh.getRange(2, COL.id, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
  let found = false;
  ids.forEach((v, i) => {
    if (String(v[0]) === String(id)) { sh.getRange(i + 2, COL.unsub).setValue(new Date()); found = true; }
  });
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;text-align:center">' +
    (found ? '<h2>You\'re unsubscribed.</h2><p>You won\'t receive any more emails from this assessment.</p>'
           : '<h2>Link not recognized.</h2><p>If you keep receiving emails, just reply to one and ask to be removed.</p>') +
    '<p><a href="' + CONFIG.siteUrl + '">Back to coachjeffrosales.com</a></p></div>')
    .setTitle('Unsubscribe');
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function safeCell_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }   // stop spreadsheet formula injection

/** Optional: send yourself a test of every email for one assessment. */
function testEmails() {
  const me = Session.getEffectiveUser().getEmail();
  ['manager', 'grad'].forEach(k => {
    const A = ASSESSMENTS[k];
    const band = A.bands[1];
    const areaScores = A.areas.map(a => ({ area: a, score: 7, max: 10 }));
    A.emails.forEach((_, i) => sendEmail_(A, i, { name: 'Jeff', email: me, id: 'test', score: 33, band: band, areaScores: areaScores }));
  });
}
