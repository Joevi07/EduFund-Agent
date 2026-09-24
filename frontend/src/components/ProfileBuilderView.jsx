import React, { useState } from "react";
import { User, DollarSign, Save, MapPin, Award, CheckCircle2 } from "lucide-react";

const Section = ({ icon: Icon, title, color = "var(--accent-teal)", children }) => (
  <div className="bento-box" style={{ padding:"1.8rem" }}>
    <h3 style={{ fontSize:"1rem", fontWeight:700, marginBottom:"1.2rem", display:"flex", alignItems:"center", gap:".55rem" }}>
      <div style={{ background:`linear-gradient(135deg,${color},${color}cc)`, borderRadius:8, padding:6, boxShadow:`0 3px 10px ${color}40`, display:"flex" }}>
        <Icon size={16} color="#fff"/>
      </div>
      {title}
    </h3>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:"1rem" }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display:"block", fontSize:".78rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:".4rem", letterSpacing:".02em" }}>
      {label}
    </label>
    {children}
  </div>
);

export default function ProfileBuilderView({ profile, setProfile, onSaveProfile }) {
  const [formData, setFormData] = useState(profile);
  const [saved,    setSaved]    = useState(false);

  const set    = (field, val)         => setFormData(p => ({ ...p, [field]: val }));
  const setNested = (parent, field, val) => setFormData(p => ({ ...p, [parent]: { ...p[parent], [field]: val } }));

  const submit = async e => {
    e.preventDefault();
    setProfile(formData);
    await onSaveProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.035em" }}>Profile Agent Config</h2>
        <p style={{ color:"var(--text-secondary)", fontSize:".88rem", marginTop:".2rem" }}>
          Update your credentials and financial details to refine AI eligibility reasoning & gap calculation.
        </p>
      </div>

      <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"1.4rem" }}>

        {/* Academic */}
        <Section icon={User} title="Academic & Personal Background">
          <Field label="Full Name">
            <input value={formData.name} onChange={e => set("name", e.target.value)} required placeholder="Your full name"/>
          </Field>
          <Field label="Education Level">
            <select value={formData.education_level} onChange={e => set("education_level", e.target.value)}>
              <option value="High School">High School Senior</option>
              <option value="Undergraduate">Undergraduate (B.Tech / B.S / B.A)</option>
              <option value="Master's">Master's (M.Tech / M.S / MBA)</option>
              <option value="PhD">PhD / Doctorate</option>
            </select>
          </Field>
          <Field label="Field of Study / Course">
            <input value={formData.course} onChange={e => set("course", e.target.value)} required placeholder="e.g. Computer Science & AI"/>
          </Field>
          <Field label="Current GPA">
            <input type="number" step=".01" max="4.0" value={formData.academic_profile?.gpa}
              onChange={e => setNested("academic_profile","gpa", parseFloat(e.target.value)||0)} required placeholder="3.8"/>
          </Field>
          <Field label="Standardized Test / Rank">
            <input value={formData.academic_profile?.standardized_test}
              onChange={e => setNested("academic_profile","standardized_test", e.target.value)} placeholder="e.g. SAT 1480 / JEE 98.5th"/>
          </Field>
          <Field label="Year of Study">
            <input value={formData.academic_profile?.year_of_study}
              onChange={e => setNested("academic_profile","year_of_study", e.target.value)} placeholder="e.g. 2nd Year"/>
          </Field>
        </Section>

        {/* Location */}
        <Section icon={MapPin} title="Location" color="var(--accent-indigo)">
          <Field label="City">
            <input value={formData.location?.city} onChange={e => setNested("location","city", e.target.value)} placeholder="Bengaluru"/>
          </Field>
          <Field label="State">
            <input value={formData.location?.state} onChange={e => setNested("location","state", e.target.value)} placeholder="Karnataka"/>
          </Field>
          <Field label="Country">
            <input value={formData.location?.country} onChange={e => setNested("location","country", e.target.value)} placeholder="India"/>
          </Field>
        </Section>

        {/* Financial */}
        <Section icon={DollarSign} title="Financial Constraints & Budget" color="var(--accent-sage)">
          <Field label="Target Annual Education Cost (₹ INR)">
            <input type="number" value={formData.financial_constraints?.target_annual_cost_inr}
              onChange={e => setNested("financial_constraints","target_annual_cost_inr", parseFloat(e.target.value)||0)} required placeholder="120000"/>
          </Field>
          <Field label="Confirmed Aid / Family Support (₹ INR)">
            <input type="number" value={formData.financial_constraints?.confirmed_aid_inr}
              onChange={e => setNested("financial_constraints","confirmed_aid_inr", parseFloat(e.target.value)||0)} required placeholder="60000"/>
          </Field>
          <Field label="Annual Family Income (₹ INR)">
            <input type="number" value={formData.financial_constraints?.annual_family_income_inr}
              onChange={e => setNested("financial_constraints","annual_family_income_inr", parseFloat(e.target.value)||0)} required placeholder="450000"/>
          </Field>
        </Section>

        {/* Achievements */}
        <Section icon={Award} title="Achievements & Interests" color="var(--amber-500)">
          <Field label="Achievements (comma-separated)">
            <input value={(formData.achievements||[]).join(", ")}
              onChange={e => set("achievements", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
              placeholder="National Hackathon Winner, Published Paper…"/>
          </Field>
          <Field label="Interests / Skills (comma-separated)">
            <input value={(formData.interests||[]).join(", ")}
              onChange={e => set("interests", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
              placeholder="Artificial Intelligence, FinTech…"/>
          </Field>
        </Section>

        {/* Save button */}
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <button type="submit" className="btn-emerald" style={{ padding:".8rem 1.8rem", fontSize:".95rem" }}>
            <Save size={17}/> Save Profile & Recalculate Strategy
          </button>
          {saved && (
            <span style={{ color:"var(--accent-sage)", fontSize:".88rem", fontWeight:700 }}>
              <CheckCircle2 size={16} style={{ verticalAlign:"middle", marginRight:".3rem" }}/>Saved! Strategy recalculated.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
