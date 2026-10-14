import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import DashboardView from "./components/DashboardView";
import ProfileBuilderView from "./components/ProfileBuilderView";
import FundingPlannerView from "./components/FundingPlannerView";
import DiscoveryMarketplaceView from "./components/DiscoveryMarketplaceView";
import ApplicationAutopilotView from "./components/ApplicationAutopilotView";
import PipelineTrackerView from "./components/PipelineTrackerView";
import AuthView from "./components/AuthView";
import AdminView from "./components/AdminView";
import UserGuideView from "./components/UserGuideView";

import { 
  fetchHealth, 
  processProfile, 
  fetchOpportunities, 
  generateFundingPlan,
  fetchApplications,
  updateApplicationStatus,
  fetchMyProfile,
  saveMyProfile
} from "./services/api";

const INITIAL_PROFILE = {
  id: "std_001",
  name: "Aarav Sharma",
  education_level: "Undergraduate",
  course: "Computer Science & AI",
  academic_profile: {
    gpa: 8.5,
    max_gpa: 10,
    standardized_test: "SAT 1480 / JEE Main 98.5th Percentile",
    year_of_study: "2nd Year"
  },
  location: {
    country: "India",
    state: "Karnataka",
    city: "Bengaluru"
  },
  interests: ["Artificial Intelligence", "Machine Learning", "FinTech"],
  financial_constraints: {
    annual_family_income_inr: 450000,
    target_annual_cost_inr: 120000,
    confirmed_aid_inr: 60000,
    currency: "INR"
  },
  achievements: [
    "National Hackathon Winner 2025",
    "Published 1 workshop paper on NLP"
  ]
};

export default function App() {
  const [auth, setAuth] = useState(() => { try { return JSON.parse(localStorage.getItem("edufund_auth")) || null; } catch { return null; } });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState("INR");
  const [collapsed, setCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("edufund_accessibility")) || { fontSize: "normal", highContrast: false, lowBandwidth: false };
    } catch {
      return { fontSize: "normal", highContrast: false, lowBandwidth: false };
    }
  });

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [opportunities, setOpportunities] = useState([]);
  const [plan, setPlan] = useState({
    total_cost_inr: 120000,
    total_cost_usd: 1445,
    confirmed_aid_inr: 60000,
    confirmed_aid_usd: 722,
    funding_gap_inr: 60000,
    funding_gap_usd: 722,
    potential_coverage_inr: 75000,
    potential_coverage_usd: 900,
    remaining_gap_inr: 0,
    remaining_gap_usd: 0,
    coverage_percentage: 100,
    eligibility_evaluations: [],
    recommended_strategy: [
      {
        opportunity_id: "opp_001",
        title: "Reliance Foundation STEM Scholarship",
        category: "Scholarship",
        amount_inr: 50000,
        amount_usd: 600,
        match_score: 95,
        funding_relevance_score: 83.3,
        deadline_urgency_score: 75,
        application_priority_score: 88.1,
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
        funding_relevance_score: 41.7,
        deadline_urgency_score: 100,
        application_priority_score: 79.9,
        priority_rank: 2,
        urgency: "HIGH"
      }
    ],
    agent_advice: "Your strategy stack of 2 targeted opportunities fully covers your funding gap!"
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documentReadiness, setDocumentReadiness] = useState({});

  useEffect(() => {
    async function initData() {
      setDocumentReadiness({});
      const health = await fetchHealth();
      setBackendConnected(health.status === "ok");

      let activeProfile = profile;
      if (auth) {
        const stored = await fetchMyProfile(auth.token).catch(() => null);
        activeProfile = stored || { ...INITIAL_PROFILE, id: auth.user.id, name: auth.user.name, course: "", interests: [], achievements: [], academic_profile: { gpa: 0, max_gpa: 10, standardized_test: "", year_of_study: "" }, location: { country: "India", state: "", city: "", study_destination: "" }, financial_constraints: { annual_family_income_inr: 0, target_annual_cost_inr: 0, confirmed_aid_inr: 0, currency: "INR" } };
        setProfile(activeProfile);
      }
      const opps = await fetchOpportunities("All", "", activeProfile);
      setOpportunities(opps);

      const planData = await generateFundingPlan(activeProfile);
      if (planData) setPlan(planData);

      const applicationData = auth ? await fetchApplications(auth.token) : [];
      setApplications(applicationData);
    }
    initData();
  }, [auth]);

  useEffect(() => {
    localStorage.setItem("edufund_accessibility", JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  const handleSaveProfile = async (updatedProfile) => {
    const saved = await saveMyProfile(updatedProfile, auth.token).catch(() => updatedProfile);
    setProfile(saved);
    const [planData, opps] = await Promise.all([generateFundingPlan(saved), fetchOpportunities("All", "", saved)]);
    if (planData) setPlan(planData);
    setOpportunities(opps);
  };

  const handleSelectAutopilot = (opp) => {
    setSelectedOpportunity(opp);
    setActiveTab("autopilot");
  };

  const handleApplicationStatus = async (oppId, status, draftText = null) => {
    const record = await updateApplicationStatus(oppId, status, draftText, null, auth.token);
    setApplications(current => [...current.filter(item => item.opportunity_id !== oppId), record]);
  };

  const handleDocumentReadiness = (oppId, result) => {
    setDocumentReadiness(current => {
      if (result) return { ...current, [oppId]: result };
      const next = { ...current };
      delete next[oppId];
      return next;
    });
  };

  const handleScenarioResult = (simPlan) => {
    if (simPlan) setPlan(simPlan);
  };

  const handleAuthenticated = (data) => { localStorage.setItem("edufund_auth", JSON.stringify(data)); setAuth(data); };
  const handleLogout = () => { localStorage.removeItem("edufund_auth"); setAuth(null); };

  if (!auth) return <AuthView onAuthenticated={handleAuthenticated} />;

  return (
    <div className={`app-layout a11y-font-${accessibilitySettings.fontSize} ${accessibilitySettings.highContrast ? "a11y-high-contrast" : ""} ${accessibilitySettings.lowBandwidth ? "a11y-low-bandwidth" : ""}`}>
      {/* Collapsible Left Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        user={auth.user}
        onLogout={handleLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main App Content Area */}
      <div className="app-main-content">
        <TopBar 
          currency={currency}
          setCurrency={setCurrency}
          backendConnected={backendConnected}
          user={auth.user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          accessibilitySettings={accessibilitySettings}
          onAccessibilityChange={setAccessibilitySettings}
        />

        <main style={{ flex: 1, padding: "2rem", maxWidth: "1600px", width: "100%", margin: "0 auto" }}>
          {activeTab === "dashboard" && (
            <DashboardView 
              profile={profile}
              plan={plan}
              currency={currency}
              onNavigate={setActiveTab}
              onScenarioResult={handleScenarioResult}
              opportunitiesCount={opportunities.length}
              opportunities={opportunities}
              applications={applications}
              documentReadiness={documentReadiness}
              onSelectAutopilot={handleSelectAutopilot}
            />
          )}

          {activeTab === "profile" && (
            <ProfileBuilderView 
              profile={profile}
              setProfile={setProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {activeTab === "planner" && (
            <FundingPlannerView 
              plan={plan}
              profile={profile}
              currency={currency}
              onNavigate={setActiveTab}
              onScenarioResult={handleScenarioResult}
              opportunities={opportunities}
              onSelectAutopilot={handleSelectAutopilot}
            />
          )}

          {activeTab === "discovery" && (
            <DiscoveryMarketplaceView 
              opportunities={opportunities}
              currency={currency}
              onSelectAutopilot={handleSelectAutopilot}
              eligibilityEvaluations={plan?.eligibility_evaluations || []}
              fundingGapInr={plan?.funding_gap_inr || 0}
            />
          )}

          {activeTab === "autopilot" && (
            <ApplicationAutopilotView 
              selectedOpportunity={selectedOpportunity || opportunities[0]}
              profile={profile}
              currency={currency}
              token={auth.token}
              onUpdateStatus={handleApplicationStatus}
              onDocumentReadiness={handleDocumentReadiness}
            />
          )}

          {activeTab === "pipeline" && (
            <PipelineTrackerView 
              opportunities={opportunities}
              currency={currency}
              applications={applications}
              plan={plan}
              onUpdateStatus={handleApplicationStatus}
            />
          )}

          {activeTab === "admin" && auth.user.role === "admin" && <AdminView token={auth.token} />}
          {activeTab === "guide" && <UserGuideView onNavigate={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}
