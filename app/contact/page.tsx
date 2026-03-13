"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const PROJECT_TYPES = [
  { id:"webapp",  label:"Web Application", zh:"网页应用", icon:"◧" },
  { id:"api",     label:"API / Backend",   zh:"接口开发", icon:"◨" },
  { id:"ecomm",   label:"E-Commerce",      zh:"电商平台", icon:"◩" },
  { id:"dash",    label:"Dashboard",       zh:"数据平台", icon:"◪" },
  { id:"consult", label:"Consulting",      zh:"技术咨询", icon:"◫" },
  { id:"other",   label:"Something else",  zh:"其他",     icon:"✦" },
];

const BUDGETS = [
  { id:"sub5",   label:"< $5k",      note:"Small scope"  },
  { id:"5to15",  label:"$5k–$15k",   note:"Standard"     },
  { id:"15to30", label:"$15k–$30k",  note:"Most common"  },
  { id:"30to60", label:"$30k–$60k",  note:"Full product" },
  { id:"60plus", label:"$60k+",      note:"Enterprise"   },
  { id:"tbd",    label:"Let's talk", note:"Flexible"     },
];

const TIMELINES = [
  { id:"asap", label:"ASAP",     note:"< 2 wks"  },
  { id:"1mo",  label:"1 Month",  note:"Tight"    },
  { id:"3mo",  label:"3 Months", note:"Standard" },
  { id:"6mo",  label:"6 Months", note:"Relaxed"  },
  { id:"flex", label:"Flexible", note:"No rush"  },
];

const STEP_LABELS = ["You","Project","Scope","Message"];

function FieldWrap({ label, error, hint, children, grow }: {
  label:string; error?:string; hint?:string; children:React.ReactNode; grow?:boolean;
}) {
  return (
    <div style={{padding:"16px 0 12px",borderBottom:"1px solid var(--border)",display:"flex",flexDirection:"column",flex:grow?1:undefined}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",color:error?"var(--rust)":"var(--muted)"}}>
          {error?`⚠ ${error}`:label}
        </span>
        {hint&&!error&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",letterSpacing:"0.08em"}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SelectChip({ label, sub, selected, onClick, onMouseEnter, onMouseLeave }: {
  label:string; sub?:string; selected:boolean;
  onClick:()=>void; onMouseEnter:()=>void; onMouseLeave:()=>void;
}) {
  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{padding:"10px 14px",borderRadius:10,cursor:"none",border:`1px solid ${selected?"var(--gold)":"var(--border)"}`,background:selected?"rgba(197,159,90,0.08)":"transparent",transition:"all .18s",boxShadow:selected?"0 2px 14px rgba(197,159,90,0.14)":"none"}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:selected?"var(--gold2)":"var(--ink)",letterSpacing:"0.01em"}}>{label}</div>
      {sub&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>{sub}</div>}
    </div>
  );
}

export default function ContactPage() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const mouse     = useRef({x:0,y:0});
  const ringPos   = useRef({x:0,y:0});
  const rafId     = useRef<number|null>(null);

  const [visible,   setVisible]   = useState(false);
  const [step,      setStep]      = useState(0);
  const [sent,      setSent]      = useState(false);
  const [shaking,   setShaking]   = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [clockStr,  setClockStr]  = useState("");
  const [errors,    setErrors]    = useState<Record<string,string>>({});
  const [menuOpen,  setMenuOpen]  = useState(false);

  const [form, setFormState] = useState({
    name:"", email:"", company:"", projectType:"", budget:"", timeline:"", message:"",
  });

  useEffect(()=>{
    const tick=()=>setClockStr(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"}));
    tick(); const iv=setInterval(tick,30_000); return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    const onMove=(e:MouseEvent)=>{
      mouse.current={x:e.clientX,y:e.clientY};
      if(cursorRef.current){cursorRef.current.style.left=e.clientX+"px";cursorRef.current.style.top=e.clientY+"px";}
    };
    window.addEventListener("mousemove",onMove);
    const loop=()=>{
      ringPos.current.x+=(mouse.current.x-ringPos.current.x)*0.09;
      ringPos.current.y+=(mouse.current.y-ringPos.current.y)*0.09;
      if(ringRef.current){ringRef.current.style.left=ringPos.current.x+"px";ringRef.current.style.top=ringPos.current.y+"px";}
      rafId.current=requestAnimationFrame(loop);
    };
    rafId.current=requestAnimationFrame(loop);
    return()=>{window.removeEventListener("mousemove",onMove);if(rafId.current)cancelAnimationFrame(rafId.current);};
  },[]);

  useEffect(()=>{const t=setTimeout(()=>setVisible(true),60);return()=>clearTimeout(t);},[]);

  const ce=useCallback(()=>{
    if(cursorRef.current){cursorRef.current.style.width="14px";cursorRef.current.style.height="14px";}
    if(ringRef.current){ringRef.current.style.width="46px";ringRef.current.style.height="46px";ringRef.current.style.opacity="0.35";}
  },[]);
  const cl=useCallback(()=>{
    if(cursorRef.current){cursorRef.current.style.width="8px";cursorRef.current.style.height="8px";}
    if(ringRef.current){ringRef.current.style.width="30px";ringRef.current.style.height="30px";ringRef.current.style.opacity="1";}
  },[]);

  const setField=(k:string,v:string)=>{
    setFormState(p=>({...p,[k]:v}));
    setErrors(p=>{const n={...p};delete n[k];return n;});
  };

  const validate=():boolean=>{
    const e:Record<string,string>={};
    if(step===0){if(!form.name.trim())e.name="Name is required";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))e.email="Valid email required";}
    if(step===1&&!form.projectType)e.projectType="Pick a project type";
    if(step===2){if(!form.budget)e.budget="Pick a budget";if(!form.timeline)e.timeline="Pick a timeline";}
    if(step===3&&form.message.trim().length<20)e.message="At least 20 characters";
    setErrors(e); return Object.keys(e).length===0;
  };

  const next=()=>{
    if(!validate()){setShaking(true);setTimeout(()=>setShaking(false),500);return;}
    if(step<3)setStep(s=>s+1); else setSent(true);
  };

  const pct=(step/3)*100;
  const firstName=form.name.split(" ")[0]||"friend";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--cream:#F8F4EE;--cream2:#EFE9DF;--ink:#16130D;--gold:#C59F5A;--gold2:#9E7A2E;--rust:#8B3A2A;--muted:rgba(22,19,13,.38);--border:rgba(22,19,13,.10);--white:#FDFAF5;}
        html,body{height:100%}
        body{background:var(--cream);font-family:'DM Sans',sans-serif;overflow-x:hidden;color:var(--ink);}
        @media(pointer:fine){body{cursor:none}}
        @media(pointer:coarse){body{cursor:auto}.ct-cur{display:none!important}}

        /* ── Layout classes ── */
        .ct-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 28px;height:50px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:rgba(248,244,238,.92);backdrop-filter:blur(16px);}
        .ct-top-l{display:flex;align-items:center;gap:16px;}
        .ct-top-r{display:flex;align-items:center;gap:16px;}
        .ct-sep{width:1px;height:14px;background:var(--border);}
        .ct-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:40px;height:40px;background:none;border:1px solid var(--border);border-radius:6px;cursor:pointer;padding:0;flex-shrink:0;}
        .ct-mob-menu{display:none;position:fixed;top:50px;left:0;right:0;background:rgba(248,244,238,.97);border-bottom:2px solid var(--gold);z-index:99;backdrop-filter:blur(16px);}

        /* Two column */
        .ct-body{display:grid;grid-template-columns:1fr 1fr;min-height:calc(100vh - 50px);}
        .ct-left{background:var(--ink);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:56px 44px 44px;}
        .ct-right{background:var(--white);display:flex;flex-direction:column;position:relative;overflow:hidden;}

        /* Form inner */
        .ct-form-pad{flex:1;display:flex;flex-direction:column;padding:44px 44px 32px;}
        .ct-pt-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .ct-budget-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .ct-nav-row{display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);}
        .ct-recap{margin-top:12px;padding:12px 16px;background:var(--cream2);border-radius:12px;border:1px solid var(--border);display:flex;flex-wrap:wrap;gap:14px;}

        /* Success */
        .ct-success{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 44px;text-align:center;}
        .ct-success-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}

        /* Footer */
        .ct-footer{border-top:1px solid var(--border);padding:0 28px;min-height:44px;display:flex;align-items:center;justify-content:space-between;background:rgba(248,244,238,.9);backdrop-filter:blur(8px);flex-wrap:wrap;gap:8px;}
        .ct-footer-links{display:flex;gap:16px;flex-wrap:wrap;}

        /* ── Tablet ≤ 900px ── */
        @media(max-width:900px){
          .ct-body{grid-template-columns:1fr;}
          .ct-left{padding:44px 32px 40px;min-height:auto;justify-content:flex-start;gap:40px;}
          .ct-right{min-height:auto;}
          .ct-form-pad{padding:36px 32px 28px;}
          .ct-top-r .ct-nav-links{display:none;}
          .ct-mob-menu{display:block;}
        }

        /* ── Mobile ≤ 600px ── */
        @media(max-width:600px){
          .ct-topbar{padding:0 16px;}
          .ct-top-r{display:none;}
          .ct-burger{display:flex!important;}
          .ct-left{padding:32px 18px 36px;}
          .ct-form-pad{padding:28px 18px 24px;}
          .ct-pt-grid{grid-template-columns:1fr 1fr;}
          .ct-budget-grid{grid-template-columns:1fr 1fr;}
          .ct-footer{padding:12px 18px;flex-direction:column;align-items:flex-start;height:auto;}
          .ct-nav-row{flex-wrap:wrap;gap:12px;}
          .ct-nav-row button:last-child{flex:1;justify-content:center;}
          .ct-success{padding:36px 18px;}
        }

        /* ── Very small ≤ 380px ── */
        @media(max-width:380px){
          .ct-pt-grid{grid-template-columns:1fr;}
          .ct-budget-grid{grid-template-columns:1fr 1fr;}
        }

        @keyframes fadeUp    {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn    {from{opacity:0}to{opacity:1}}
        @keyframes stepIn    {from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shake     {0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 rgba(62,207,90,.35)}50%{box-shadow:0 0 0 5px rgba(62,207,90,0)}}
        @keyframes shimmer   {from{background-position:200% center}to{background-position:-200% center}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes inkLine   {from{stroke-dashoffset:400}to{stroke-dashoffset:0}}
        @keyframes popIn     {0%{transform:scale(.7);opacity:0}65%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
        @keyframes checkDraw {from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
        @keyframes drift     {0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(3deg)}}

        input,textarea{font-family:inherit;}
        input::placeholder,textarea::placeholder{color:rgba(22,19,13,.22);font-style:italic;}
        input:focus,textarea:focus{outline:none;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px;}
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="ct-cur" style={{position:"fixed",width:8,height:8,background:"var(--gold)",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",transition:"width .2s,height .2s",mixBlendMode:"multiply"}}/>
      <div ref={ringRef}   className="ct-cur" style={{position:"fixed",width:30,height:30,border:"1px solid rgba(197,159,90,.45)",borderRadius:"50%",pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",transition:"width .3s,height .3s,opacity .3s"}}/>

      {/* Grain */}
      <div style={{position:"fixed",inset:0,opacity:.35,pointerEvents:"none",zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`}}/>

      {/* ── Topbar ── */}
      <div className="ct-topbar">
        <div className="ct-top-l">
          <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
            style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",cursor:"none",transition:"color .2s",display:"flex",alignItems:"center",gap:8}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >← Back</Link>
          <div className="ct-sep"/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:500,letterSpacing:"0.06em",color:"var(--ink)"}}>KAI STUDIO</span>
        </div>
        <div className="ct-top-r">
          <div className="ct-nav-links" style={{display:"flex",gap:16}}>
            {[["◩ Stack","/stack"],["◫ Design","/design"]].map(([l,h])=>(
              <Link key={h} href={h} onMouseEnter={ce} onMouseLeave={cl}
                style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",textDecoration:"none",cursor:"none",transition:"color .2s"}}
                onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
                onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
              >{l} ↗</Link>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#3ECF5A",animation:"pulseGreen 2.2s infinite"}}/>
            <span>Available</span>
          </div>
        </div>
        {/* Hamburger */}
        <button className="ct-burger" onClick={()=>setMenuOpen(o=>!o)} aria-label="Toggle menu">
          <span style={{display:"block",width:18,height:1.5,background:"var(--gold)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(45deg) translate(2px,2px)":"none"}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--gold)",borderRadius:1,transition:"all .25s",opacity:menuOpen?0:1}}/>
          <span style={{display:"block",width:18,height:1.5,background:"var(--gold)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(-45deg) translate(2px,-2px)":"none"}}/>
        </button>
      </div>

      {/* Mobile menu */}
      <div className="ct-mob-menu" style={{transform:menuOpen?"translateY(0)":"translateY(-110%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",boxShadow:"0 8px 32px rgba(22,19,13,.12)"}}>
        {[{href:"/",label:"← Back to Home"},{href:"/stack",label:"◩ Stack ↗"},{href:"/design",label:"◫ Design ↗"}].map((item,i)=>(
          <Link key={i} href={item.href} onClick={()=>setMenuOpen(false)}
            style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid var(--border)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",textDecoration:"none",color:"var(--muted)",transition:"color .2s"}}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
          >{item.label}</Link>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"12px 20px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#3ECF5A",animation:"pulseGreen 2s infinite"}}/>
          Open to work · 接受项目
        </div>
      </div>
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,top:50,background:"rgba(22,19,13,.3)",zIndex:98,backdropFilter:"blur(2px)"}}/>}

      {/* ── Body ── */}
      <div className="ct-body">

        {/* LEFT — dark editorial panel */}
        <div className="ct-left">
          {/* Decorative rings */}
          <div style={{position:"absolute",width:300,height:300,border:"1px solid rgba(197,159,90,.08)",borderRadius:"50%",top:-80,right:-100,animation:"rotateSlow 50s linear infinite",pointerEvents:"none"}}/>
          <div style={{position:"absolute",width:160,height:160,border:"1px solid rgba(197,159,90,.05)",borderRadius:"50%",bottom:40,left:-50,pointerEvents:"none"}}/>
          <div style={{position:"absolute",fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(90px,14vw,190px)",fontWeight:300,color:"rgba(255,255,255,.03)",lineHeight:1,top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-14deg)",pointerEvents:"none",userSelect:"none",whiteSpace:"nowrap",letterSpacing:"-0.04em"}}>HELLO</div>
          <svg style={{position:"absolute",bottom:0,right:0,width:120,height:120,opacity:.14,pointerEvents:"none"}} viewBox="0 0 140 140">
            <path d="M140,0 Q70,70 0,140" stroke="#C59F5A" strokeWidth="1" fill="none" strokeDasharray="400" style={{animation:"inkLine 2.5s ease forwards",animationDelay:".6s"}}/>
            <path d="M140,36 Q90,86 22,140" stroke="#C59F5A" strokeWidth=".5" fill="none" strokeDasharray="400" style={{animation:"inkLine 2.5s ease forwards",animationDelay:"1s"}}/>
          </svg>
          <div style={{position:"absolute",width:5,height:5,borderRadius:"50%",background:"var(--gold)",opacity:.3,top:"30%",right:48,animation:"drift 6s ease-in-out infinite",pointerEvents:"none"}}/>
          <div style={{position:"absolute",width:3,height:3,borderRadius:"50%",background:"var(--gold)",opacity:.18,bottom:"36%",left:52,animation:"drift 8s ease-in-out infinite",animationDelay:"2s",pointerEvents:"none"}}/>

          {/* Headline */}
          <div style={{position:"relative",zIndex:2,animation:visible?"fadeUp .8s ease forwards":"none",opacity:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"rgba(197,159,90,.65)",textTransform:"uppercase",marginBottom:22,display:"flex",alignItems:"center",gap:14}}>
              <span style={{width:18,height:1,background:"rgba(197,159,90,.45)",display:"inline-block"}}/>联系我 · Get In Touch
            </div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,5.5vw,72px)",lineHeight:.88,fontWeight:300,color:"rgba(253,250,245,1)",letterSpacing:"-0.025em",marginBottom:6}}>
              Let's build<br/>
              <span style={{fontStyle:"italic",fontWeight:500,background:"linear-gradient(90deg,#C59F5A 0%,#E8C87A 50%,#C59F5A 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 5s linear infinite"}}>something</span><br/>
              <span style={{color:"rgba(255,255,255,.28)",fontWeight:300}}>remarkable.</span>
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"clamp(13px,1.5vw,17px)",color:"rgba(255,255,255,.28)",lineHeight:1.8,maxWidth:"min(330px,100%)",marginTop:16}}>
              Whether you have a fully-formed brief or just a spark of an idea — I'd love to hear from you.
            </p>
          </div>

          {/* Availability card */}
          <div style={{position:"relative",zIndex:2,animation:visible?"fadeUp .8s .14s ease forwards":"none",opacity:0}}>
            <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(197,159,90,.17)",borderRadius:14,padding:"18px 22px",backdropFilter:"blur(8px)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#3ECF5A",animation:"pulseGreen 2s infinite"}}/>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"rgba(62,207,90,.85)",textTransform:"uppercase"}}>Available for projects</span>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,.18)",letterSpacing:"0.06em"}}>{clockStr}</span>
              </div>
              {[{icon:"⏱",label:"Response",val:"< 24 hours"},{icon:"🌏",label:"Location",val:"Remote · Asia"},{icon:"📅",label:"Next slot",val:"2 weeks out"}].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:11}}>{r.icon}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,.28)"}}>{r.label}</span>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,.58)",letterSpacing:"0.06em"}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct channels */}
          <div style={{position:"relative",zIndex:2,animation:visible?"fadeUp .8s .26s ease forwards":"none",opacity:0}}>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:"rgba(255,255,255,.18)",textTransform:"uppercase",marginBottom:12}}>Or reach me directly</p>
            {[
              {icon:"✉",val:"kai@kaistudio.dev",href:"mailto:kai@kaistudio.dev"},
              {icon:"⌥",val:"github.com/kaistudio",href:"https://github.com"},
              {icon:"◈",val:"linkedin.com/in/kaistudio",href:"https://linkedin.com"},
            ].map((ch,i)=>(
              <a key={i} href={ch.href} target="_blank" rel="noreferrer" onMouseEnter={ce} onMouseLeave={cl}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,.06)",textDecoration:"none",cursor:"none",transition:"padding-left .2s"}}
                onMouseOver={e=>(e.currentTarget as HTMLElement).style.paddingLeft="10px"}
                onMouseOut={e=>(e.currentTarget as HTMLElement).style.paddingLeft="0"}
              >
                <div style={{width:26,height:26,border:"1px solid rgba(255,255,255,.1)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{ch.icon}</div>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,.48)",letterSpacing:"0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.val}</span>
                <span style={{marginLeft:"auto",color:"rgba(197,159,90,.35)",fontSize:13,flexShrink:0}}>↗</span>
              </a>
            ))}
            <div style={{position:"absolute",bottom:-4,right:0,width:38,height:38,border:"1.5px solid rgba(139,58,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(-4deg)",background:"rgba(253,250,245,.06)"}}>
              <span style={{fontFamily:"'Noto Serif SC',serif",fontSize:9,color:"rgba(139,58,42,.65)",letterSpacing:"0.05em",lineHeight:1.2,textAlign:"center"}}>凯<br/>工</span>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ct-right">
          {/* Progress bar */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"var(--cream2)",zIndex:10}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,var(--gold),var(--gold2))",width:`${sent?100:pct}%`,transition:"width .65s cubic-bezier(.4,0,.2,1)",boxShadow:"0 0 8px rgba(197,159,90,.45)"}}/>
          </div>

          {!sent ? (
            <div className="ct-form-pad">
              {/* Step header */}
              <div style={{marginBottom:28,animation:visible?"fadeUp .7s ease forwards":"none",opacity:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {STEP_LABELS.map((_,i)=>(
                      <div key={i} style={{height:2,borderRadius:1,width:i===step?22:7,background:i<=step?"var(--gold)":"var(--border)",transition:"all .4s cubic-bezier(.4,0,.2,1)"}}/>
                    ))}
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",color:"var(--muted)",textTransform:"uppercase"}}>{step+1} / 4 — {STEP_LABELS[step]}</span>
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,3.8vw,44px)",fontWeight:400,lineHeight:.9,color:"var(--ink)",letterSpacing:"-0.02em"}}>
                  {step===0&&<><em>Tell me</em> about<br/>yourself.</>}
                  {step===1&&<>What are we<br/><em style={{color:"var(--gold)"}}>building?</em></>}
                  {step===2&&<>Scope &amp;<br/><em>timeline.</em></>}
                  {step===3&&<>Your<br/><em style={{color:"var(--gold)"}}>message.</em></>}
                </div>
              </div>

              {/* Step content */}
              <div style={{flex:1,display:"flex",flexDirection:"column",animation:"stepIn .35s ease forwards",opacity:0}} key={step}>

                {/* Step 0 — You */}
                {step===0&&(
                  <div>
                    <FieldWrap label="Full Name *" error={errors.name}>
                      <input value={form.name} onChange={e=>setField("name",e.target.value)} placeholder="e.g. Alex Johnson"
                        style={{fontSize:15,color:"var(--ink)",background:"transparent",border:"none",width:"100%",letterSpacing:"0.01em"}}/>
                    </FieldWrap>
                    <FieldWrap label="Email Address *" error={errors.email}>
                      <input value={form.email} onChange={e=>setField("email",e.target.value)} type="email" placeholder="you@company.com"
                        style={{fontSize:15,color:"var(--ink)",background:"transparent",border:"none",width:"100%",letterSpacing:"0.01em"}}/>
                    </FieldWrap>
                    <FieldWrap label="Company / Studio" hint="Optional">
                      <input value={form.company} onChange={e=>setField("company",e.target.value)} placeholder="Your company"
                        style={{fontSize:15,color:"var(--ink)",background:"transparent",border:"none",width:"100%",letterSpacing:"0.01em"}}/>
                    </FieldWrap>
                  </div>
                )}

                {/* Step 1 — Project type */}
                {step===1&&(
                  <div>
                    {errors.projectType&&<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--rust)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>⚠ {errors.projectType}</p>}
                    <div className="ct-pt-grid">
                      {PROJECT_TYPES.map(pt=>(
                        <div key={pt.id} onMouseEnter={ce} onMouseLeave={cl} onClick={()=>setField("projectType",pt.id)}
                          style={{padding:"16px",border:`1px solid ${form.projectType===pt.id?"var(--gold)":"var(--border)"}`,borderRadius:12,cursor:"none",transition:"all .2s",background:form.projectType===pt.id?"rgba(197,159,90,.07)":"transparent",boxShadow:form.projectType===pt.id?"0 4px 20px rgba(197,159,90,.12)":"none"}}>
                          <div style={{fontSize:18,marginBottom:6}}>{pt.icon}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:form.projectType===pt.id?"var(--gold2)":"var(--ink)",marginBottom:2}}>{pt.label}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{pt.zh}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2 — Budget & timeline */}
                {step===2&&(
                  <div style={{display:"flex",flexDirection:"column",gap:24}}>
                    <div>
                      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",color:errors.budget?"var(--rust)":"var(--muted)",marginBottom:10}}>
                        {errors.budget?`⚠ ${errors.budget}`:"Budget Range · 预算"}
                      </p>
                      <div className="ct-budget-grid">
                        {BUDGETS.map(b=>(
                          <SelectChip key={b.id} label={b.label} sub={b.note} selected={form.budget===b.id}
                            onClick={()=>setField("budget",b.id)} onMouseEnter={ce} onMouseLeave={cl}/>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",color:errors.timeline?"var(--rust)":"var(--muted)",marginBottom:10}}>
                        {errors.timeline?`⚠ ${errors.timeline}`:"Timeline · 时间线"}
                      </p>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {TIMELINES.map(t=>(
                          <SelectChip key={t.id} label={t.label} sub={t.note} selected={form.timeline===t.id}
                            onClick={()=>setField("timeline",t.id)} onMouseEnter={ce} onMouseLeave={cl}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 — Message */}
                {step===3&&(
                  <div style={{display:"flex",flexDirection:"column",flex:1}}>
                    <FieldWrap label="Your Message *" error={errors.message} hint={`${charCount}/500`} grow>
                      <textarea value={form.message}
                        onChange={e=>{setField("message",e.target.value);setCharCount(e.target.value.length);}}
                        maxLength={500}
                        placeholder="Tell me about your project — what you're building, who it's for, and what success looks like…"
                        style={{fontSize:14,color:"var(--ink)",background:"transparent",border:"none",width:"100%",minHeight:120,lineHeight:1.75,resize:"none",letterSpacing:"0.01em",flex:1}}/>
                    </FieldWrap>
                    <div className="ct-recap">
                      {[
                        {k:"Name",     v:form.name||"—"},
                        {k:"Project",  v:PROJECT_TYPES.find(p=>p.id===form.projectType)?.label||"—"},
                        {k:"Budget",   v:BUDGETS.find(b=>b.id===form.budget)?.label||"—"},
                        {k:"Timeline", v:TIMELINES.find(t=>t.id===form.timeline)?.label||"—"},
                      ].map(r=>(
                        <div key={r.k}>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase",marginBottom:2}}>{r.k}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:"var(--ink)"}}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="ct-nav-row" style={{animation:shaking?"shake .5s ease":"none"}}>
                {step>0?(
                  <button onClick={()=>setStep(s=>s-1)} onMouseEnter={ce} onMouseLeave={cl}
                    style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",padding:"10px 18px",background:"transparent",color:"var(--muted)",border:"1px solid var(--border)",borderRadius:100,cursor:"none",transition:"all .2s"}}
                    onMouseOver={e=>{(e.currentTarget as HTMLElement).style.color="var(--ink)";(e.currentTarget as HTMLElement).style.borderColor="var(--ink)";}}
                    onMouseOut={e=>{(e.currentTarget as HTMLElement).style.color="var(--muted)";(e.currentTarget as HTMLElement).style.borderColor="var(--border)";}}
                  >← Back</button>
                ):<div/>}
                <button onClick={next} onMouseEnter={ce} onMouseLeave={cl}
                  style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"13px 32px",background:"var(--ink)",color:"var(--white)",border:"none",borderRadius:100,cursor:"none",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(22,19,13,.18)",transition:"background .2s,transform .15s"}}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="var(--gold)";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="var(--ink)";(e.currentTarget as HTMLElement).style.transform="none";}}
                >
                  {step<3?"Continue":"Send Message"}
                  <span style={{fontSize:16}}>{step<3?"→":"↗"}</span>
                </button>
              </div>
            </div>

          ) : (
            /* Success */
            <div className="ct-success" style={{animation:"fadeIn .6s ease forwards"}}>
              <div style={{width:76,height:76,borderRadius:"50%",border:"2px solid var(--gold)",background:"rgba(197,159,90,.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28,animation:"popIn .7s cubic-bezier(.4,0,.2,1) forwards"}}>
                <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
                  <path d="M7 17L14 24L27 11" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" style={{animation:"checkDraw .6s .5s ease forwards",strokeDashoffset:70}}/>
                </svg>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontSize:"clamp(38px,6.5vw,68px)",lineHeight:.88,color:"var(--ink)",letterSpacing:"-0.03em",marginBottom:6,animation:"fadeUp .7s .2s ease forwards",opacity:0}}>
                Message<br/><em style={{color:"var(--gold)"}}>received.</em>
              </div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"clamp(14px,1.7vw,18px)",color:"var(--muted)",lineHeight:1.78,maxWidth:"min(360px,100%)",marginTop:14,marginBottom:32,animation:"fadeUp .7s .32s ease forwards",opacity:0}}>
                谢谢你的留言 — Thank you, {firstName}. I'll reply within 24 hours.
              </p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:32,animation:"fadeUp .7s .42s ease forwards",opacity:0}}>
                {[{icon:"📧",v:form.email},{icon:"🏷",v:PROJECT_TYPES.find(p=>p.id===form.projectType)?.label||"Project"},{icon:"⏱",v:"Reply < 24h"}].map(r=>(
                  <div key={r.v} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",border:"1px solid var(--border)",borderRadius:100,background:"var(--cream)"}}>
                    <span>{r.icon}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--ink)",letterSpacing:"0.06em",overflow:"hidden",textOverflow:"ellipsis",maxWidth:160,whiteSpace:"nowrap"}}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="ct-success-btns" style={{animation:"fadeUp .7s .52s ease forwards",opacity:0}}>
                <Link href="/" onMouseEnter={ce} onMouseLeave={cl}
                  style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 26px",background:"var(--ink)",color:"var(--white)",borderRadius:100,cursor:"none",textDecoration:"none",transition:"background .2s"}}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.background="var(--gold)"}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.background="var(--ink)"}
                >← Home</Link>
                <Link href="/design" onMouseEnter={ce} onMouseLeave={cl}
                  style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 22px",background:"transparent",color:"var(--ink)",border:"1px solid var(--border)",borderRadius:100,cursor:"none",textDecoration:"none",transition:"border-color .2s"}}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--ink)"}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--border)"}
                >View My Work ↗</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="ct-footer">
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>© 2025 Kai Studio · 联系我</span>
        <div className="ct-footer-links">
          {["GitHub","LinkedIn","Twitter"].map(l=>(
            <a key={l} href="https://github.com" target="_blank" rel="noreferrer" onMouseEnter={ce} onMouseLeave={cl}
              style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",color:"var(--muted)",textTransform:"uppercase",cursor:"none",textDecoration:"none",transition:"color .2s"}}
              onMouseOver={e=>(e.currentTarget as HTMLElement).style.color="var(--ink)"}
              onMouseOut={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}
            >{l}</a>
          ))}
        </div>
      </div>
    </>
  );
}