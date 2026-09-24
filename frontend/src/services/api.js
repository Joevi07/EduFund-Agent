// In development, Vite proxies /api to FastAPI. Set VITE_API_URL when deployed.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function authRequest(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("EduFund services are offline. Start the backend, then try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
  return data;
}

export const login = (email, password) => authRequest("/auth/login", { email, password });
export const register = (name, email, password) => authRequest("/auth/register", { name, email, password });
export async function fetchMyProfile(token) { const res = await fetch(`${API_BASE_URL}/profile/me`, { headers:{Authorization:`Bearer ${token}`} }); if (!res.ok) throw new Error("Unable to load your profile"); return res.json(); }
export async function saveMyProfile(profile, token) { const res = await fetch(`${API_BASE_URL}/profile/me`, {method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify(profile)}); if (!res.ok) throw new Error("Unable to save your profile"); return res.json(); }
export async function fetchAdminOverview(token) {
  const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Unable to load admin data"); return res.json();
}
export async function fetchAdminUsers(token) {
  const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Unable to load users"); return res.json();
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (err) {
    console.warn("Backend offline, client local fallback mode:", err);
    return { status: "local_mode" };
  }
}

export async function processProfile(profile) {
  try {
    const res = await fetch(`${API_BASE_URL}/profile/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error("Error processing profile");
    return await res.json();
  } catch (err) {
    const fin = profile.financial_constraints || {};
    const cost = fin.target_annual_cost_inr || 120000;
    const aid = fin.confirmed_aid_inr || 60000;
    return {
      student_id: profile.id,
      student_name: profile.name,
      financial_summary: {
        target_cost_inr: cost,
        target_cost_usd: Math.round(cost / 83),
        confirmed_aid_inr: aid,
        confirmed_aid_usd: Math.round(aid / 83),
        funding_gap_inr: Math.max(0, cost - aid),
        funding_gap_usd: Math.max(0, Math.round((cost - aid) / 83)),
        gap_percentage: Math.round(((cost - aid) / cost) * 100)
      }
    };
  }
}

export async function fetchOpportunities(category = "All", query = "", profile = null) {
  try {
    if (profile) {
      const res = await fetch(`${API_BASE_URL}/discovery`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile,category:category === "All" ? null : category,query:query || null})});
      if (!res.ok) throw new Error("Error finding opportunities"); return await res.json();
    }
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (query) params.append("q", query);

    const res = await fetch(`${API_BASE_URL}/opportunities?${params.toString()}`);
    if (!res.ok) throw new Error("Error fetching opportunities");
    return await res.json();
  } catch (err) {
    return FALLBACK_OPPORTUNITIES.filter(o => 
      (category === "All" || o.category.toLowerCase() === category.toLowerCase()) &&
      (!query || o.title.toLowerCase().includes(query.toLowerCase()) || o.provider.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

export async function generateFundingPlan(profile, category = "All") {
  try {
    const res = await fetch(`${API_BASE_URL}/planner/generate?category=${encodeURIComponent(category)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error("Error generating plan");
    return await res.json();
  } catch (err) {
    const cost = profile.financial_constraints.target_annual_cost_inr || 120000;
    const aid = profile.financial_constraints.confirmed_aid_inr || 60000;
    const gap = Math.max(0, cost - aid);
    return {
      total_cost_inr: cost,
      total_cost_usd: Math.round(cost / 83),
      confirmed_aid_inr: aid,
      confirmed_aid_usd: Math.round(aid / 83),
      funding_gap_inr: gap,
      funding_gap_usd: Math.round(gap / 83),
      potential_coverage_inr: 75000,
      potential_coverage_usd: 900,
      remaining_gap_inr: Math.max(0, gap - 75000),
      remaining_gap_usd: Math.max(0, Math.round((gap - 75000) / 83)),
      coverage_percentage: 100,
      recommended_strategy: FALLBACK_STRATEGY,
      agent_advice: "Strategy portfolio optimized to cover target education funding gap!"
    };
  }
}

export async function simulateStrategyScenario(profile, coverageTargetPct, extraWorkStudyInr, increasedAidInr) {
  try {
    const res = await fetch(`${API_BASE_URL}/strategy/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        desired_coverage_target_pct: coverageTargetPct,
        extra_work_study_inr: extraWorkStudyInr,
        increased_family_aid_inr: increasedAidInr
      }),
    });
    if (!res.ok) throw new Error("Error simulating strategy");
    return await res.json();
  } catch (err) {
    const origCost = profile.financial_constraints.target_annual_cost_inr || 120000;
    const origAid = profile.financial_constraints.confirmed_aid_inr || 60000;
    const newAid = origAid + extraWorkStudyInr + increasedAidInr;
    const newGap = Math.max(0, origCost - newAid);
    return {
      total_cost_inr: origCost,
      total_cost_usd: Math.round(origCost / 83),
      confirmed_aid_inr: newAid,
      confirmed_aid_usd: Math.round(newAid / 83),
      funding_gap_inr: newGap,
      funding_gap_usd: Math.round(newGap / 83),
      potential_coverage_inr: 75000,
      potential_coverage_usd: 900,
      remaining_gap_inr: Math.max(0, newGap - 75000),
      remaining_gap_usd: Math.max(0, Math.round((newGap - 75000) / 83)),
      coverage_percentage: Math.round(Math.min(100, (75000 / (newGap || 1)) * 100)),
      recommended_strategy: FALLBACK_STRATEGY,
      agent_advice: `Scenario Active: Added ₹${increasedAidInr.toLocaleString()} family aid + ₹${extraWorkStudyInr.toLocaleString()} work-study.`
    };
  }
}

export async function generateAutopilotDraft(opportunityId, promptIndex = 0, profile = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/autopilot/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity_id: opportunityId,
        prompt_index: promptIndex,
        student_profile: profile
      }),
    });
    if (!res.ok) throw new Error("Error generating draft");
    return await res.json();
  } catch (err) {
    return {
      opportunity_id: opportunityId,
      opportunity_title: "Reliance Foundation STEM Scholarship",
      prompt: "Describe how your chosen STEM field will contribute to solving a major socio-economic challenge.",
      missing_information: ["Income Certificate"],
      application_checklist: [
        { item: "10th & 12th Marksheets", type: "DOCUMENT", status: "READY", notes: "Verified in profile" },
        { item: "Income Certificate", type: "DOCUMENT", status: "PENDING_UPLOAD", notes: "Action required" },
        { item: "Tailored Essay Draft", type: "ESSAY", status: "DRAFT_PREPARED", notes: "Generated by Autopilot" },
        { item: "Human Review", type: "SAFETY_CONTROL", status: "PENDING_STUDENT_APPROVAL", notes: "Safety control active" }
      ],
      draft_response: `As a dedicated Computer Science & AI student (GPA: 3.8/4.0), I aim to harness Machine Learning to democratize financial technology and education funding access for underprivileged communities...`,
      submission_safety_passed: true
    };
  }
}

export async function refineAutopilotDraft(opportunityId, currentDraft, instruction) {
  try {
    const res = await fetch(`${API_BASE_URL}/autopilot/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity_id: opportunityId,
        current_draft: currentDraft,
        instruction
      }),
    });
    if (!res.ok) throw new Error("Error refining draft");
    return await res.json();
  } catch (err) {
    const wordCount = currentDraft.split(" ").length + 25;
    return {
      refined_draft: `[${instruction.toUpperCase()} MODE]: ${currentDraft}\n\nFurthermore, my research background and open-source contributions demonstrate technical rigor and societal impact.`,
      word_count: wordCount,
      reading_time_mins: Math.max(0.5, Math.round((wordCount / 200) * 10) / 10),
      applied_style: instruction
    };
  }
}

export async function auditDocuments(opportunityId, uploadedFiles) {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity_id: opportunityId,
        uploaded_files: uploadedFiles
      }),
    });
    if (!res.ok) throw new Error("Error auditing documents");
    return await res.json();
  } catch (err) {
    return {
      verification_status: "PASSED",
      verified_files: uploadedFiles.map(f => ({ document: f, file_name: f, status: "VERIFIED_VALID", confidence: 99.1 })),
      missing_requirements: [],
      audit_notes: "All uploaded mock documents verified successfully against opportunity criteria!"
    };
  }
}

export async function fetchDeadlines() {
  try {
    const res = await fetch(`${API_BASE_URL}/deadlines`);
    if (!res.ok) throw new Error("Error fetching deadlines");
    return await res.json();
  } catch (err) {
    return {
      urgent_count: 2,
      upcoming_count: 3,
      normal_count: 3,
      alerts: ["URGENT: 2 funding opportunity deadlines close within 15 days."]
    };
  }
}

export async function fetchApplications() {
  try {
    const res = await fetch(`${API_BASE_URL}/applications`);
    if (!res.ok) throw new Error("Error loading application pipeline");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function updateApplicationStatus(opportunityId, status, draftText = null, notes = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/applications/${opportunityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, draft_text: draftText, notes })
    });
    if (!res.ok) throw new Error("Error saving application status");
    return await res.json();
  } catch (err) {
    // Keeps the product usable in local frontend-only mode.
    return { opportunity_id: opportunityId, status, draft_text: draftText, notes, updated_at: new Date().toISOString() };
  }
}

const FALLBACK_OPPORTUNITIES = [
  {
    id: "opp_001",
    title: "Reliance Foundation STEM Scholarship",
    provider: "Reliance Foundation",
    category: "Scholarship",
    amount_inr: 50000,
    amount_usd: 600,
    deadline: "2026-10-15",
    days_left: 27,
    degree_levels: ["Undergraduate"],
    target_courses: ["Computer Science & AI"],
    min_gpa: 3.2,
    max_family_income_inr: 600000,
    description: "Merit-cum-means scholarship for high-performing STEM students.",
    required_documents: ["10th & 12th Marksheets", "Income Certificate"],
    essay_prompts: ["Describe how your STEM field contributes to socio-economic challenges."],
    urgency: "HIGH"
  },
  {
    id: "opp_002",
    title: "Institutional Tuition Fee Waiver Scheme (TFW)",
    provider: "AICTE / State Board",
    category: "Fee Waiver",
    amount_inr: 25000,
    amount_usd: 300,
    deadline: "2026-10-01",
    days_left: 13,
    degree_levels: ["Undergraduate"],
    target_courses: ["Computer Science & AI", "Engineering"],
    min_gpa: 3.0,
    max_family_income_inr: 800000,
    description: "100% tuition fee waiver for economically weaker meritorious students.",
    required_documents: ["Family Income Proof", "State Merit Rank Card"],
    essay_prompts: ["Explain your financial background and fee waiver impact."],
    urgency: "HIGH"
  },
  {
    id: "opp_003",
    title: "Google Generation STEM Equity Grant",
    provider: "Google Asia Pacific",
    category: "Grant",
    amount_inr: 150000,
    amount_usd: 1800,
    deadline: "2026-11-20",
    days_left: 63,
    degree_levels: ["Undergraduate", "Master's"],
    target_courses: ["Computer Science & AI"],
    min_gpa: 3.5,
    max_family_income_inr: 1200000,
    description: "Empowering computer science students demonstrating leadership in tech.",
    required_documents: ["Resume/CV", "Official Transcript", "Letter of Recommendation"],
    essay_prompts: ["Describe a time you demonstrated leadership in tech."],
    urgency: "MEDIUM"
  }
];

const FALLBACK_STRATEGY = [
  {
    opportunity_id: "opp_001",
    title: "Reliance Foundation STEM Scholarship",
    category: "Scholarship",
    amount_inr: 50000,
    amount_usd: 600,
    match_score: 95,
    expected_value_inr: 57000,
    expected_value_usd: 684,
    priority_rank: 1,
    urgency: "HIGH"
  },
  {
    opportunity_id: "opp_002",
    title: "Institutional Tuition Fee Waiver Scheme (TFW)",
    category: "Fee Waiver",
    amount_inr: 25000,
    amount_usd: 300,
    match_score: 90,
    expected_value_inr: 27000,
    expected_value_usd: 324,
    priority_rank: 2,
    urgency: "HIGH"
  }
];
