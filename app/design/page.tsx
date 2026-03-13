"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PAGES = [
  { id:"01", slug:"nexus-dashboard",    title:"Nexus",  sub:"Dashboard",    year:"2025", tag:"Analytics · 分析",       desc:"Real-time analytics platform with live data visualisation, user segmentation, and performance monitoring across 200k+ monthly active users.", stack:["Next.js 14","React","D3.js","GraphQL","Postgres"],                    accent:"#B8F03A", bg:"#0E0F0C", preview:"📊" },
  { id:"02", slug:"flowapi-platform",   title:"FlowAPI",sub:"Platform",      year:"2024", tag:"Developer Tools · 开发工具",desc:"Enterprise API management platform. Build, test, monitor, and version RESTful & GraphQL endpoints with a fully visual no-code layer.",         stack:["React","Node.js","Docker","PostgreSQL","Redis"],                      accent:"#6B7CFF", bg:"#0A0B1A", preview:"⌥"  },
  { id:"03", slug:"atlas-commerce",     title:"Atlas",  sub:"Commerce",      year:"2024", tag:"E-Commerce · 电商",       desc:"High-conversion storefront with headless architecture, integrated payment gateways, and a 28% reduction in checkout drop-off after launch.",     stack:["React","Redux","Stripe","Figma","Vercel"],                           accent:"#FF6B35", bg:"#130A05", preview:"◉"  },
  { id:"04", slug:"orion-design-system",title:"Orion",  sub:"Design System", year:"2024", tag:"UI Kit · 设计系统",       desc:"A comprehensive design system with 120+ components, dark/light tokens, full Storybook documentation, and Figma source-of-truth sync.",           stack:["React","TypeScript","Storybook","CSS Modules","Figma"],              accent:"#E8432D", bg:"#130505", preview:"◫"  },
  { id:"05", slug:"tide-mobile",        title:"Tide",   sub:"Mobile App",    year:"2023", tag:"Finance · 金融",          desc:"Personal finance tracker with real-time spending insights, automated categorisation via ML, and cross-bank sync via open banking APIs.",           stack:["React Native","TypeScript","Expo","Plaid API","SQLite"],             accent:"#00C9A7", bg:"#041310", preview:"◈"  },
  { id:"06", slug:"echo-ai",            title:"Echo",   sub:"AI Interface",  year:"2023", tag:"AI · 人工智能",           desc:"Conversational AI assistant with long-term memory, structured output rendering, and a streaming response engine built on the Anthropic API.",     stack:["Next.js","TypeScript","Anthropic SDK","Tailwind","Vercel AI"],       accent:"#C084FC", bg:"#0D0516", preview:"✦"  },
];

export default function DesignPages() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const mousePos  = useRef({ x:0, y:0 });
  const ringPos   = useRef({ x:0, y:0 });
  const rafRef    = useRef<number|null>(null);

  const [hovered,   setHovered]   = useState<number|null>(null);
  const [selected,  setSelected]  = useState<number|null>(null);
  const [visible,   setVisible]   = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Custom cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x:e.clientX, y:e.clientY };
      if (cursorRef.current) { cursorRef.current.style.left=e.clientX+"px"; cursorRef.current.style.top=e.clientY+"px"; }
    };
    window.addEventListener("mousemove", onMove);
    const loop = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.1;
      if (ringRef.current) { ringRef.current.style.left=ringPos.current.x+"px"; ringRef.current.style.top=ringPos.current.y+"px"; }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const ce = () => {
    if(cursorRef.current){cursorRef.current.style.width="16px";cursorRef.current.style.height="16px";}
    if(ringRef.current){ringRef.current.style.width="50px";ringRef.current.style.height="50px";ringRef.current.style.opacity="0.3";}
  };
  const cl = () => {
    if(cursorRef.current){cursorRef.current.style.width="8px";cursorRef.current.style.height="8px";}
    if(ringRef.current){ringRef.current.style.width="32px";ringRef.current.style.height="32px";ringRef.current.style.opacity="1";}
  };

  // On mobile tap opens the detail drawer; on desktop hover shows side panel
  const activeIndex = isMobile ? selected : hovered;
  const active = activeIndex !== null ? PAGES[activeIndex] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0E0F0C;--ink:#F5F4F0;--ink2:#AEADA8;--lime:#B8F03A;--border:rgba(245,244,240,.08);--grid:rgba(245,244,240,.03);--muted:rgba(245,244,240,.35);}
        html{scroll-behavior:smooth}
        body{background:var(--bg);font-family:'DM Sans',sans-serif;overflow-x:hidden;color:var(--ink);scrollbar-gutter:stable both-edges}
        @media(pointer:fine){body{cursor:none}}
        @media(pointer:coarse){body{cursor:auto}.dg-cur{display:none!important}}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn {from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse   {0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(184,240,58,.35)}50%{opacity:.7;box-shadow:0 0 0 5px rgba(184,240,58,0)}}
        @keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}

        /* ── Topbar ── */
        .dg-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 28px;height:50px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:rgba(14,15,12,.92);backdrop-filter:blur(16px);}
        .dg-top-l{display:flex;align-items:center;gap:16px;}
        .dg-top-r{display:flex;align-items:center;gap:16px;}
        .dg-top-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;color:var(--muted);text-transform:uppercase;}
        .dg-top-sep{width:1px;height:14px;background:var(--border);}
        .dg-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:40px;height:40px;background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;padding:0;flex-shrink:0;}
        .dg-mob-menu{display:none;position:fixed;top:50px;left:0;right:0;background:rgba(14,15,12,.97);border-bottom:2px solid var(--lime);z-index:99;backdrop-filter:blur(16px);}

        /* ── Hero header ── */
        .dg-hero{padding:52px 28px 40px;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}

        /* ── Main layout ── */
        .dg-layout{display:grid;grid-template-columns:2fr 1fr;min-height:calc(100vh - 200px);}
        .dg-list{grid-column:1/2;border-right:1px solid var(--border);}
        .dg-detail{position:sticky;top:50px;height:calc(100vh - 50px);overflow:hidden;display:flex;flex-direction:column;contain:strict;}

        /* ── Project row ── */
        .dg-row{padding:28px 28px;border-bottom:1px solid var(--border);cursor:none;transition:background .3s, padding-left .25s;position:relative;overflow:hidden;}
        .dg-row-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
        .dg-row-preview{width:64px;height:64px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px;transition:border-color .3s,background .3s;}
        .dg-row-meta{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
        .dg-stack-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px;}

        /* Mobile tap-to-expand drawer */
        .dg-drawer{display:none;overflow:hidden;transition:max-height .4s cubic-bezier(.4,0,.2,1),opacity .35s;max-height:0;opacity:0;}
        .dg-drawer.open{max-height:600px;opacity:1;}

        /* ── Footer ── */
        .dg-footer{border-top:1px solid var(--border);padding:0 28px;min-height:44px;display:flex;align-items:center;justify-content:space-between;background:rgba(14,15,12,.88);backdrop-filter:blur(8px);flex-wrap:wrap;gap:8px;}

        /* ── TABLET ≤ 900px ── */
        @media(max-width:900px){
          .dg-layout{grid-template-columns:1fr;}
          .dg-detail{display:none;}  /* hidden — mobile uses inline drawers */
          .dg-list{grid-column:1/2;border-right:none;}
          .dg-drawer{display:block;}
          .dg-row{cursor:pointer;}
          .dg-top-label{display:none;}
          .dg-top-sep{display:none;}
          .dg-mob-menu{display:block;}
        }

        /* ── MOBILE ≤ 600px ── */
        @media(max-width:600px){
          .dg-topbar{padding:0 16px;}
          .dg-top-r{display:none;}
          .dg-burger{display:flex!important;}
          .dg-hero{padding:32px 18px 28px;}
          .dg-row{padding:20px 18px;}
          .dg-row-preview{width:52px;height:52px;font-size:22px;}
          .dg-footer{padding:12px 18px;flex-direction:column;align-items:flex-start;height:auto;}
        }
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="dg-cur" style={{position:"fixed",width:8,height:8,background:"var(--lime)",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",transition:"width .25s,height .25s",mixBlendMode:"screen"}}/>
      <div ref={ringRef}   className="dg-cur" style={{position:"fixed",width:32,height:32,border:"1px solid rgba(184,240,58,.3)",borderRadius:"50%",pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",transition:"width .3s,height .3s,opacity .3s"}}/>

      {/* Fixed grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none",zIndex:0}}/>
      {/* Scanline */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
        <div style={{position:"absolute",left:0,right:0,height:1,background:"linear-gradient(to right,transparent,rgba(184,240,58,.04),transparent)",animation:"scanline 8s linear infinite"}}/>
      </div>
      {/* Dynamic BG */}
      <div style={{position:"fixed",inset:0,background:active?active.bg:"var(--bg)",transition:"background .5s ease",zIndex:-1,pointerEvents:"none"}}/>

      {/* ── Topbar ── */}
      <div className="dg-topbar">
        <div className="dg-top-l">
          <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
            style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"none",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >← Back</Link>
          <div className="dg-top-sep"/>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:"0.12em",color:"var(--ink)"}}>KAI STUDIO</span>
          <div className="dg-top-sep dg-top-label"/>
          <span className="dg-top-label">设计页面 · Design</span>
        </div>
        <div className="dg-top-r">
          <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2.2s infinite"}}/>
            <span>{PAGES.length} Projects</span>
          </div>
          <Link href="/stack" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",cursor:"none",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >Stack ↗</Link>
        </div>
        {/* Hamburger */}
        <button className="dg-burger" onClick={()=>setMenuOpen(o=>!o)} aria-label="Toggle menu">
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(45deg) translate(2px,2px)":"none"}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",opacity:menuOpen?0:1}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--lime)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(-45deg) translate(2px,-2px)":"none"}}/>
        </button>
      </div>

      {/* Mobile menu */}
      <div className="dg-mob-menu" style={{transform:menuOpen?"translateY(0)":"translateY(-110%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
        {[{href:"/",label:"← Back to Home"},{href:"/stack",label:"◩ Stack ↗"},{href:"/contact",label:"✉ Get In Touch"}].map((item,i)=>(
          <Link key={i} href={item.href} onClick={()=>setMenuOpen(false)}
            style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid var(--border)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",textDecoration:"none",color:"var(--muted)",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >{item.label}</Link>
        ))}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2s infinite"}}/>Open to work
          </div>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(245,244,240,.2)"}}>{PAGES.length} projects</span>
        </div>
      </div>
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,top:50,background:"rgba(0,0,0,.5)",zIndex:98,backdropFilter:"blur(2px)"}}/>}

      {/* ── Hero Header ── */}
      <div className="dg-hero">
        <div style={{position:"absolute",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(80px,16vw,220px)",color:"rgba(245,244,240,.025)",lineHeight:1,bottom:-10,right:-10,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.04em",zIndex:0}}>WORK</div>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"var(--muted)",textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:14,animation:visible?"fadeUp .6s ease forwards":"none",opacity:0}}>
            <span style={{width:20,height:1,background:"var(--lime)",display:"inline-block"}}/>设计作品集 · Design Portfolio
          </div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(44px,8vw,100px)",lineHeight:.88,letterSpacing:"0.01em",color:"var(--ink)",animation:visible?"fadeUp .7s .06s ease forwards":"none",opacity:0}}>
            SELECTED<br/><span style={{color:"var(--lime)"}}>DESIGN</span>{" "}
            <span style={{color:"var(--muted)",fontSize:"0.55em",fontFamily:"'Instrument Serif',serif",fontStyle:"italic"}}>& Build Work</span>
          </div>
          <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(13px,1.6vw,19px)",color:"var(--muted)",lineHeight:1.65,marginTop:16,maxWidth:"min(560px,100%)",animation:visible?"fadeUp .7s .12s ease forwards":"none",opacity:0}}>
            A curated collection of interfaces, systems, and products — each built with intention, refined through iteration, and shipped with care.
          </div>
          {/* Mobile hint */}
          <div style={{marginTop:16,fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.18em",color:"rgba(245,244,240,.18)",textTransform:"uppercase",animation:visible?"fadeUp .7s .2s ease forwards":"none",opacity:0}}
            className="dg-top-label"
          >tap a project to expand · 点击展开</div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="dg-layout">

        {/* Project list */}
        <div className="dg-list">
          {PAGES.map((p, i) => {
            const isHov    = hovered === i;
            const isSel    = selected === i;
            const isActive = isMobile ? isSel : isHov;

            return (
              <div key={p.id}
                className="dg-row"
                onMouseEnter={()=>{if(!isMobile){setHovered(i);ce();}}}
                onMouseLeave={()=>{if(!isMobile){setHovered(null);cl();}}}
                onClick={()=>{if(isMobile)setSelected(s=>s===i?null:i);}}
                style={{
                  animation:visible?`fadeUp .7s ${.08+i*.06}s ease forwards`:"none",
                  opacity:0,
                  background: isActive ? "rgba(245,244,240,.03)" : "transparent",
                  paddingLeft: isHov && !isMobile ? 40 : 28,
                }}
              >
                {/* Accent left bar */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:p.accent,transform:`scaleY(${isActive?1:0})`,transition:"transform .3s",transformOrigin:"top"}}/>

                <div className="dg-row-header">
                  <div style={{flex:1,minWidth:0}}>
                    <div className="dg-row-meta">
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:p.accent,background:"rgba(245,244,240,.06)",padding:"2px 8px",letterSpacing:"0.1em",flexShrink:0}}>{p.id}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{p.tag}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(245,244,240,.2)",letterSpacing:"0.08em",flexShrink:0}}>· {p.year}</span>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(28px,4vw,48px)",lineHeight:.9,letterSpacing:"0.01em",color:"var(--ink)",marginBottom:10}}>
                      {p.title} <span style={{color:"var(--muted)",fontSize:".62em",fontFamily:"'Instrument Serif',serif",fontStyle:"italic"}}>{p.sub}</span>
                    </div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.6,color:"var(--muted)",maxWidth:"min(480px,100%)"}}>{p.desc}</div>
                    <div className="dg-stack-chips">
                      {p.stack.map(s=>(
                        <span key={s} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.08em",textTransform:"uppercase",padding:"3px 9px",border:"1px solid var(--border)",color:"rgba(245,244,240,.35)",borderRadius:3}}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Preview icon */}
                  <div className="dg-row-preview"
                    style={{background:"rgba(245,244,240,.04)",border:`1px solid ${isActive?p.accent+"60":"var(--border)"}`,boxShadow:isActive?`0 0 24px ${p.accent}18`:"none"}}>
                    {p.preview}
                  </div>
                </div>

                {/* Desktop hover arrow */}
                {!isMobile && (
                  <div style={{position:"absolute",right:24,bottom:20,opacity:isHov?1:0,transition:"opacity .25s,transform .25s",transform:isHov?"translate(0,0) rotate(-30deg)":"translate(-6px,6px) rotate(-30deg)",fontFamily:"'JetBrains Mono',monospace",fontSize:18,color:p.accent}}>↗</div>
                )}

                {/* Mobile tap indicator */}
                {isMobile && (
                  <div style={{position:"absolute",right:18,top:"50%",transform:`translateY(-50%) rotate(${isSel?"-90deg":"0deg"})`,transition:"transform .3s",fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:p.accent,opacity:.6}}>↓</div>
                )}

                {/* ── Inline mobile drawer ── */}
                <div className={`dg-drawer${isSel?" open":""}`}>
                  <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${p.accent}30`}}>
                    {/* Big icon + CTA */}
                    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                      <div style={{width:64,height:64,background:`${p.accent}14`,border:`1px solid ${p.accent}40`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,boxShadow:`0 0 24px ${p.accent}18`}}>
                        {p.preview}
                      </div>
                      <div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:p.accent,textTransform:"uppercase",marginBottom:4}}>{p.tag}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Full-stack · {p.year}</div>
                      </div>
                    </div>

                    {/* Stack list */}
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:"rgba(245,244,240,.2)",textTransform:"uppercase",marginBottom:10}}>Stack · 技术栈</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
                      {p.stack.map(s=>(
                        <div key={s} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",border:"1px solid var(--border)",borderRadius:100}}>
                          <div style={{width:4,height:4,borderRadius:"50%",background:p.accent,flexShrink:0}}/>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(245,244,240,.6)",letterSpacing:"0.05em"}}>{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={(e)=>{e.stopPropagation();alert("Case study coming soon!");}}
                      style={{display:"inline-flex",alignItems:"center",gap:10,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"11px 22px",background:p.accent,color:"#0E0F0C",border:"none",borderRadius:100,cursor:"pointer",marginBottom:4}}>
                      查看案例 · View Case Study ↗
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop sticky detail panel ── */}
        <div className="dg-detail"
          style={{background:active?`${active.bg}cc`:"rgba(14,15,12,.5)",transition:"background .4s",backdropFilter:"blur(4px)"}}>
          {active ? (
            <div style={{padding:36,display:"flex",flexDirection:"column",height:"100%",animation:"slideIn .3s ease forwards"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(80px,11vw,150px)",lineHeight:.85,color:`${active.accent}18`,letterSpacing:"-0.04em",marginBottom:-16,userSelect:"none"}}>{active.id}</div>
              <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:16,overflow:"hidden",minHeight:0}}>
                <div style={{width:80,height:80,background:`${active.accent}14`,border:`1px solid ${active.accent}40`,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:`0 0 40px ${active.accent}20`,flexShrink:0}}>
                  {active.preview}
                </div>
                <div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:active.accent,textTransform:"uppercase",marginBottom:8}}>{active.tag}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(32px,4vw,56px)",lineHeight:.88,color:"var(--ink)",marginBottom:12,letterSpacing:"0.01em"}}>
                    {active.title}<br/><span style={{color:"var(--muted)",fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:".62em"}}>{active.sub}</span>
                  </div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.65,color:"var(--muted)"}}>{active.desc}</div>
                </div>
                <div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:"rgba(245,244,240,.2)",textTransform:"uppercase",marginBottom:10}}>Stack · 技术栈</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {active.stack.map((s,i)=>(
                      <div key={s} style={{display:"flex",alignItems:"center",gap:10,animation:`slideIn .25s ${i*.04}s ease forwards`,opacity:0}}>
                        <div style={{width:4,height:4,borderRadius:"50%",background:active.accent,flexShrink:0}}/>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(245,244,240,.6)",letterSpacing:"0.05em"}}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onMouseEnter={ce} onMouseLeave={cl}
                  onClick={()=>alert("Case study coming soon!")}
                  style={{display:"inline-flex",alignItems:"center",gap:10,alignSelf:"flex-start",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 24px",background:active.accent,color:"#0E0F0C",border:"none",borderRadius:100,cursor:"none",transition:"opacity .2s"}}>
                  查看案例 · View Case Study <span>↗</span>
                </button>
              </div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.14em",color:"rgba(245,244,240,.12)",textTransform:"uppercase",borderTop:"1px solid var(--border)",paddingTop:16}}>
                {active.year} · 凯 · KAI STUDIO
              </div>
            </div>
          ) : (
            <div style={{padding:36,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",gap:16}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(60px,10vw,130px)",color:"rgba(245,244,240,.04)",lineHeight:.9,letterSpacing:"-0.04em",userSelect:"none"}}>选<br/>择</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"rgba(245,244,240,.15)",textTransform:"uppercase"}}>Hover a project · 悬停项目</div>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                {PAGES.map(p=><div key={p.id} style={{width:6,height:6,borderRadius:"50%",background:p.accent,opacity:.35}}/>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="dg-footer">
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"rgba(245,244,240,.2)",textTransform:"uppercase"}}>© 2025 Kai Studio · 设计作品集</span>
        <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
          style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"rgba(245,244,240,.3)",textTransform:"uppercase",cursor:"none",textDecoration:"none",transition:"color .2s",display:"flex",alignItems:"center",gap:8}}
          onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--lime)"}
          onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="rgba(245,244,240,.3)"}
        >← Back to Home</Link>
      </div>
    </>
  );
}