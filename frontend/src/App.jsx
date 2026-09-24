import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HowItWorksDrawer from "./components/HowItWorksDrawer";
import DashboardView from "./components/DashboardView";
import ProfileBuilderView from "./components/ProfileBuilderView";
import FundingPlannerView from "./components/FundingPlannerView";
import DiscoveryMarketplaceView from "./components/DiscoveryMarketplaceView";
import ApplicationAutopilotView from "./components/ApplicationAutopilotView";
import AuthView from "./components/AuthView";

import { 
  fetchHealth, 
  processProfile, 
  fetchOpportunities, 
  generateFundingPlan 
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

const MAYA_PROFILE = {
  id: "std_002",
  name: "Maya Patel",
  education_level: "Postgraduate",
  course: "Biomedical Engineering & Pre-Med",
  academic_profile: {
    gpa: 3.95,
    max_gpa: 4.0,
    standardized_test: "MCAT 518 / GRE 330",
    year_of_study: "1st Year Masters"
  },
  location: {
    country: "United States",
    state: "California",
    city: "Stanford"
  },
  interests: ["Biomedical Research", "Genomics", "Healthcare Innovation"],
  financial_constraints: {
    annual_family_income_inr: 850000,
    target_annual_cost_inr: 250000,
    confirmed_aid_inr: 100000,
    currency: "USD"
  },
  achievements: [
    "Gates Millennium Scholar Nominee",
    "Co-authored 2 Cell Biology papers"
  ]
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currency, setCurrency] = useState("INR");
  const [collapsed, setCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer state for "How It Works"
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

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
  const [submittedIds, setSubmittedIds] = useState([]);

  useEffect(() => {
    async function initData() {
      const health = await fetchHealth();
      setBackendConnected(health.status === "ok");

      const opps = await fetchOpportunities();
      setOpportunities(opps);

      const planData = await generateFundingPlan(profile);
      if (planData) setPlan(planData);
    }
    initData();
  }, []);

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    const planData = await generateFundingPlan(updatedProfile);
    if (planData) setPlan(planData);
  };

  const handleSelectAutopilot = (opp) => {
    setSelectedOpportunity(opp);
    setActiveTab("autopilot");
  };

  const handleMarkSubmitted = (oppId) => {
    if (!submittedIds.includes(oppId)) {
      setSubmittedIds(prev => [...prev, oppId]);
    }
  };

  const handleScenarioResult = (simPlan) => {
    if (simPlan) setPlan(simPlan);
  };

  const handleAuthenticated = (authData) => {
    setCurrentUser(authData.user);
    if (authData.profilePreset === "maya") {
      setProfile(MAYA_PROFILE);
      setCurrency("USD");
    } else {
      setProfile(INITIAL_PROFILE);
      setCurrency("INR");
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-layout">
      {/* Collapsible Left Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Main App Content Area */}
      <div className="app-main-content">
        <TopBar 
          currency={currency}
          setCurrency={setCurrency}
          backendConnected={backendConnected}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          user={currentUser}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, padding: "1.5rem 2rem", maxWidth: "1600px", width: "100%", margin: "0 auto" }}>
          {activeTab === "dashboard" && (
            <DashboardView 
              profile={profile}
              plan={plan}
              currency={currency}
              onNavigate={setActiveTab}
              onScenarioResult={handleScenarioResult}
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
              onMarkSubmitted={handleMarkSubmitted}
            />
          )}

          {activeTab === "pipeline" && (
            <PipelineTrackerView 
              opportunities={opportunities}
              currency={currency}
              submittedIds={submittedIds}
            />
          )}
        </main>
      </div>

      {/* Slide-over How It Works Drawer */}
      <HowItWorksDrawer 
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
