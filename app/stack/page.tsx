"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "frontend", label: "Frontend · 前端", icon: "◧", color: "#B8F03A",
    skills: [
      { name: "React / Next.js",  level: 97, yrs: "5y" },
      { name: "TypeScript",       level: 94, yrs: "4y" },
      { name: "CSS / Tailwind",   level: 91, yrs: "5y" },
      { name: "Three.js / WebGL", level: 72, yrs: "2y" },
      { name: "Framer Motion",    level: 85, yrs: "3y" },
    ],
  },
  {
    id: "backend", label: "Backend · 后端", icon: "◨", color: "#6B7CFF",
    skills: [
      { name: "Node.js / Express / Django", level: 93, yrs: "5y" },
      { name: "PostgreSQL",                 level: 89, yrs: "4y" },
      { name: "GraphQL",                    level: 86, yrs: "3y" },
      { name: "Redis",                      level: 78, yrs: "2y" },
      { name: "REST API Design",            level: 95, yrs: "5y" },
    ],
  },
  {
    id: "devops", label: "DevOps · 运维", icon: "◩", color: "#FF6B35",
    skills: [
      { name: "Docker / K8s",           level: 82, yrs: "3y" },
      { name: "AWS (EC2/S3/Lambda)",    level: 80, yrs: "3y" },
      { name: "CI/CD (GitHub Actions)", level: 88, yrs: "4y" },
      { name: "Vercel / Railway",       level: 91, yrs: "3y" },
      { name: "Linux / Bash",           level: 78, yrs: "4y" },
    ],
  },
  {
    id: "tools", label: "Tooling · 工具链", icon: "◪", color: "#00C9A7",
    skills: [
      { name: "Git / GitHub", level: 96, yrs: "5y" },
      { name: "Figma",        level: 84, yrs: "4y" },
      { name: "Storybook",    level: 80, yrs: "3y" },
      { name: "Vitest / Jest",level: 86, yrs: "4y" },
      { name: "Playwright",   level: 74, yrs: "2y" },
    ],
  },
];

const RADAR_SKILLS = [
  { label: "Frontend", val: 97 },
  { label: "Backend",  val: 88 },
  { label: "DevOps",   val: 82 },
  { label: "Design",   val: 79 },
  { label: "Testing",  val: 83 },
  { label: "AI/ML",    val: 68 },
];

const PROCESS = [
  { phase:"01", title:"Discovery",    zh:"发现", duration:"1–2 days",  desc:"Deep-dive into requirements, constraints, and goals. Competitor audit, technical feasibility review, architecture sketch.",tools:["Notion","FigJam","Linear"] },
  { phase:"02", title:"Architecture", zh:"架构", duration:"2–3 days",  desc:"Database schema design, API contract definition, component tree mapping, and CI/CD strategy before a single line of code is written.",tools:["Excalidraw","dbdiagram.io","OpenAPI"] },
  { phase:"03", title:"Build",        zh:"构建", duration:"1–6 weeks", desc:"Iterative sprints with daily builds, PR reviews, Storybook component isolation, and continuous integration from day one.",tools:["VS Code","GitHub","Docker","Vercel"] },
  { phase:"04", title:"Polish",       zh:"打磨", duration:"3–5 days",  desc:"Performance profiling (Lighthouse), accessibility audit (axe), cross-browser QA, animation refinement, and UX micro-detail pass.",tools:["Lighthouse","Playwright","Percy"] },
  { phase:"05", title:"Ship & Monitor",zh:"发布",duration:"Ongoing",  desc:"Zero-downtime deploy, error monitoring, uptime alerting, and a structured handover doc so the next engineer starts with confidence.",tools:["Sentry","DataDog","PagerDuty"] },
];

const TOOLS_GRID = [
  { name:"VS Code",     icon:"⬛", cat:"Editor"    },
  { name:"GitHub",      icon:"◉",  cat:"VCS"       },
  { name:"Figma",       icon:"◈",  cat:"Design"    },
  { name:"Linear",      icon:"◇",  cat:"PM"        },
  { name:"Vercel",      icon:"▲",  cat:"Deploy"    },
  { name:"Docker",      icon:"◫",  cat:"Container" },
  { name:"Postman",     icon:"✦",  cat:"API"       },
  { name:"TablePlus",   icon:"◧",  cat:"Database"  },
  { name:"Warp",        icon:"▷",  cat:"Terminal"  },
  { name:"Notion",      icon:"□",  cat:"Docs"      },
  { name:"Raycast",     icon:"⌥",  cat:"Launcher"  },
  { name:"Arc Browser", icon:"◌",  cat:"Browser"   },
];

function RadarChart({ visible }: { visible: boolean }) {
  const cx = 140, cy = 140, r = 100;
  const count = RADAR_SKILLS.length;
  const point = (i: number, pct: number) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const dist  = (pct / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const dataPath = RADAR_SKILLS.map((s, i) => {
    const p = point(i, visible ? s.val : 0);
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ") + " Z";
  return (
    <svg width="100%" viewBox="0 0 280 280" style={{ overflow:"visible", maxWidth:280 }}>
      {[25,50,75,100].map(lvl => (
        <polygon key={lvl} points={RADAR_SKILLS.map((_,i)=>{const p=point(i,lvl);return`${p.x.toFixed(1)},${p.y.toFixed(1)}`;}).join(" ")}
          fill="none" stroke="rgba(245,244,240,0.06)" strokeWidth={1} />
      ))}
      {RADAR_SKILLS.map((_,i)=>{const e=point(i,100);return<line key={i} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="rgba(245,244,240,0.08)" strokeWidth={1}/>;} )}
      <path d={dataPath} fill="rgba(184,240,58,0.12)" stroke="#B8F03A" strokeWidth={2}
        style={{ transition:"d 1.2s cubic-bezier(.4,0,.2,1)" }} />
      {RADAR_SKILLS.map((s,i)=>{const p=point(i,visible?s.val:0);return(
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#0E0F0C" stroke="#B8F03A" strokeWidth={2}
          style={{transition:`cx 1.2s ${i*.08}s,cy 1.2s ${i*.08}s`}}/>
      );})}
      {RADAR_SKILLS.map((s,i)=>{const p=point(i,115);const anchor=p.x<cx-5?"end":p.x>cx+5?"start":"middle";return(
        <text key={i} x={p.x} y={p.y+4} textAnchor={anchor} fill="rgba(245,244,240,0.5)"
          style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase"}}>
          {s.label}
        </text>
      );})}
      <circle cx={cx} cy={cy} r={3} fill="#B8F03A" />
    </svg>
  );
}

function SkillBar({ name, level, yrs, color, visible, delay }: {
  name:string; level:number; yrs:string; color:string; visible:boolean; delay:number;
}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6,animation:visible?`fadeUp .6s ${delay}s ease forwards`:"none",opacity:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:"rgba(245,244,240,.75)",letterSpacing:"0.01em",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(245,244,240,.25)",letterSpacing:"0.1em"}}>{yrs}</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color,letterSpacing:"0.06em",minWidth:28,textAlign:"right"}}>{level}</span>
        </div>
      </div>
      <div style={{height:3,background:"rgba(245,244,240,.07)",borderRadius:2,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:2,
          background:`linear-gradient(90deg,${color}90,${color})`,
          width:visible?`${level}%`:"0%",
          transition:`width 1s ${delay+0.1}s cubic-bezier(.4,0,.2,1)`,
          boxShadow:`0 0 8px ${color}60`}}/>
      </div>
    </div>
  );
}

export default function StackPage() {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const mousePos   = useRef({x:0,y:0});
  const ringPos    = useRef({x:0,y:0});
  const rafRef     = useRef<number|null>(null);
  const skillsRef  = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const radarRef   = useRef<HTMLDivElement>(null);
  const toolsRef   = useRef<HTMLDivElement>(null);

  const [pageVisible,    setPageVisible]    = useState(false);
  const [skillsVisible,  setSkillsVisible]  = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [radarVisible,   setRadarVisible]   = useState(false);
  const [toolsVisible,   setToolsVisible]   = useState(false);
  const [activeTab,      setActiveTab]      = useState("frontend");
  const [termLines,      setTermLines]      = useState<string[]>([]);
  const [hoveredTool,    setHoveredTool]    = useState<number|null>(null);
  const [menuOpen,       setMenuOpen]       = useState(false);

  useEffect(()=>{
    const onMove=(e:MouseEvent)=>{
      mousePos.current={x:e.clientX,y:e.clientY};
      if(cursorRef.current){cursorRef.current.style.left=e.clientX+"px";cursorRef.current.style.top=e.clientY+"px";}
    };
    window.addEventListener("mousemove",onMove);
    const loop=()=>{
      ringPos.current.x+=(mousePos.current.x-ringPos.current.x)*0.1;
      ringPos.current.y+=(mousePos.current.y-ringPos.current.y)*0.1;
      if(ringRef.current){ringRef.current.style.left=ringPos.current.x+"px";ringRef.current.style.top=ringPos.current.y+"px";}
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>{window.removeEventListener("mousemove",onMove);if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[]);

  useEffect(()=>{const t=setTimeout(()=>setPageVisible(true),80);return()=>clearTimeout(t);},[]);

  useEffect(()=>{
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.target===skillsRef.current  &&e.isIntersecting)setSkillsVisible(true);
        if(e.target===processRef.current &&e.isIntersecting)setProcessVisible(true);
        if(e.target===radarRef.current   &&e.isIntersecting)setRadarVisible(true);
        if(e.target===toolsRef.current   &&e.isIntersecting)setToolsVisible(true);
      });
    },{threshold:0.1});
    [skillsRef,processRef,radarRef,toolsRef].forEach(r=>{if(r.current)obs.observe(r.current);});
    return()=>obs.disconnect();
  },[]);

  useEffect(()=>{
    const LINES=["$ kai --stack --list","▶  Loading tech profile...","✓  Frontend:  React 18, Next.js 16, TypeScript 5","✓  Backend:   Node.js, PostgreSQL, GraphQL, Redis","✓  DevOps:    Docker, AWS, GitHub Actions, Vercel","✓  Testing:   Vitest, Playwright, Storybook","▶  Experience: 5 years · 40+ projects shipped","▶  Status:    [ AVAILABLE FOR WORK ]","$ _"];
    let cancelled=false;
    const handles:ReturnType<typeof setTimeout>[]=[];
    LINES.forEach((line,idx)=>{
      const h=setTimeout(()=>{if(!cancelled&&typeof line==="string")setTermLines(prev=>[...prev,line]);},600+idx*220);
      handles.push(h);
    });
    return()=>{cancelled=true;handles.forEach(clearTimeout);};
  },[]);

  const ce=()=>{if(cursorRef.current){cursorRef.current.style.width="16px";cursorRef.current.style.height="16px";}if(ringRef.current){ringRef.current.style.width="50px";ringRef.current.style.height="50px";ringRef.current.style.opacity="0.3";}};
  const cl=()=>{if(cursorRef.current){cursorRef.current.style.width="8px";cursorRef.current.style.height="8px";}if(ringRef.current){ringRef.current.style.width="32px";ringRef.current.style.height="32px";ringRef.current.style.opacity="1";}};

  const activeCategory=CATEGORIES.find(c=>c.id===activeTab)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#080909;--bg2:#0D0E0B;--bg3:#111310;--ink:#F0EFEA;--ink2:#AEADA8;--lime:#B8F03A;--orange:#FF6B35;--blue:#6B7CFF;--teal:#00C9A7;--border:rgba(240,239,234,.07);--muted:rgba(240,239,234,.35);--grid:rgba(240,239,234,.025);}
        html{scroll-behavior:smooth}
        body{background:var(--bg);font-family:'DM Sans',sans-serif;overflow-x:hidden;color:var(--ink);}
        @media(pointer:fine){body{cursor:none}}
        @media(pointer:coarse){body{cursor:auto}}
        @media(pointer:coarse){.sk-cur{display:none!important}}

        /* ── Responsive layout classes ── */

        /* Topbar */
        .sk-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 28px;height:50px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:rgba(8,9,9,.9);backdropFilter:blur(16px);}
        .sk-top-left{display:flex;align-items:center;gap:16px;}
        .sk-top-right{display:flex;align-items:center;gap:16px;}
        .sk-top-label{display:flex;align-items:center;gap:7px;}
        .sk-top-sep{width:1px;height:14px;background:var(--border);}
        .sk-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:40px;height:40px;background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;padding:0;flex-shrink:0;}
        .sk-mob-menu{display:none;position:fixed;top:50px;left:0;right:0;background:rgba(8,9,9,.97);border-bottom:2px solid var(--lime);z-index:99;backdrop-filter:blur(16px);}

        /* Hero split */
        .sk-hero{display:grid;grid-template-columns:1fr 1fr;min-height:calc(100dvh - 50px);border-bottom:1px solid var(--border);}
        .sk-hero-l{padding:72px 48px 72px 40px;border-right:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;}
        .sk-hero-r{padding:48px 40px;display:flex;flex-direction:column;background:var(--bg2);position:relative;overflow:hidden;}
        .sk-stat-pills{display:flex;flex-wrap:wrap;gap:12px;}

        /* Skills section */
        .sk-skills-grid{display:grid;grid-template-columns:280px 1fr;min-height:480px;}
        .sk-tab-list{border-right:1px solid var(--border);display:flex;flex-direction:column;padding:32px 0;}
        .sk-bars-panel{padding:40px 48px;display:flex;flex-direction:column;gap:0;}
        .sk-legend{display:flex;gap:24px;flex-wrap:wrap;}

        /* Radar + Tools */
        .sk-radar-tools{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);}
        .sk-radar-panel{padding:48px 40px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:32px;background:var(--bg2);}
        .sk-tools-panel{padding:48px 40px;display:flex;flex-direction:column;gap:32px;}
        .sk-tools-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}

        /* Process */
        .sk-process-grid{display:grid;grid-template-columns:240px 1fr;}
        .sk-process-l{padding:48px 40px;border-right:1px solid var(--border);display:flex;flex-direction:column;justify-content:center;background:var(--bg2);}
        .sk-process-r{padding:48px 48px 48px 56px;position:relative;}
        .sk-tl-vline{position:absolute;left:40px;top:48px;bottom:48px;width:1px;background:var(--border);}
        .sk-process-step{display:grid;grid-template-columns:auto 1fr;gap:0;}

        /* CTA */
        .sk-cta{padding:48px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;border-bottom:1px solid var(--border);background:var(--bg2);position:relative;overflow:hidden;}
        .sk-cta-btns{display:flex;gap:12px;flex-wrap:wrap;position:relative;z-index:1;}

        /* Footer */
        .sk-footer{border-top:1px solid var(--border);padding:0 28px;min-height:44px;display:flex;align-items:center;justify-content:space-between;background:rgba(8,9,9,.9);backdrop-filter:blur(8px);flex-wrap:wrap;gap:8px;}

        /* Section divider */
        .sk-divider{padding:0 28px;height:36px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}

        /* ── Tablet ≤ 900px ── */
        @media(max-width:900px){
          .sk-hero{grid-template-columns:1fr;min-height:auto;}
          .sk-hero-l{padding:52px 28px 52px;border-right:none;border-bottom:1px solid var(--border);}
          .sk-hero-r{padding:40px 28px;min-height:50vw;}
          .sk-skills-grid{grid-template-columns:1fr;}
          .sk-tab-list{flex-direction:row;overflow-x:auto;padding:0;border-right:none;border-bottom:1px solid var(--border);scrollbar-width:none;}
          .sk-tab-list::-webkit-scrollbar{display:none;}
          .sk-bars-panel{padding:32px 28px;}
          .sk-radar-tools{grid-template-columns:1fr;}
          .sk-radar-panel{border-right:none;border-bottom:1px solid var(--border);padding:40px 28px;}
          .sk-tools-panel{padding:40px 28px;}
          .sk-tools-grid{grid-template-columns:repeat(3,1fr);}
          @media(max-width:380px){.sk-tools-grid{grid-template-columns:repeat(2,1fr)!important;}}
          .sk-process-grid{grid-template-columns:1fr;}
          .sk-process-l{border-right:none;border-bottom:1px solid var(--border);padding:36px 28px;}
          .sk-process-r{padding:36px 28px;}
          .sk-tl-vline{display:none;}
          .sk-top-label{display:none;}
          .sk-top-sep{display:none;}
          .sk-mob-menu{display:block;}
        }

        /* ── Mobile ≤ 600px ── */
        @media(max-width:600px){
          .sk-topbar{padding:0 16px;}
          .sk-topbar .sk-brand{font-size:15px!important;}
          .sk-top-right{display:none;}
          .sk-burger{display:flex!important;}
          .sk-hero-l,.sk-hero-r{padding:32px 18px;}
          .sk-stat-pills{gap:8px;}
          .sk-bars-panel{padding:24px 18px;}
          .sk-radar-panel,.sk-tools-panel{padding:28px 18px;}
          .sk-tools-grid{grid-template-columns:repeat(3,1fr);}
          @media(max-width:380px){.sk-tools-grid{grid-template-columns:repeat(2,1fr)!important;}}
          .sk-process-l,.sk-process-r{padding:28px 18px;}
          .sk-cta{padding:32px 18px;flex-direction:column;align-items:flex-start;}
          .sk-footer{padding:12px 18px;flex-direction:column;align-items:flex-start;height:auto;}
          .sk-divider{padding:0 16px;}
          .sk-legend{gap:12px;}
        }

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(184,240,58,.35)}50%{opacity:.7;box-shadow:0 0 0 5px rgba(184,240,58,0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes scanH{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
        @keyframes orbit{from{transform:rotate(0deg) translateX(80px) rotate(0deg)}to{transform:rotate(360deg) translateX(80px) rotate(-360deg)}}
        .term-line{animation:fadeIn .15s ease forwards;opacity:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:var(--bg);}
        ::-webkit-scrollbar-thumb{background:rgba(184,240,58,.25);border-radius:2px;}
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="sk-cur" style={{position:"fixed",width:8,height:8,background:"var(--lime)",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",transition:"width .25s,height .25s",mixBlendMode:"screen"}}/>
      <div ref={ringRef}   className="sk-cur" style={{position:"fixed",width:32,height:32,border:"1px solid rgba(184,240,58,.25)",borderRadius:"50%",pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",transition:"width .3s,height .3s,opacity .3s"}}/>

      {/* Grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none",zIndex:0}}/>
      {/* Scanline */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
        <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(to right,transparent,rgba(184,240,58,.03),transparent)",animation:"scanH 12s linear infinite"}}/>
      </div>
      {/* Vignette */}
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,transparent 40%,rgba(8,9,9,.8) 100%)",pointerEvents:"none",zIndex:0}}/>

      {/* ── Topbar ── */}
      <div className="sk-topbar">
        <div className="sk-top-left">
          <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",cursor:"none",transition:"color .2s",display:"flex",alignItems:"center",gap:8}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >← Back</Link>
          <div className="sk-top-sep"/>
          <span className="sk-brand" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:"0.12em",color:"var(--ink)"}}>KAI STUDIO</span>
          <div className="sk-top-sep sk-top-label"/>
          <span className="sk-top-label" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.16em",color:"var(--muted)",textTransform:"uppercase"}}>技术栈 · Stack</span>
        </div>
        <div className="sk-top-right">
          <Link href="/design" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",cursor:"none",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >Design ↗</Link>
          <div className="sk-top-label" style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2.2s infinite"}}/>
            <span>Available</span>
          </div>
        </div>
        {/* Hamburger */}
        <button className="sk-burger" onClick={()=>setMenuOpen(o=>!o)} aria-label="Toggle menu">
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(45deg) translate(2px,2px)":"none"}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",opacity:menuOpen?0:1}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(-45deg) translate(2px,-2px)":"none"}}/>
        </button>
      </div>

      {/* Mobile menu */}
      <div className="sk-mob-menu" style={{transform:menuOpen?"translateY(0)":"translateY(-110%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
        {[{href:"/",label:"← Back to Home"},{href:"/design",label:"◫ Design Pages ↗"},{href:"/contact",label:"✉ Get In Touch"}].map((item,i)=>(
          <Link key={i} href={item.href} onClick={()=>setMenuOpen(false)}
            style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid var(--border)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",textDecoration:"none",color:"var(--muted)",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >{item.label}</Link>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2s infinite"}}/>
          Open to work · 接受项目
        </div>
      </div>
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,top:50,background:"rgba(0,0,0,.5)",zIndex:98,backdropFilter:"blur(2px)"}}/>}

      {/* ── Hero ── */}
      <div className="sk-hero">
        {/* Left */}
        <div className="sk-hero-l">
          <div style={{position:"absolute",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(120px,20vw,280px)",color:"rgba(184,240,58,.03)",lineHeight:1,bottom:-40,left:-20,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.06em"}}>STACK</div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"var(--muted)",textTransform:"uppercase",marginBottom:24,display:"flex",alignItems:"center",gap:14,animation:pageVisible?"fadeUp .7s ease forwards":"none",opacity:0}}>
              <span style={{width:20,height:1,background:"var(--lime)",display:"inline-block"}}/>技术能力 · Skills
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(48px,8vw,96px)",lineHeight:.88,letterSpacing:"0.01em",color:"var(--ink)",animation:pageVisible?"fadeUp .7s .06s ease forwards":"none",opacity:0,marginBottom:8}}>
              WHAT I<br/><span style={{color:"var(--lime)"}}>BUILD</span>{" "}
              <span style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",color:"var(--muted)",fontSize:".5em"}}>with</span>
            </div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(14px,1.8vw,20px)",color:"var(--muted)",lineHeight:1.7,marginTop:20,maxWidth:"min(460px,100%)",animation:pageVisible?"fadeUp .7s .12s ease forwards":"none",opacity:0}}>
              Five years of deliberate practice across the full stack — every tool chosen for craft, not trend.
            </div>
          </div>
          <div className="sk-stat-pills" style={{animation:pageVisible?"fadeUp .7s .2s ease forwards":"none",opacity:0}}>
            {[{val:"40+",label:"Projects",color:"var(--lime)"},{val:"5y",label:"Experience",color:"var(--blue)"},{val:"4",label:"Domains",color:"var(--orange)"},{val:"99%",label:"Uptime",color:"var(--teal)"}].map(s=>(
              <div key={s.label} style={{padding:"14px 18px",border:"1px solid var(--border)",borderRadius:12,background:"rgba(240,239,234,.03)",backdropFilter:"blur(8px)",flex:"1 1 80px",minWidth:0}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(22px,5vw,38px)",lineHeight:.9,color:s.color,letterSpacing:"-0.01em"}}>{s.val}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — terminal */}
        <div className="sk-hero-r">
          <div style={{position:"absolute",top:"50%",right:"clamp(8px,4vw,60px)",width:"clamp(80px,15vw,160px)",height:"clamp(80px,15vw,160px)",marginTop:-80,opacity:.2,pointerEvents:"none"}}>
            <div style={{position:"absolute",inset:0,border:"1px solid var(--lime)",borderRadius:"50%",opacity:.3}}/>
            <div style={{position:"absolute",inset:"25%",border:"1px solid var(--lime)",borderRadius:"50%",opacity:.2}}/>
            {["var(--lime)","var(--blue)","var(--orange)"].map((col,i)=>(
              <div key={i} style={{position:"absolute",top:"50%",left:"50%",marginTop:-4,marginLeft:-4,width:8,height:8,borderRadius:"50%",background:col,animation:`orbit ${4+i*2}s linear infinite`,animationDelay:`${i*1.2}s`}}/>
            ))}
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden",background:"rgba(8,9,9,.85)",backdropFilter:"blur(12px)",boxShadow:"0 24px 64px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.04)",flex:1,display:"flex",flexDirection:"column",animation:pageVisible?"fadeUp .7s .16s ease forwards":"none",opacity:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid var(--border)",background:"rgba(240,239,234,.03)"}}>
              <div style={{display:"flex",gap:6}}>
                {["#FF5F57","#FEBC2E","#28C840"].map(col=><div key={col} style={{width:10,height:10,borderRadius:"50%",background:col,opacity:.85}}/>)}
              </div>
              <span style={{fontSize:9,letterSpacing:"0.12em",color:"rgba(240,239,234,.2)",textTransform:"uppercase"}}>kai@studio — zsh</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:7,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>live</span>
              </div>
            </div>
            <div style={{padding:"16px 20px",flex:1,display:"flex",flexDirection:"column",gap:6,overflowY:"auto",minHeight:220}}>
              {termLines.filter((l):l is string=>typeof l==="string"&&l.length>0).map((line,i)=>{
                const isCmd=line.startsWith("$");const isOk=line.startsWith("✓");const isArrow=line.startsWith("▶");const isCursor=line==="$ _";
                return(
                  <div key={i} className="term-line" style={{fontSize:11,letterSpacing:"0.04em",lineHeight:1.6,color:isCmd?"var(--lime)":isOk?"rgba(184,240,58,.7)":isArrow?"rgba(107,124,255,.9)":"rgba(240,239,234,.5)"}}>
                    {isCursor?<span>$ <span style={{animation:"blink 1s infinite",display:"inline-block",width:7,height:12,background:"var(--lime)",verticalAlign:"middle",marginBottom:1}}/></span>:line}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ── */}
      <div ref={skillsRef} style={{borderBottom:"1px solid var(--border)"}}>
        <div className="sk-divider">
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",display:"flex",alignItems:"center",gap:12}}>
            <span style={{width:16,height:1,background:"var(--lime)",display:"inline-block"}}/>技能明细 · Skill Breakdown
          </div>
          <div style={{display:"flex",gap:8}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:i<3?"var(--lime)":"var(--border)"}}/>)}</div>
        </div>
        <div className="sk-skills-grid">
          {/* Tab list */}
          <div className="sk-tab-list">
            {CATEGORIES.map((cat,i)=>(
              <div key={cat.id} onMouseEnter={ce} onMouseLeave={cl} onClick={()=>setActiveTab(cat.id)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"16px 24px",cursor:"none",transition:"background .2s",position:"relative",flexShrink:0,background:activeTab===cat.id?"rgba(240,239,234,.04)":"transparent",animation:skillsVisible?`fadeUp .6s ${i*.07}s ease forwards`:"none",opacity:0}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:cat.color,opacity:activeTab===cat.id?1:0,transition:"opacity .25s"}}/>
                <span style={{fontSize:16,color:activeTab===cat.id?cat.color:"var(--muted)",transition:"color .25s",flexShrink:0}}>{cat.icon}</span>
                <div style={{minWidth:0,overflow:"hidden"}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:activeTab===cat.id?"var(--ink)":"var(--muted)",letterSpacing:"0.02em",transition:"color .25s",whiteSpace:"nowrap"}}>{cat.label.split(" · ")[0]}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(240,239,234,.2)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{cat.label.split(" · ")[1]}</div>
                </div>
                {activeTab===cat.id&&<div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:cat.color,animation:"pulse 2s infinite",flexShrink:0}}/>}
              </div>
            ))}
          </div>
          {/* Bars */}
          <div className="sk-bars-panel">
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32,gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:activeCategory.color,textTransform:"uppercase",marginBottom:6}}>{activeCategory.label}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(28px,4vw,52px)",lineHeight:.9,color:"var(--ink)",letterSpacing:"0.01em"}}>
                  {activeCategory.label.split(" · ")[0]}{" "}
                  <span style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",color:"var(--muted)",fontSize:".55em"}}>proficiency</span>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(48px,8vw,80px)",lineHeight:.85,color:`${activeCategory.color}15`,letterSpacing:"-0.04em",userSelect:"none"}}>{activeCategory.icon}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:22}}>
              {activeCategory.skills.map((s,i)=>(
                <SkillBar key={s.name} name={s.name} level={s.level} yrs={s.yrs} color={activeCategory.color} visible={skillsVisible} delay={0.05+i*0.08}/>
              ))}
            </div>
            <div style={{marginTop:32,paddingTop:20,borderTop:"1px solid var(--border)"}}>
              <div className="sk-legend">
                {[["0–59","Learning"],["60–79","Proficient"],["80–89","Advanced"],["90+","Expert"]].map(([range,label])=>(
                  <div key={range} style={{display:"flex",flexDirection:"column",gap:3}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:activeCategory.color,letterSpacing:"0.02em"}}>{range}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(240,239,234,.25)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Radar + Tools ── */}
      <div className="sk-radar-tools">
        <div ref={radarRef} className="sk-radar-panel">
          <div style={{animation:radarVisible?"fadeUp .6s ease forwards":"none",opacity:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <span style={{width:14,height:1,background:"var(--lime)",display:"inline-block"}}/>能力图谱 · Capability Map
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(26px,3.5vw,44px)",lineHeight:.9,color:"var(--ink)"}}>SKILL RADAR</div>
          </div>
          <div style={{display:"flex",justifyContent:"center",animation:radarVisible?"fadeUp .7s .1s ease forwards":"none",opacity:0}}>
            <RadarChart visible={radarVisible}/>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,animation:radarVisible?"fadeUp .6s .2s ease forwards":"none",opacity:0}}>
            {RADAR_SKILLS.map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",border:"1px solid var(--border)",borderRadius:100}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"var(--lime)"}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</span>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--lime)",letterSpacing:"0.04em"}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div ref={toolsRef} className="sk-tools-panel">
          <div style={{animation:toolsVisible?"fadeUp .6s ease forwards":"none",opacity:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <span style={{width:14,height:1,background:"var(--orange)",display:"inline-block"}}/>日常工具 · Daily Tools
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(26px,3.5vw,44px)",lineHeight:.9,color:"var(--ink)"}}>DAILY TOOLKIT</div>
          </div>
          <div className="sk-tools-grid">
            {TOOLS_GRID.map((tool,i)=>(
              <div key={tool.name}
                onMouseEnter={()=>{setHoveredTool(i);ce();}}
                onMouseLeave={()=>{setHoveredTool(null);cl();}}
                style={{padding:"12px 10px",border:"1px solid var(--border)",borderRadius:10,cursor:"none",transition:"all .2s",
                  background:hoveredTool===i?"rgba(240,239,234,.05)":"rgba(240,239,234,.02)",
                  borderColor:hoveredTool===i?"rgba(240,239,234,.15)":"var(--border)",
                  boxShadow:hoveredTool===i?"0 4px 20px rgba(0,0,0,.4)":"none",
                  transform:hoveredTool===i?"translateY(-2px)":"none",
                  animation:toolsVisible?`fadeUp .5s ${i*.04}s ease forwards`:"none",opacity:0,
                  display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
                <span style={{fontSize:18}}>{tool.icon}</span>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:600,color:"rgba(240,239,234,.7)",letterSpacing:"0.01em"}}>{tool.name}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(240,239,234,.2)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>{tool.cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Process ── */}
      <div ref={processRef} style={{borderBottom:"1px solid var(--border)"}}>
        <div className="sk-divider">
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",display:"flex",alignItems:"center",gap:12}}>
            <span style={{width:16,height:1,background:"var(--orange)",display:"inline-block"}}/>工作流程 · How I Work
          </div>
        </div>
        <div className="sk-process-grid">
          <div className="sk-process-l">
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(36px,5vw,64px)",lineHeight:.9,color:"var(--ink)",letterSpacing:"0.01em",animation:processVisible?"fadeUp .6s ease forwards":"none",opacity:0}}>
              THE<br/>PROCESS<br/><span style={{color:"var(--orange)"}}>流程</span>
            </div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:14,color:"var(--muted)",lineHeight:1.65,marginTop:20,animation:processVisible?"fadeUp .6s .1s ease forwards":"none",opacity:0}}>
              Every great product starts with a great process. Here's how I turn a brief into a shipped, production-ready codebase.
            </div>
          </div>
          <div className="sk-process-r">
            <div className="sk-tl-vline"/>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {PROCESS.map((step,i)=>(
                <div key={step.phase} className="sk-process-step"
                  style={{paddingBottom:i<PROCESS.length-1?36:0,animation:processVisible?`fadeUp .6s ${i*.1}s ease forwards`:"none",opacity:0}}>
                  <div style={{width:48,display:"flex",flexDirection:"column",alignItems:"center",gap:0,position:"relative"}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:"var(--bg)",border:"1.5px solid var(--orange)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:2,marginLeft:-12,flexShrink:0}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"var(--orange)",letterSpacing:"0.04em"}}>{step.phase}</span>
                    </div>
                    {i<PROCESS.length-1&&<div style={{flex:1,width:1,background:"linear-gradient(to bottom,var(--orange)40,transparent)",marginTop:4}}/>}
                  </div>
                  <div style={{paddingLeft:16}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(20px,2.5vw,32px)",lineHeight:.9,color:"var(--ink)",letterSpacing:"0.01em"}}>{step.title}</div>
                      <div style={{fontFamily:"'Noto Serif SC',serif",fontSize:13,color:"rgba(240,239,234,.2)",letterSpacing:"0.1em"}}>{step.zh}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--orange)",letterSpacing:"0.12em",textTransform:"uppercase",padding:"2px 8px",border:"1px solid rgba(255,107,53,.3)",borderRadius:3}}>{step.duration}</div>
                    </div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.65,color:"var(--muted)",marginBottom:10,maxWidth:"min(560px,100%)"}}>{step.desc}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {step.tools.map(t=>(
                        <span key={t} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.08em",textTransform:"uppercase",padding:"3px 8px",border:"1px solid var(--border)",color:"rgba(240,239,234,.3)",borderRadius:3}}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA strip ── */}
      <div className="sk-cta">
        <div style={{position:"absolute",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(60px,12vw,160px)",color:"rgba(184,240,58,.025)",lineHeight:1,right:-20,top:-10,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.04em"}}>HIRE</div>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>接受工作 · Open for new projects</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(24px,4vw,52px)",lineHeight:.9,color:"var(--ink)",letterSpacing:"0.01em"}}>READY TO BUILD<br/><span style={{color:"var(--lime)"}}>SOMETHING GREAT?</span></div>
        </div>
        <div className="sk-cta-btns">
          <Link href="/#contact" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"13px 28px",background:"var(--lime)",color:"#080909",border:"none",borderRadius:100,cursor:"none",textDecoration:"none",display:"flex",alignItems:"center",gap:8,transition:"opacity .2s"}}>
            联系我 · Get In Touch ↗
          </Link>
          <Link href="/design" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"13px 24px",background:"transparent",color:"var(--ink)",border:"1px solid var(--border)",borderRadius:100,cursor:"none",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
            查看作品 · View Work
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="sk-footer">
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"rgba(240,239,234,.15)",textTransform:"uppercase"}}>© 2025 Kai Studio · Stack</span>
        <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
          style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"rgba(240,239,234,.25)",textTransform:"uppercase",cursor:"none",textDecoration:"none",transition:"color .2s",display:"flex",alignItems:"center",gap:8}}
          onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
          onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="rgba(240,239,234,.25)"}
        >← Back to Home</Link>
      </div>
    </>
  );
}