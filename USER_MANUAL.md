# EduFund user manual

## Start the application

Open two terminals in `D:\EduFund`.

1. Start the API: `py -3.13 backend\main.py`
2. Start the website: `cd frontend` then `npm run dev`
3. Open the Vite address printed in the second terminal (normally `http://localhost:5173`).

If account creation says **“services are offline”**, the first terminal is not running. Start the API and refresh the page.

## Student journey

1. **Create account** — use your name, email, and a password of at least eight characters.
2. **Profile Agent** — add your study level, course, GPA, location, family-income range, annual education cost, confirmed aid, and achievements. Select **Save profile**.
3. **Funding Planner** — review your remaining funding gap, expected-value priority order, and the **Funding Confidence Meter**. Guaranteed funding is already confirmed; probable and possible figures are planning estimates. Treat all estimates as a planning aid, not a guarantee of an award.
4. **Opportunity Market** — filter the verified catalogue. Use the external-link icon on every card to open the programme's official website and confirm the current rules, dates, documents, and amount.
5. **Autopilot Studio** — choose an opportunity, use the checklist, audit files, and edit the draft. Never submit a statement you have not personally reviewed.
6. **Pipeline & Deadlines** — move each item through Discovered, Planned, Drafting, Ready to Submit, and Submitted. The **Document Reuse Map** shows documents that can support more than one active application, while the **Deadline Collision Detector** highlights deadlines that fall within the same seven-day window. Begin with the nearest deadline.

### Verify an essay before authorising it

In **Autopilot Studio**, select **Check profile evidence** after editing the draft. The Evidence Checker compares direct claims in the essay with the academic interests and achievements saved in your profile. Review every amber claim, add verifiable evidence, or rewrite it in your own words. It is a safeguard, not proof of eligibility or fact-checking against external sources.

## Important safety notes

- EduFund screens opportunities from your profile but cannot decide final eligibility; the provider makes that decision.
- Dates and award values can change each academic cycle. The official source is authoritative.
- Do not upload passwords, OTPs, bank PINs, or Aadhaar numbers to any chat or document field.
- The application is intentionally human-controlled: it prepares a packet but does not submit forms to external providers.

## Administrator journey

An administrator can sign in and open **Admin Console** to view registered users, the programme catalogue count, and application activity. Set `EDUFUND_ADMIN_EMAIL` and `EDUFUND_ADMIN_PASSWORD` before the first backend start to configure the initial administrator account.
