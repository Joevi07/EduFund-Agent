# 🎓 EduFund Student User Manual & Step-by-Step Guide

Welcome to **EduFund** — your AI-powered financial planning & application autopilot system for education funding. This manual provides a clear, step-by-step guide on how to use every feature on the platform to discover funding, eliminate your education funding gap, and submit applications easily.

---

## 🏁 Quick Navigation Overview

| Step | Goal | Screen / Tab | Action |
| :--- | :--- | :--- | :--- |
| **Step 1** | Configure Academic & Financial Baseline | **Profile Agent** | Enter your GPA, major, family income, target annual budget, and achievements. |
| **Step 2** | Inspect Education Funding Gap & Confidence | **Main Dashboard** | View your `Total Cost - Confirmed Aid = Funding Gap` gauge and Confidence Score. |
| **Step 3** | Explore & Filter Funding Opportunities | **Opportunity Market** | Search scholarships, grants, fee waivers, and inspect line-by-line eligibility reasoning. |
| **Step 4** | Build & Simulate Funding Strategy | **Funding Planner** | Review your Expected Value ($EV$) portfolio stack and run scenario simulation sliders. |
| **Step 5** | Draft & Refine Application Statements | **Autopilot Studio** | Generate custom SOP drafts, refine tone/length, and audit document attachments. |
| **Step 6** | Verify Fact Claims & Human Review | **Autopilot Studio** | Run AI Essay Evidence Checker and complete human safety authorization. |
| **Step 7** | Track Deadlines & Repetition Reduction | **Pipeline & Deadlines** | Monitor closing dates, check document reuse mapping, and resolve deadline collisions. |

---

## 📘 Detailed Step-by-Step Walkthrough

### 1️⃣ Step 1: Configure Your Profile Baseline
1. Click **Profile Agent** on the left menu sidebar.
2. Input your **Academic Credentials**: Full Name, Education Level (Undergraduate/Master's/High School), Field of Study, Cumulative GPA (e.g. 3.8/4.0), and Achievements.
3. Input your **FinTech Financial Baseline**:
   - **Target Annual Education Cost**: Total annual tuition, living, and academic expenses (e.g. ₹1,20,000 or $1,445).
   - **Confirmed Aid**: Confirmed family support or institutional scholarships (e.g. ₹60,000).
   - **Annual Family Income**: Used for need-based eligibility reasoning.
4. Click **Update Profile & Recalculate Strategy**. EduFund instantly updates your funding gap and portfolio stack!

---

### 2️⃣ Step 2: Check Your Command Center Dashboard
1. Click **Main Dashboard** on the sidebar.
2. View the **Vibrant KPI Cards**:
   - **Cyan Card**: Total Estimated Education Cost.
   - **Red Card**: Remaining Education Funding Gap ($\text{Total Cost} - \text{Confirmed Aid}$).
   - **Amber Card**: Confirmed Aid & Support.
   - **Green Card**: Strategy Potential Coverage.
3. Check the **Funding Progress Donut Ring** and **Funding Confidence Meter**:
   - Displays your aggregate statistical confidence rating (e.g. `88% HIGH CONFIDENCE`).
   - Lists positive drivers (e.g. 100% gap coverage potential) and risk alerts.
4. Inspect the **Multi-Agent Execution Flow Node Graph** to see how data flows from `Profile Agent ➔ Discovery ➔ Eligibility ➔ Planner ➔ Autopilot ➔ Deadline`.

---

### 3️⃣ Step 3: Discover Opportunities & Inspect Eligibility Reasoning
1. Click **Opportunity Market** on the sidebar.
2. Filter opportunities by category tabs: `All`, `Scholarship`, `Fee Waiver`, `Grant`, `Competition`, `Institutional Aid`.
3. Use the search bar to find targeted grants (e.g., *"Reliance STEM"*, *"Fee Waiver"*, *"Google Grant"*).
4. Click **Inspect Reasoning** on any opportunity card:
   - Opens a transparent line-by-line checklist evaluated by **Agent 2 (Eligibility Agent)**.
   - Shows checkmarks (`✓` / `✗`) for Degree level, GPA threshold, Income limit, Field of study, and Residency constraints.

---

### 4️⃣ Step 4: Formulate Strategy & Run Scenario Simulations
1. Click **Funding Planner** on the sidebar.
2. Review the **Expected Value ($EV$) Strategy Portfolio Table**:
   - Ranked by Expected Value ($EV = \text{Amount} \times \text{Match Prob} \times \text{Urgency Weight}$).
   - Shows exact combination of applications required to reduce your remaining gap to ₹0.
3. Use the **Strategy Scenario Simulator**:
   - Adjust sliders: *"Increased Family/Inst. Aid"* or *"Work-Study / Assistantship Aid"*.
   - Click **Re-Solve Strategy Scenario** to test "What-If" financial models in real time.

---

### 5️⃣ Step 5: Application Autopilot & AI Essay Studio
1. Click **Autopilot Studio** (or click **Autopilot** on any opportunity card).
2. **Missing Info & Document Audit**:
   - View missing requirements flagged by the agent.
   - Attach mock files (`marksheet.pdf`, `income_cert.pdf`) to test the **Document Auditor**.
3. **AI Essay Refiner Toolbar**:
   - Click preset refinement buttons:
     - `⚡ High Impact & Persuasive`: Enhances hackathon wins & leadership impact.
     - `🎓 Academic Rigor`: Focuses on technical complexity and research methodology.
     - `✂️ Shorten (<100w)`: Generates concise executive summaries.
   - Track live word count and estimated reading time.

---

### 6️⃣ Step 6: AI Essay Evidence Checker & Safety Control
1. In **Autopilot Studio**, click **Verify Essay Claims**.
2. **Agent 5 (Autopilot)** cross-references every factual statement in your essay draft against your student profile:
   - Green `✓ VALIDATED`: Factual claims backed by profile data (e.g. GPA score, hackathon awards).
   - Amber `⚠️ UNVERIFIED`: Statements mentioning claims not found in your profile.
3. **Human Safety Protocol Sign-off**:
   - Check the box: *"I have reviewed the draft and authorize application preparation"*.
   - Click **Authorize & Finalize Application Packet**. (Safety Control Guarantee: AI never submits financial documents automatically without student review).

---

### 7️⃣ Step 7: Manage Deadlines & Document Reuse
1. Click **Pipeline & Deadlines** on the sidebar.
2. **Document Reuse Map**:
   - View which documents (e.g. Income Proof, Marksheets) satisfy multiple applications.
   - Check total repetitive effort hours saved (e.g., *"1 Income Certificate satisfies 3 applications!"*).
3. **Deadline Collision Detector**:
   - Audits closing dates to highlight applications closing within tight 3–7 day windows (`HIGH_COLLISION` / `MODERATE_COLLISION`).
4. **Kanban Pipeline**: Track applications across status stages (`Discovered`, `Planner Stack`, `Autopilot Drafting`, `Submitted`).

---

## 🌐 Quick System Links & Support

- **React Dashboard**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Dual Currency Switcher**: Click **INR (₹)** or **USD ($)** in the top bar anytime to toggle financial values.
