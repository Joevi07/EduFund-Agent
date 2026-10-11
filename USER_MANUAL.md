# EduFund user manual

## Start the application

Open two terminals in `D:\EduFund`.

1. Start the API: `py -3.13 backend\main.py`
2. Start the website: `cd frontend` then `npm run dev`
3. Open the Vite address printed in the second terminal (normally `http://localhost:5173`).

If account creation says **“services are offline”**, the first terminal is not running. Start the API and refresh the page.

## Student journey

1. **Create account** — use your name, email, and a password of at least eight characters.
2. **Action Center** — use the dashboard's Next Best Action to move the most relevant active opportunity forward. Application Readiness equally averages profile completion, eligibility evaluation availability, document-checklist completion, and draft availability; it is not an award probability.
3. **Profile Agent** — add your study level, course, GPA, location, family-income range, annual education cost, confirmed aid, and achievements. Select **Save profile**.
4. **Funding Planner** — review your remaining funding gap, the non-probabilistic **Funding Coverage Outlook**, and the 0–100 **Application Priority Score**. The outlook compares listed scholarship amounts with the remaining gap after confirmed aid; awards are not guaranteed. The priority score combines eligibility or match strength (55%), funding relevance (25%), and deadline urgency (20%). It ranks application effort; it is not an award probability or expected monetary return.
5. **Opportunity Market** — filter the curated catalogue. Use each official-source link to confirm the current rules, dates, documents, and amount with the provider.
6. **Autopilot Studio** — choose an opportunity, use **Document Readiness** to match selected filenames against the required-document checklist, and edit the draft. The readiness percentage is checklist completion only; EduFund does not inspect file contents or verify authenticity. Never submit a statement you have not personally reviewed.
7. **Pipeline & Deadlines** — move each item through Discovered, Planned, Drafting, Ready to Submit, and Submitted. The **Document Reuse Map** shows documents that can support more than one active application, while the **Deadline Collision Detector** highlights deadlines that fall within the same seven-day window. Begin with the nearest deadline.

### Verify an essay before authorising it

In **Autopilot Studio**, select **Check profile evidence** after editing the draft. The Evidence Checker compares direct claims in the essay with the academic interests and achievements saved in your profile. Review every amber claim, add verifiable evidence, or rewrite it in your own words. It is a safeguard, not proof of eligibility or fact-checking against external sources.

## Important safety notes

- EduFund screens opportunities from your profile but cannot decide final eligibility; the provider makes that decision.
- Dates and award values can change each academic cycle. The official source is authoritative.
- Do not upload passwords, OTPs, bank PINs, or Aadhaar numbers to any chat or document field.
- The application is intentionally human-controlled: it prepares a packet but does not submit forms to external providers.

## Administrator journey

An administrator can sign in and open **Admin Console** to view registered users, the programme catalogue count, and application activity. Set `EDUFUND_ADMIN_EMAIL` and `EDUFUND_ADMIN_PASSWORD` before the first backend start to configure the initial administrator account.
