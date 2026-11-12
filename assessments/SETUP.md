# Setting up the assessments (about 15 minutes)

One Google Apps Script project runs both assessments:

- `…/exec?a=manager` → New Manager Readiness Assessment
- `…/exec?a=grad` → Workplace Readiness Assessment

## 1. Create the Apps Script project

1. Sign in to the Google account the emails should come from (recommended: your personal Gmail).
2. Go to https://script.google.com → **New project**. Name it `Coach Jeff Assessments`.
3. Replace everything in `Code.gs` with the contents of `Code.gs` from this folder.
4. Click **+** next to Files → **HTML** → name it `Index` (exactly). Replace its contents with `Index.html` from this folder.
5. Click **Save**.

## 2. Run setup once

1. In the function dropdown at the top, choose `setup` and click **Run**.
2. Approve the permissions Google asks for (Sheets, Gmail sending, triggers). If it says "Google hasn't verified this app", click **Advanced → Go to Coach Jeff Assessments**. It's your own script.
3. The log shows a link to the new **Coach Jeff — Assessment Responses** sheet. Bookmark it.
4. Optional: choose `testEmails` and click **Run** to receive all 8 emails yourself and check the wording.

## 3. Deploy as a web app

1. Click **Deploy → New deployment** → type **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

Your two assessment links are:

- `<Web app URL>?a=manager`
- `<Web app URL>?a=grad`

## 4. Put them on the website (Wix Editor)

Same method as the gVIP pages:

1. Add a new page **New Manager Readiness Assessment** (URL slug `manager-assessment`).
2. Add **Embed Code → Embed a site** (or HTML iframe) and set the website address to `<Web app URL>?a=manager`. Make it full width and about 2,600 px tall on desktop (taller on mobile) so there's no inner scrollbar.
3. Repeat for **Workplace Readiness Assessment** (slug `grad-assessment`) with `<Web app URL>?a=grad`.
4. On the Emerging Manager Accelerator™ and Early Career Foundation™ pages, add a button: **Take the Free 3-Minute Assessment** → the matching new page.
5. Publish (without changing any page's SEO title or description).

## Changing things later

- Edit wording, questions or emails in `Code.gs` (the `ASSESSMENTS` section), then **Deploy → Manage deployments → Edit → Version: New version → Deploy**. The URL stays the same.
- Follow-up timing: `CONFIG.followUpDays` (default days 2, 5 and 9). Emails go out once a day at around 9 AM.
- Turn off "new response" notifications to yourself: set `notifyOwner: false`.
- Free Gmail accounts can send about 100 emails a day, which is plenty at current traffic.
