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
    gpa: 3.8,
    max_gpa: 4.0,
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
    recommended_strategy: [
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
    ],
    agent_advice: "Your strategy stack of 2 targeted opportunities fully covers your funding gap!"
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    async function initData() {
      const health = await fetchHealth();
      setBackendConnected(health.status === "ok");

      let activeProfile = profile;
      if (auth) {
        const stored = await fetchMyProfile(auth.token).catch(() => null);
        activeProfile = stored || { ...INITIAL_PROFILE, id: auth.user.id, name: auth.user.name, course: "", interests: [], achievements: [], academic_profile: { gpa: 0, max_gpa: 4, standardized_test: "", year_of_study: "" }, location: { country: "India", state: "", city: "", study_destination: "India" }, financial_constraints: { annual_family_income_inr: 0, target_annual_cost_inr: 0, confirmed_aid_inr: 0, currency: "INR" } };
        setProfile(activeProfile);
      }
      const opps = await fetchOpportunities("All", "", activeProfile);
      setOpportunities(opps);

      const planData = await generateFundingPlan(activeProfile);
      if (planData) setPlan(planData);

      const applicationData = await fetchApplications();
      setApplications(applicationData);
    }
    initData();
  }, [auth]);

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
    const record = await updateApplicationStatus(oppId, status, draftText);
    setApplications(current => [...current.filter(item => item.opportunity_id !== oppId), record]);
  };

  const handleScenarioResult = (simPlan) => {
    if (simPlan) setPlan(simPlan);
  };

  const handleAuthenticated = (data) => { localStorage.setItem("edufund_auth", JSON.stringify(data)); setAuth(data); };
  const handleLogout = () => { localStorage.removeItem("edufund_auth"); setAuth(null); };

  if (!auth) return <AuthView onAuthenticated={handleAuthenticated} />;

  return (
    <div className="app-layout">
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
            />
          )}

          {activeTab === "discovery" && (
            <DiscoveryMarketplaceView 
              opportunities={opportunities}
              currency={currency}
              onSelectAutopilot={handleSelectAutopilot}
            />
          )}

          {activeTab === "autopilot" && (
            <ApplicationAutopilotView 
              selectedOpportunity={selectedOpportunity || opportunities[0]}
              profile={profile}
              currency={currency}
              onUpdateStatus={handleApplicationStatus}
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
