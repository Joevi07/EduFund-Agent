import React, { useState } from "react";
import { User, Award, DollarSign, BookOpen, MapPin, Save, RefreshCw } from "lucide-react";

export default function ProfileBuilderView({ profile, setProfile, onSaveProfile }) {
  const [formData, setFormData] = useState(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(formData);
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Student Profile Agent Config</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Update your academic credentials and financial constraints to refine the AI Agent eligibility reasoning & gap calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Personal & Academic Details */}
        <div className="glass-card" style={{ padding: "1.8rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={18} color="var(--accent-indigo)" /> Academic & Personal Background
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => handleInputChange("name", e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Education Level</label>
              <select 
                value={formData.education_level} 
                onChange={e => handleInputChange("education_level", e.target.value)}
              >
                <option value="High School">High School Senior</option>
                <option value="Undergraduate">Undergraduate (B.Tech / B.S / B.A)</option>
                <option value="Master's">Master's (M.Tech / M.S / MBA)</option>
                <option value="PhD">PhD / Doctorate</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Field of Study / Course</label>
              <input 
                type="text" 
                value={formData.course} 
                onChange={e => handleInputChange("course", e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Current Cumulative GPA</label>
              <input 
                type="number" 
                step="0.01" 
                max="4.0" 
                value={formData.academic_profile.gpa} 
                onChange={e => handleNestedChange("academic_profile", "gpa", parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>Standardized Test / Rank</label>
              <input 
                type="text" 
                value={formData.academic_profile.standardized_test} 
                onChange={e => handleNestedChange("academic_profile", "standardized_test", e.target.value)} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>State & Country of Domicile</label>
              <input 
                type="text" 
                value={`${formData.location.state}, ${formData.location.country}`} 
                onChange={e => handleNestedChange("location", "state", e.target.value.split(",")[0] || "")} 
              />
            </div>
          </div>
        </div>

        {/* Financial Constraints (FinTech Engine Inputs) */}
        <div className="glass-card" style={{ padding: "1.8rem", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-emerald)" }}>
            <DollarSign size={18} color="var(--accent-emerald)" /> Financial Constraints & Target Budget
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                Target Annual Education Cost (₹ INR)
              </label>
              <input 
                type="number" 
                value={formData.financial_constraints.target_annual_cost_inr} 
                onChange={e => handleNestedChange("financial_constraints", "target_annual_cost_inr", parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                Confirmed Aid / Family Support (₹ INR)
              </label>
              <input 
                type="number" 
                value={formData.financial_constraints.confirmed_aid_inr} 
                onChange={e => handleNestedChange("financial_constraints", "confirmed_aid_inr", parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                Annual Family Income (₹ INR)
              </label>
              <input 
                type="number" 
                value={formData.financial_constraints.annual_family_income_inr} 
                onChange={e => handleNestedChange("financial_constraints", "annual_family_income_inr", parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button type="submit" className="btn-emerald" style={{ padding: "0.8rem 1.8rem", fontSize: "0.95rem" }}>
            <Save size={18} /> Update Profile & Recalculate Agent Strategy
          </button>
          {savedSuccess && (
            <span style={{ color: "var(--accent-emerald)", fontSize: "0.9rem", fontWeight: 600 }}>
              ✓ Saved! Funding gap & strategy recalculated.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
