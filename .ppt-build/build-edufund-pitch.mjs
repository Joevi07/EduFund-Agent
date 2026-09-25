import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\EduFund";
const SKILL_DIR = "C:\\Users\\evija\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.12148\\skills\\presentations";
const RUNTIME_PYTHON = "C:\\Users\\evija\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const outDir = path.join(workspaceDir, "deliverables");
const stageDir = path.join(workspaceDir, ".codex-finalizer");
const finalPath = path.join(outDir, "EduFund_Hackathon_Pitch_Deck.pptx");
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(stageDir, { recursive: true });

const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")).href);
const font = resolvePresentationFont({ fontFamily: "Aptos" });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = { ink:"#16383A", muted:"#587375", teal:"#117D80", aqua:"#16A5A4", mist:"#EAF6F4", paper:"#FAFCFB", amber:"#D6812B", green:"#247B58", blue:"#3966B4", line:"#CDE4E1", white:"#FFFFFF", dark:"#0D5154" };

function rect(slide, x, y, w, h, fill, radius = 0, line = "none") {
  return slide.shapes.add({ geometry: radius ? "roundRect" : "rect", position:{left:x,top:y,width:w,height:h}, fill, line: line === "none" ? { fill:"none", width:0 } : { fill:line, width:1 } });
}
function text(slide, value, x, y, w, h, size=20, color=C.ink, opts={}) {
  const box = slide.shapes.add({ geometry:"textbox", position:{left:x,top:y,width:w,height:h}, fill:"none", line:{fill:"none",width:0} });
  box.text = value;
  box.text.style = { typeface:font, fontSize:size, color, bold:opts.bold ?? false, align:opts.align ?? "left", valign:opts.valign ?? "top", autoFit:"shrink", breakLine: false, marginLeft:0, marginRight:0, marginTop:0, marginBottom:0 };
  return box;
}
function line(slide, x1, y1, x2, y2, color=C.line, width=2) { return slide.shapes.add({ geometry:"line", position:{left:x1,top:y1,width:x2-x1,height:y2-y1}, line:{fill:color,width} }); }
function footer(slide, n) { text(slide, "EDUFUND  /  HACKATHON PITCH", 64, 676, 260, 16, 9, C.muted, {bold:true}); text(slide, String(n).padStart(2,"0"), 1168, 676, 48, 16, 9, C.muted, {bold:true,align:"right"}); }
function title(slide, kicker, heading, sub, n) { text(slide,kicker.toUpperCase(),64,48,360,18,10,C.teal,{bold:true}); text(slide,heading,64,78,1120,54,32,C.ink,{bold:true}); if(sub) text(slide,sub,64,142,1000,34,16,C.muted); line(slide,64,190,1216,190,C.line,1); footer(slide,n); }
function pill(slide, label, x, y, w, color=C.teal) { rect(slide,x,y,w,28,color,14); text(slide,label,x+10,y+7,w-20,13,10,C.white,{bold:true,align:"center"}); }
function note(slide, value) { slide.speakerNotes.textFrame.setText(value); }

// 1. Cover
{ const s=deck.slides.add(); s.background.fill=C.paper; rect(s,0,0,1280,720,C.paper); rect(s,800,0,480,720,C.mist); rect(s,854,94,340,340,"#D6EFEC",36); rect(s,898,138,252,252,C.white,36); rect(s,944,184,160,160,"#BCE3DE",28); text(s,"EDUFUND",72,72,180,20,12,C.teal,{bold:true}); text(s,"A clearer path\nto education funding",72,155,650,150,50,C.ink,{bold:true}); text(s,"A student-first platform that matches verified opportunities, plans the funding gap, and keeps every application moving.",72,334,610,65,20,C.muted); pill(s,"HACKATHON PITCH",72,452,158); text(s,"Multi-agent financial planning for students",72,502,420,24,15,C.dark,{bold:true}); text(s,"Prepared for live product demo",72,636,300,18,11,C.muted); text(s,"Funding intelligence\nthat students can explain",844,490,288,60,20,C.dark,{bold:true,align:"center"}); note(s,"Open with the student outcome: a funding plan they can understand and act on."); }

// 2. Problem
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"The problem","Funding decisions are scattered and time-sensitive","Students must connect costs, eligibility, documents, essays, and deadlines without a single plan.",2); const items=[["Opportunity search","Programmes live across separate portals and websites."],["Eligibility uncertainty","A promising listing can still fail on course, grade, income, or document rules."],["Application friction","Students repeat evidence and lose time as deadlines cluster."],["No financial picture","Directories rarely show the actual gap after confirmed aid."]]; items.forEach((it,i)=>{const x=64+(i%2)*582,y=242+Math.floor(i/2)*174; rect(s,x,y,540,136,C.white,18,C.line); text(s,String(i+1).padStart(2,"0"),x+24,y+22,48,24,16,C.teal,{bold:true}); text(s,it[0],x+24,y+55,445,25,20,C.ink,{bold:true}); text(s,it[1],x+24,y+88,455,32,14,C.muted);}); note(s,"Frame the problem as decision overload, not just scholarship search."); }

// 3. Solution
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"The solution","One student profile powers the whole funding journey","EduFund turns profile data into a ranked portfolio and a managed application workflow.",3); const stages=[["01","Profile","Academic, financial, and goal inputs"],["02","Discover","Curated opportunities matched to the profile"],["03","Plan","Expected-value ranking and funding confidence"],["04","Prepare","Documents, essay evidence, and human review"],["05","Track","Pipeline stages, deadlines, and reuse opportunities"]]; stages.forEach((it,i)=>{const x=66+i*230; rect(s,x,263,194,184,i===2?"#DDF2EF":C.white,18,i===2?C.aqua:C.line); text(s,it[0],x+18,286,50,18,12,C.teal,{bold:true}); text(s,it[1],x+18,322,158,28,19,C.ink,{bold:true}); text(s,it[2],x+18,363,156,56,13,C.muted); if(i<4) line(s,x+194,355,x+225,355,C.aqua,2);}); text(s,"Human authorisation stays in control before any portal submission.",64,540,800,28,17,C.green,{bold:true}); note(s,"This slide previews the entire product flow before the feature deep dive."); }

// 4. Funding engine
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Funding intelligence","A financial plan starts with the gap, not a list of links","The planner separates confirmed aid from estimated outcomes so students can judge risk clearly.",4); rect(s,64,245,1152,126,C.dark,20); text(s,"Annual education cost",94,274,250,19,14,"#D8F1EE",{bold:true}); text(s,"− Confirmed aid",438,274,230,19,14,"#D8F1EE",{bold:true}); text(s,"= Remaining gap",786,274,220,19,14,"#D8F1EE",{bold:true}); text(s,"₹ 2,00,000",94,306,250,36,27,C.white,{bold:true}); text(s,"₹ 30,000",438,306,230,36,27,C.white,{bold:true}); text(s,"₹ 1,70,000",786,306,220,36,27,"#FFE0A5",{bold:true}); rect(s,64,422,528,155,C.white,18,C.line); text(s,"Expected value portfolio",94,450,350,24,20,C.ink,{bold:true}); text(s,"Ranks opportunities by amount, profile match, and deadline urgency.",94,489,430,40,14,C.muted); rect(s,624,422,592,155,"#EAF6F4",18,C.line); text(s,"Funding Confidence Meter",654,450,370,24,20,C.ink,{bold:true}); text(s,"Guaranteed",654,495,92,16,12,C.green,{bold:true}); text(s,"Probable",770,495,72,16,12,C.teal,{bold:true}); text(s,"Possible",870,495,72,16,12,C.blue,{bold:true}); text(s,"Risk",970,495,50,16,12,C.amber,{bold:true}); rect(s,654,528,135,12,C.green,6); rect(s,793,528,138,12,C.teal,6); rect(s,935,528,105,12,C.blue,6); rect(s,1044,528,125,12,C.amber,6); note(s,"Use the shown values only as a demo scenario, not market data. Explain that confidence is a decision aid, not an award promise."); }

// 5. Differentiators
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"What makes EduFund different","Three decision tools turn an application list into a practical plan","These features focus on uncertainty, effort, and integrity.",5); const cards=[["Funding Confidence Meter","Shows confirmed, likely, possible, and uncovered funding in one view.",C.teal],["Document Reuse Map","Finds evidence that can support more than one active application.",C.blue],["Essay Evidence Checker","Flags strong statements that do not appear in the student profile.",C.amber]]; cards.forEach((c,i)=>{const x=64+i*385; rect(s,x,255,352,250,C.white,20,C.line); rect(s,x+24,279,44,8,c[2],4); text(s,"0"+(i+1),x+24,312,60,24,16,c[2],{bold:true}); text(s,c[0],x+24,355,298,52,22,C.ink,{bold:true}); text(s,c[1],x+24,425,292,55,14,C.muted);}); text(s,"Each feature gives the student a specific next action before the deadline closes.",64,565,900,24,17,C.dark,{bold:true}); note(s,"Make the novelty explicit: confidence, reuse, and evidence quality fit together as one workflow."); }

// 6. Autopilot safety
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Application Autopilot","AI accelerates preparation while the student retains control","EduFund prepares the work, highlights gaps, and requires review before an application packet is marked ready.",6); const steps=[["Requirements","Read required documents and prompts"],["Draft support","Generate and refine a response from the profile"],["Evidence check","Compare key claims against stored achievements"],["Student review","Edit, approve, and submit through the official portal"]]; steps.forEach((it,i)=>{const y=230+i*85; rect(s,94,y,70,52,i===3?C.green:C.mist,14); text(s,String(i+1),94,y+15,70,18,16,i===3?C.white:C.teal,{bold:true,align:"center"}); text(s,it[0],198,y+2,250,25,18,C.ink,{bold:true}); text(s,it[1],198,y+30,580,22,14,C.muted); if(i<3) line(s,129,y+52,129,y+84,C.aqua,2);}); rect(s,820,236,330,290,"#EFFAF5",20,"#B6DEC9"); text(s,"Safety boundary",850,270,250,25,21,C.green,{bold:true}); text(s,"EduFund never sends financial forms or essays to an external provider without explicit student review and authorisation.",850,324,245,100,16,C.ink); text(s,"Official provider portal\nremains the final submission step",850,452,240,44,14,C.green,{bold:true}); note(s,"This is a trust slide. State clearly that the system does not autonomously submit applications."); }

// 7. Product flow
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Live demo flow","A two-minute journey from account creation to a ready application packet","Use this sequence during the live demo so judges see the financial outcome before the interface details.",7); const flow=[["1","Register","Create a student account"],["2","Profile","Enter course, GPA, income range, annual cost, and aid"],["3","Planner","Open the ranked portfolio and confidence meter"],["4","Autopilot","Choose one match, audit documents, check essay evidence"],["5","Pipeline","Move the application forward and inspect deadline conflicts"]]; flow.forEach((it,i)=>{const x=64+i*230; text(s,it[0],x,263,30,25,18,C.teal,{bold:true}); line(s,x+35,276,x+194,276,C.line,2); rect(s,x,312,195,170,C.white,18,C.line); text(s,it[1],x+20,340,155,24,19,C.ink,{bold:true}); text(s,it[2],x+20,382,155,58,13,C.muted);}); text(s,"Demo tip: use a realistic fictional student profile and show the official programme link before discussing an application.",64,550,1040,25,15,C.dark,{bold:true}); note(s,"This slide doubles as your demo script."); }

// 8. Architecture
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Build architecture","A modular web application with separate reasoning agents","The implementation keeps profile data, planning logic, and application actions connected through a REST API.",8); const cols=[["React + Vite","Student dashboard\nResponsive light interface\nLucide icon system"],["FastAPI","Profile, opportunity, planner, autopilot, and pipeline endpoints"],["Agent services","Discovery\nEligibility\nFunding planner\nAutopilot\nDeadline monitor"],["SQLite","User accounts\nProfiles\nApplication stages"]]; cols.forEach((c,i)=>{const x=64+i*290; rect(s,x,258,258,275,i===2?"#EAF6F4":C.white,18,C.line); text(s,c[0],x+22,292,214,28,20,C.ink,{bold:true}); line(s,x+22,335,x+208,335,C.line,1); text(s,c[1],x+22,362,205,132,15,C.muted);}); text(s,"Deployed frontend and backend can run independently through an environment-configured API URL.",64,580,1000,22,15,C.teal,{bold:true}); note(s,"Keep this technical slide brief. Focus on the working product, not framework vocabulary."); }

// 9. Impact and evaluation
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Value for students and institutions","EduFund makes funding decisions easier to explain, organise, and act on","The current prototype focuses on a transparent workflow with official-source verification.",9); const rows=[["Students","See the funding gap, ranked matches, and next deadline in one place."],["Advisors","Review a student's plan and application readiness without rebuilding the picture."],["Institutions","Direct students to official sources while reducing repeated administrative questions."]]; rows.forEach((r,i)=>{const y=245+i*96; rect(s,64,y,1152,70,i===1?"#EAF6F4":C.white,14,C.line); text(s,r[0],92,y+22,180,22,18,C.teal,{bold:true}); text(s,r[1],334,y+20,780,28,16,C.ink);}); rect(s,64,560,1152,50,C.dark,14); text(s,"Responsible design: eligibility and award decisions remain with the funding provider.",92,576,1000,18,14,C.white,{bold:true}); note(s,"Use careful language. Do not claim performance metrics that the prototype has not measured."); }

// 10. Roadmap
{ const s=deck.slides.add(); s.background.fill=C.paper; title(s,"Next milestones","A practical path from hackathon prototype to trusted student service","Future work prioritises source freshness, institutional collaboration, and measurable student outcomes.",10); const phases=[["Now","Profile-driven discovery, funding plan, safe application preparation"],["Next","Scheduled source checks, document expiry reminders, institution dashboards"],["Later","Consent-based integrations with university aid offices and outcome analytics"]]; phases.forEach((p,i)=>{const x=64+i*385; rect(s,x,270,352,220,C.white,18,C.line); pill(s,p[0],x+24,294,90,i===0?C.teal:i===1?C.blue:C.green); text(s,p[1],x+24,350,295,92,17,C.ink,{bold:true});}); text(s,"The principle stays constant: help students make an informed decision before they invest application effort.",64,560,1060,25,16,C.dark,{bold:true}); note(s,"Close the roadmap by connecting it back to the student decision."); }

// 11. Closing
{ const s=deck.slides.add(); s.background.fill=C.dark; rect(s,0,0,1280,720,C.dark); rect(s,824,88,310,310,"#166F71",36); rect(s,874,138,210,210,"#1E8585",28); text(s,"EDUFUND",72,76,220,20,12,"#A8DFDA",{bold:true}); text(s,"Funding plans\nthat move students forward",72,170,660,120,45,C.white,{bold:true}); text(s,"Discover the right opportunities. Understand the funding gap. Prepare every application with confidence.",72,330,620,58,20,"#D9F1EF"); pill(s,"THANK YOU",72,455,112,C.aqua); text(s,"Live product demonstration available",72,514,300,22,15,"#A8DFDA",{bold:true}); text(s,"EduFund keeps the student in control.",72,638,400,18,13,"#A8DFDA"); note(s,"Close with the product promise, then invite judges to the live demo."); }

const candidatePath = path.join(stageDir, "edufund-pitch-candidate.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
const result = await finalizePresentation({
  workspaceDir, candidatePath, finalPath, pythonExecutable:RUNTIME_PYTHON,
  integrityValidatorPath:path.join(SKILL_DIR,"container_tools","inspect_presentation_package_integrity.py"),
  layoutValidatorPath:path.join(SKILL_DIR,"container_tools","inspect_presentation_layout_geometry.py"),
  layoutArgs:["--expected-slide-size-emu","12192000,6858000","--validate-bullet-geometry","--validate-heading-fit"],
  explicitTotalSlideCount:11, requiredNativeTableOwnerSlides:[],
  fontPolicy:{basis:"design",families:[font]}, verifyArtifactToolImport:true,
  receiptPath:path.join(stageDir,"EduFund_Hackathon_Pitch_Deck.validation.json"),
});
console.log(JSON.stringify({finalPath,result},null,2));
