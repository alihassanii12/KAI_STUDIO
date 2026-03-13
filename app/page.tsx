"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MetricItem { val: string; suffix: string; label: string; sublabel: string; }
interface WorkItem   { year: string; name: string; }
interface TimelineItem { years: string; role: string; company: string; location: string; desc: string; tags: string[]; active?: boolean; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const METRICS: MetricItem[] = [
  { val: "40", suffix: "+", label: "项目交付",  sublabel: "Projects Shipped"  },
  { val: "5",  suffix: "",  label: "年经验",    sublabel: "Yrs Experience"    },
  { val: "12", suffix: "k", label: "代码贡献",  sublabel: "Lines Contributed" },
  { val: "99", suffix: "%", label: "稳定运行",  sublabel: "Uptime Avg."       },
];
const WORKS: WorkItem[] = [
  { year: "2025 · 仪表盘",  name: "Nexus Dashboard"  },
  { year: "2024 · 接口平台", name: "FlowAPI Platform" },
  { year: "2024 · 电商",    name: "Atlas Commerce"    },
];
const TIMELINE: TimelineItem[] = [
  {
    years: "2023\n—\nNow", role: "Senior Full-Stack Engineer",
    company: "Nexus Labs", location: "远程 · Remote",
    desc: "Leading frontend architecture for a real-time analytics platform serving 200k+ MAU. Migrated legacy codebase to Next.js 14 with 40% performance uplift.",
    tags: ["Next.js","TypeScript","GraphQL","AWS"], active: true,
  },
  {
    years: "2021\n—\n2023", role: "Full-Stack Developer",
    company: "FlowAPI Inc.", location: "上海 · Shanghai",
    desc: "Built and maintained a developer-facing API management platform. Designed RESTful and GraphQL APIs consumed by 500+ enterprise clients.",
    tags: ["React","Node.js","PostgreSQL","Docker"],
  },
  {
    years: "2020\n—\n2021", role: "Frontend Engineer",
    company: "Atlas Commerce", location: "北京 · Beijing",
    desc: "Developed high-conversion e-commerce storefronts with React. Integrated third-party payment gateways and reduced checkout drop-off by 28%.",
    tags: ["React","Redux","Stripe","Figma"],
  },
];
const BUDGET_OPTS = ["Under $5k","$5k – $15k","$15k – $30k","$30k – $60k","$60k+","Let's discuss · 待定"];

// ─── Ambient Sound Engine (Web Audio API — no audio files needed) ─────────────
class AmbientEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  nodes: AudioNode[] = [];
  alive = false;

  async start() {
    if (this.alive) return;
    // Create context and RESUME immediately — required by browser autoplay policy
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === "suspended") await this.ctx.resume();

    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(0, this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
    this.master.connect(this.ctx.destination);

    // Build a shared reverb convolver so all sources share it
    const irLen = this.ctx.sampleRate * 2;
    const irBuf = this.ctx.createBuffer(2, irLen, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = irBuf.getChannelData(ch);
      for (let i = 0; i < irLen; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.5);
    }
    const convolver = this.ctx.createConvolver();
    convolver.buffer = irBuf;
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.28;
    convolver.connect(reverbGain);
    reverbGain.connect(this.master);
    this.nodes.push(convolver, reverbGain);

    // Pentatonic drone — 6 sine tones with slow LFO vibrato, routed dry + into reverb
    const baseFreqs = [55, 82.5, 110, 146.8, 165, 220];
    baseFreqs.forEach((freq, i) => {
      const osc  = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const lfo  = this.ctx!.createOscillator();
      const lfog = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.09 / (i + 1);
      lfo.type = "sine";
      lfo.frequency.value = 0.05 + i * 0.02;
      lfog.gain.value = freq * 0.004;
      lfo.connect(lfog);
      lfog.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(this.master!);   // dry path
      gain.connect(convolver);      // wet path into reverb
      lfo.start();
      osc.start();
      this.nodes.push(osc, lfo, gain, lfog);
    });

    // Pink-noise breath layer
    const sRate = this.ctx.sampleRate;
    const nBuf  = this.ctx.createBuffer(1, sRate * 4, sRate);
    const nd    = nBuf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
    for (let i = 0; i < nd.length; i++) {
      const w = Math.random() * 2 - 1;
      b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759;
      b2=.96900*b2+w*.1538520; b3=.86650*b3+w*.3104856;
      b4=.55000*b4+w*.5329522; b5=-.7616*b5-w*.0168980;
      nd[i] = (b0+b1+b2+b3+b4+b5+w*.5362) * 0.06;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = nBuf;
    noise.loop = true;
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = "lowpass"; lpf.frequency.value = 320; lpf.Q.value = 0.4;
    const ng = this.ctx.createGain();
    ng.gain.value = 0.02;
    noise.connect(lpf);
    lpf.connect(ng);
    ng.connect(this.master!);
    noise.start();
    this.nodes.push(noise, lpf, ng);

    this.alive = true;
  }

  stop() {
    if (!this.alive || !this.ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.4);
    const ctx = this.ctx;
    setTimeout(() => {
      this.nodes.forEach(n => { try { (n as any).stop?.(); } catch {} try { n.disconnect(); } catch {} });
      this.nodes = [];
      ctx.close();
      this.ctx = null; this.master = null;
      this.alive = false;
    }, 1600);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KaiStudioPage() {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const mousePos   = useRef({ x: 0, y: 0 });
  const ringPos    = useRef({ x: 0, y: 0 });
  const rafRef     = useRef<number | null>(null);
  const fillRef    = useRef<HTMLDivElement>(null);
  const aboutRef   = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const audioEng   = useRef<AmbientEngine | null>(null);

  const [loaderDone,         setLoaderDone]         = useState(false);
  const [loadPct,            setLoadPct]            = useState(0);
  const [loaderCharsVisible, setLoaderCharsVisible] = useState(false);
  const [heroVisible,        setHeroVisible]        = useState(false);
  const [aboutVisible,       setAboutVisible]       = useState(false);
  const [contactVisible,     setContactVisible]     = useState(false);
  const [soundOn,            setSoundOn]            = useState(false);
  const [ambientLabelVis,    setAmbientLabelVis]    = useState(false);
  const [selectedBudget,     setSelectedBudget]     = useState("$15k – $30k");
  const [formSent,           setFormSent]           = useState(false);
  const [toast,              setToast]              = useState<{msg:string;icon:string;color:string}|null>(null);
  const [fname,    setFname]    = useState("");
  const [femail,   setFemail]   = useState("");
  const [fcompany, setFcompany] = useState("");
  const [ftype,    setFtype]    = useState("");
  const [fmsg,     setFmsg]     = useState("");
  const [shakeForm,setShakeForm] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  const showToast = useCallback((msg: string, icon = "✓", color = "var(--lime)") => {
    setToast({ msg, icon, color }); setTimeout(() => setToast(null), 3000);
  }, []);

  // Cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX+"px"; cursorRef.current.style.top = e.clientY+"px"; }
    };
    window.addEventListener("mousemove", onMove);
    const loop = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.1;
      if (ringRef.current) { ringRef.current.style.left = ringPos.current.x+"px"; ringRef.current.style.top = ringPos.current.y+"px"; }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Loader
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => { p += 2; if (p >= 100) { p = 100; clearInterval(iv); } setLoadPct(p); }, 30);
    const t1 = setTimeout(() => setLoaderCharsVisible(true), 200);
    const t2 = setTimeout(() => { setLoaderDone(true); setTimeout(() => setHeroVisible(true), 100); }, 2800);
    return () => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scroll observer
  useEffect(() => {
    if (!loaderDone) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.target === aboutRef.current   && e.isIntersecting) setAboutVisible(true);
        if (e.target === contactRef.current && e.isIntersecting) setContactVisible(true);
      });
    }, { threshold: 0.1 });
    if (aboutRef.current)   obs.observe(aboutRef.current);
    if (contactRef.current) obs.observe(contactRef.current);
    return () => obs.disconnect();
  }, [loaderDone]);

  // Cleanup audio on unmount
  useEffect(() => () => { audioEng.current?.stop(); }, []);

  // Sound toggle — always recreate engine to avoid stale AudioContext
  const toggleSound = () => {
    if (soundOn) {
      audioEng.current?.stop();
      audioEng.current = null;
      setSoundOn(false);
    } else {
      audioEng.current = new AmbientEngine();
      audioEng.current.start();
      setSoundOn(true);
    }
    setAmbientLabelVis(true);
    setTimeout(() => setAmbientLabelVis(false), 2400);
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleSend = () => {
    if (!fname || !femail || !fmsg) {
      setShakeForm(true); setTimeout(() => setShakeForm(false), 600);
      showToast("Please fill all required fields", "!", "var(--red)"); return;
    }
    setFormSent(true); showToast("Message sent successfully!", "✓");
  };

  const handleDownloadCV = () => {
    const blob = new Blob(["KAI ZHANG - Full Stack Developer\nExperience: 5+ years\nSkills: React, Node.js, TypeScript\nEmail: kai@kaistudio.dev"], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "Kai_Zhang_CV.txt"; a.click();
    URL.revokeObjectURL(url); showToast("CV downloaded!", "↓");
  };

  const ce = () => {
    if (cursorRef.current) { cursorRef.current.style.width="16px"; cursorRef.current.style.height="16px"; }
    if (ringRef.current)   { ringRef.current.style.width="50px";   ringRef.current.style.height="50px";   ringRef.current.style.opacity="0.3"; }
  };
  const cl = () => {
    if (cursorRef.current) { cursorRef.current.style.width="8px";  cursorRef.current.style.height="8px";  }
    if (ringRef.current)   { ringRef.current.style.width="32px";   ringRef.current.style.height="32px";   ringRef.current.style.opacity="1";   }
  };

  const lc1 = ["K","A","I"];
  const lc2 = ["S","T","U","D","I","O"];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ Global CSS ══════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@300;400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg:#F5F4F0;--bg2:#EEECEA;--ink:#111110;--ink2:#2A2A28;
          --lime:#B8F03A;--red:#E8432D;
          --muted:rgba(17,17,16,.36);--border:rgba(17,17,16,.10);
          --grid:rgba(17,17,16,.05);--white:#FAFAF7;
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);font-family:'DM Sans',sans-serif;overflow-x:hidden}
        @media(pointer:fine){body{cursor:none}}
        @media(pointer:coarse){.kai-cur{display:none!important}}

        /* ── Layout classes ── */
        .kai-topbar{display:flex;justify-content:space-between;align-items:center;padding:0 28px;height:50px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:var(--bg);}
        .kai-nav{display:flex;align-items:center;gap:10px;}
        .kai-hero{width:100%;min-height:calc(100dvh - 50px);display:grid;grid-template-columns:1.1fr 0.9fr;overflow:hidden;}
        .kai-hero-left{display:flex;flex-direction:column;justify-content:center;padding:40px 48px 80px 40px;border-right:1px solid var(--border);position:relative;}
        .kai-hero-right{position:relative;display:flex;flex-direction:column;overflow:hidden;}
        .kai-hero-tabs{position:absolute;bottom:0;left:0;right:0;display:flex;border-top:1px solid var(--border);}
        .kai-about{width:100%;min-height:100vh;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--border);position:relative;}
        .kai-about-l{padding:72px 48px 72px 40px;border-right:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;position:relative;}
        .kai-about-r{background:var(--bg2);padding:72px 40px 72px 48px;display:flex;flex-direction:column;position:relative;overflow:hidden;}
        .kai-contact{width:100%;min-height:100vh;display:grid;grid-template-columns:0.85fr 1.15fr;border-top:1px solid var(--border);position:relative;}
        .kai-contact-l{background:var(--ink);padding:72px 48px 72px 40px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;}
        .kai-contact-r{background:var(--bg);padding:72px 48px 72px 56px;display:flex;flex-direction:column;position:relative;}
        .kai-divider{width:100%;padding:0 28px;height:36px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg);position:relative;z-index:5;}
        .kai-footer{border-top:1px solid var(--border);padding:0 28px;min-height:44px;display:flex;align-items:center;justify-content:space-between;background:var(--bg);position:relative;z-index:5;flex-wrap:wrap;gap:8px;}
        .kai-footer-links{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
        .kai-sound{position:fixed;bottom:28px;right:28px;display:flex;align-items:center;gap:8px;z-index:8000;max-width:calc(100vw - 32px);}
        .kai-form2{display:grid;grid-template-columns:1fr 1fr;}
        .kai-status,.kai-pg,.kai-lbl{display:flex;}

        /* ── Tablet ≤ 900px ── */
        /* Hamburger always hidden on desktop */
        .kai-burger{display:none!important;}
        .kai-mobile-menu{display:none;}

        @media(max-width:900px){
          .kai-mobile-menu{display:block;}

          .kai-hero{grid-template-columns:1fr;min-height:auto;}
          .kai-hero-left{padding:36px 28px 90px;border-right:none;}
          .kai-hero-right{min-height:65vw;border-top:1px solid var(--border);}
          .kai-hero-tabs{position:static;border-top:1px solid var(--border);}
          .kai-about{grid-template-columns:1fr;}
          .kai-about-l{padding:52px 28px;border-right:none;border-bottom:1px solid var(--border);}
          .kai-about-r{padding:52px 28px;}
          .kai-contact{grid-template-columns:1fr;}
          .kai-contact-l{padding:52px 28px;}
          .kai-contact-r{padding:52px 28px;}
          .kai-form2{grid-template-columns:1fr;}
          .kai-status{display:none!important;}
          .kai-pg{display:none!important;}
        }

        /* ── Mobile ≤ 600px ── */
        @media(max-width:600px){
          .kai-desk-nav{display:none!important;}
          .kai-burger{display:flex!important;}

          .kai-topbar{padding:0 16px;}
          .kai-lbl{display:none!important;}
          .kai-nav{gap:5px;}
          .kai-hero-left{padding:28px 18px 80px;}
          .kai-hero-right{min-height:90vw;}
          .kai-about-l,.kai-about-r{padding:36px 18px;}
          .kai-contact-l,.kai-contact-r{padding:36px 18px;}
          .kai-footer{padding:14px 18px;flex-direction:column;align-items:flex-start;height:auto;}
          .kai-footer-links{gap:10px;}
          .kai-sound{bottom:16px;right:14px;}
          .kai-divider{padding:0 16px;}
        }
        /* ── Hero right inner panels ── */
        .kai-rpad-top{padding:48px 48px 0 44px;}
        .kai-rpad-mid{margin:32px 44px 0 44px;}
        .kai-rpad-inner{flex:1;padding:18px 44px 0 44px;}
        .kai-rpad-bot{padding:22px 44px 32px;}

        /* ── About / Contact inner ── */
        .kai-bio{max-width:520px;}
        .kai-tl-grid{display:grid;grid-template-columns:80px 1fr;position:relative;}
        .kai-cta-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
        .kai-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
        .kai-budget-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
        .kai-send-row{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:12px;}
        .kai-form-note{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;display:flex;align-items:center;gap:8px;}

        @media(max-width:900px){
          .kai-rpad-top{padding:32px 28px 0;}
          .kai-rpad-mid{margin:24px 28px 0;}
          .kai-rpad-inner{padding:14px 28px 0;}
          .kai-rpad-bot{padding:18px 28px 24px;}
          .kai-bio{max-width:100%;}
          .kai-cta-row{gap:10px;}
        }
        @media(max-width:600px){
          .kai-rpad-top{padding:24px 18px 0;}
          .kai-rpad-mid{margin:18px 18px 0;}
          .kai-rpad-inner{padding:12px 18px 0;}
          .kai-rpad-bot{padding:14px 18px 20px;}
          .kai-tl-grid{grid-template-columns:60px 1fr;}
          .kai-cta-row{gap:8px;}
          .kai-cta-row button:first-child{width:100%;}
          .kai-send-row{flex-direction:column;align-items:stretch;}
          .kai-send-row button{width:100%;justify-content:center;}
        }

                @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(62,207,90,.35)}50%{opacity:.7;box-shadow:0 0 0 5px rgba(62,207,90,0)}}
        @keyframes arrowbounce{0%,100%{transform:translate(0,0)rotate(-30deg)}50%{transform:translate(2px,-3px)rotate(-20deg)}}
        @keyframes ambientPulse{0%,100%{box-shadow:0 0 0 0 rgba(184,240,58,.4)}50%{box-shadow:0 0 0 10px rgba(184,240,58,0)}}
        @keyframes charUp{from{transform:translateY(110%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatA{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,18px)}}
        @keyframes floatB{0%,100%{transform:translate(0,0)}50%{transform:translate(6px,-14px)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes bar{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1.3)}}
        @keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes shimmer{from{background-position:200% center}to{background-position:-200% center}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes sweepIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="kai-cur" style={{position:"fixed",width:8,height:8,background:"var(--ink)",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",transition:"width .25s,height .25s",mixBlendMode:"multiply"}}/>
      <div ref={ringRef}   className="kai-cur" style={{position:"fixed",width:32,height:32,border:"1px solid rgba(17,17,16,.35)",borderRadius:"50%",pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",transition:"width .3s,height .3s,opacity .3s"}}/>

      {/* Noise */}
      <div style={{position:"fixed",inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,pointerEvents:"none",zIndex:1,opacity:.6}}/>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none",zIndex:0}}/>

      {/* Toast */}
      <div style={{position:"fixed",bottom:32,left:"50%",transform:`translateX(-50%) translateY(${toast?0:20}px)`,background:"var(--ink)",color:"var(--white)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.1em",padding:"12px 22px",borderRadius:2,zIndex:9000,display:"flex",alignItems:"center",gap:10,opacity:toast?1:0,transition:"opacity .3s,transform .3s",pointerEvents:"none",whiteSpace:"nowrap",borderLeft:"3px solid var(--lime)"}}>
        <span style={{fontSize:13,color:toast?.color||"var(--lime)"}}>{toast?.icon}</span>
        <span>{toast?.msg}</span>
      </div>

      {/* ══ Sound Toggle ════════════════════════════════════════════════════════ */}
      <div className="kai-sound">
        {/* Ambient label pill */}
        <div style={{
          opacity: ambientLabelVis ? 1 : 0, transition:"opacity .4s",
          background:"rgba(17,17,16,0.88)", backdropFilter:"blur(12px)",
          border:"1px solid rgba(255,255,255,0.1)", padding:"6px 14px",
          borderRadius:100, display:"flex", alignItems:"center", gap:10,
          pointerEvents:"none",
        }}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.16em",color:"rgba(255,255,255,0.6)",textTransform:"uppercase",whiteSpace:"nowrap"}}>
            {soundOn ? "琴 · Ambient On" : "静 · Muted"}
          </span>
          {soundOn && [0,1,2,3,4].map(i=>(
            <span key={i} style={{display:"inline-block",width:2,height:12,background:"var(--lime)",borderRadius:2,
              animationName:"bar",animationDuration:".65s",animationTimingFunction:"ease-in-out",
              animationIterationCount:"infinite",animationDelay:`${i*.1}s`,transformOrigin:"bottom"}}/>
          ))}
        </div>
        {/* Button */}
        <button
          onClick={toggleSound}
          onMouseEnter={ce} onMouseLeave={cl}
          title={soundOn ? "Mute ambient sound" : "Play ambient sound"}
          style={{
            width:48, height:48,
            background: soundOn ? "var(--lime)" : "var(--ink)",
            color:       soundOn ? "var(--ink)"  : "var(--white)",
            border:"none", borderRadius:"50%", cursor:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background .35s, transform .2s",
            animation: soundOn ? "ambientPulse 3s ease-in-out infinite" : "none",
            fontSize:14, fontFamily:"'JetBrains Mono',monospace",
          }}
        >
          {soundOn ? (
            <span style={{display:"flex",alignItems:"center",gap:2}}>
              {[0,1,2,3].map(i=>(
                <span key={i} style={{display:"inline-block",width:3,height:16,background:"var(--ink)",borderRadius:2,
                  animationName:"bar",animationDuration:".6s",animationTimingFunction:"ease-in-out",
                  animationIterationCount:"infinite",animationDelay:`${i*.12}s`,transformOrigin:"bottom"}}/>
              ))}
            </span>
          ) : <span>♪</span>}
        </button>
      </div>

      {/* ══ Loader ══════════════════════════════════════════════════════════════ */}
      {!loaderDone && (
        <div style={{position:"fixed",inset:0,background:"var(--ink)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
          <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.3em",color:"rgba(255,255,255,.25)",textTransform:"uppercase",animation:loaderCharsVisible?"fadeUp .6s ease forwards":"none",opacity:0}}>
              全栈开发者 · Full-Stack Developer · 作品集
            </div>
            <div style={{display:"flex",overflow:"hidden"}}>
              {lc1.map((c,i)=>(
                <span key={i} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(64px,11vw,130px)",lineHeight:.88,display:"inline-block",color:c==="I"?"var(--lime)":"var(--white)",animation:loaderCharsVisible?`charUp .8s ${i*.05}s ease forwards`:"none",opacity:0,transform:"translateY(110%)"}}>{c}</span>
              ))}
            </div>
            <div style={{display:"flex",overflow:"hidden"}}>
              {lc2.map((c,i)=>(
                <span key={i} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(64px,11vw,130px)",lineHeight:.88,display:"inline-block",color:c==="I"?"var(--lime)":"var(--white)",animation:loaderCharsVisible?`charUp .8s ${(lc1.length+i)*.05+.1}s ease forwards`:"none",opacity:0,transform:"translateY(110%)"}}>{c}</span>
              ))}
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.2em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginTop:12,animation:loaderCharsVisible?"fadeUp .6s .5s ease forwards":"none",opacity:0}}>
              构建 · React · Node · TypeScript · 云端
            </div>
          </div>
          <div style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:180,height:1,background:"rgba(255,255,255,.08)",position:"relative"}}>
              <div ref={fillRef} style={{position:"absolute",left:0,top:0,height:"100%",background:"var(--lime)",width:`${loadPct}%`,transition:"width .03s"}}/>
            </div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,.25)",letterSpacing:"0.1em",minWidth:32}}>{loadPct}%</span>
          </div>
        </div>
      )}

      {/* ══ Page ════════════════════════════════════════════════════════════════ */}
      <div style={{opacity:loaderDone?1:0,transition:"opacity .5s",position:"relative",zIndex:2}}>
        <div style={{position:"fixed",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--lime) 0%,transparent 60%)",zIndex:1001}}/>

        {/* ── Topbar ──────────────────────────────────────────────────────────── */}
        <div className="kai-topbar">
          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:"0.12em",color:"var(--ink)"}}>KAI STUDIO</span>
            <div className="kai-lbl" style={{width:1,height:14,background:"var(--border)"}}/>
            <span className="kai-lbl" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.16em",color:"var(--muted)",textTransform:"uppercase"}}>Full-Stack Dev</span>
          </div>

          {/* Desktop nav — hidden on mobile via CSS */}
          <div className="kai-nav kai-desk-nav">
            <Link href="/contact" onMouseEnter={ce} onMouseLeave={cl}
              style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",padding:"8px 16px",borderRadius:100,cursor:"none",textDecoration:"none",background:"var(--ink)",color:"var(--lime)",border:"1px solid var(--ink)",transition:"all .25s"}}
              onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--lime)";el.style.borderColor="var(--lime)";el.style.color="var(--ink)"}}
              onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--ink)";el.style.borderColor="var(--ink)";el.style.color="var(--lime)"}}
            ><span style={{fontSize:11}}>✉</span>Get In Touch</Link>

            <Link href="/stack" onMouseEnter={ce} onMouseLeave={cl}
              style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",padding:"8px 16px",borderRadius:100,cursor:"none",textDecoration:"none",border:"1px solid var(--border)",color:"var(--ink)",background:"transparent",transition:"all .25s"}}
              onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--ink)";el.style.borderColor="var(--ink)";el.style.color="var(--lime)"}}
              onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.background="transparent";el.style.borderColor="var(--border)";el.style.color="var(--ink)"}}
            ><span style={{fontSize:11}}>◩</span>Stack<span style={{fontSize:11}}>↗</span></Link>

            <Link href="/design" onMouseEnter={ce} onMouseLeave={cl}
              style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",padding:"8px 16px",borderRadius:100,cursor:"none",textDecoration:"none",border:"1px solid var(--border)",color:"var(--ink)",background:"transparent",transition:"all .25s"}}
              onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--lime)";el.style.borderColor="var(--lime)";el.style.color="var(--ink)"}}
              onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.background="transparent";el.style.borderColor="var(--border)";el.style.color="var(--ink)"}}
            ><span style={{fontSize:11}}>◫</span>Design<span style={{fontSize:11}}>↗</span></Link>

            <span className="kai-pg" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--muted)",letterSpacing:"0.1em"}}>[ 01 / 05 ]</span>
            <div className="kai-status" style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#3ECF5A",animation:"pulse 2.2s infinite"}}/>
              <span>Open to work</span>
            </div>
          </div>

          {/* Hamburger — only visible on mobile */}
          <button
            className="kai-burger"
            onClick={()=>setMenuOpen(o=>!o)}
            aria-label="Toggle menu"
            style={{display:"none",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:5,width:40,height:40,background:"none",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",padding:0,flexShrink:0}}
          >
            <span className="kai-bline" style={{display:"block",width:18,height:1.5,background:"var(--ink)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(45deg) translate(2px,2px)":"none"}}/>
            <span className="kai-bline" style={{display:"block",width:18,height:1.5,background:"var(--ink)",borderRadius:1,transition:"all .25s",opacity:menuOpen?0:1}}/>
            <span className="kai-bline" style={{display:"block",width:18,height:1.5,background:"var(--ink)",borderRadius:1,transition:"all .25s",transform:menuOpen?"rotate(-45deg) translate(2px,-2px)":"none"}}/>
          </button>
        </div>

        {/* ── Mobile menu drawer ── */}
        <div className="kai-mobile-menu" style={{
          position:"fixed",top:50,left:0,right:0,
          background:"var(--bg)",
          borderBottom:"2px solid var(--lime)",
          zIndex:99,
          transform: menuOpen ? "translateY(0)" : "translateY(-110%)",
          transition:"transform .32s cubic-bezier(.4,0,.2,1)",
          boxShadow:"0 8px 32px rgba(17,17,16,.12)",
        }}>
          {/* Nav links */}
          {[
            {href:"/contact", icon:"✉", label:"Get In Touch",   pill:true },
            {href:"/stack",   icon:"◩", label:"Stack",          pill:false},
            {href:"/design",  icon:"◫", label:"Design Pages",   pill:false},
          ].map((item,i)=>(
            <Link key={i} href={item.href}
              onClick={()=>setMenuOpen(false)}
              style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"16px 20px",
                borderBottom:"1px solid var(--border)",
                fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                letterSpacing:"0.14em",textTransform:"uppercase",
                textDecoration:"none",
                color: item.pill ? "var(--lime)" : "var(--ink)",
                background: item.pill ? "var(--ink)" : "transparent",
                transition:"background .2s",
              }}
            >
              <span style={{fontSize:14,width:22,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              <span style={{opacity:.3,fontSize:13}}>↗</span>
            </Link>
          ))}
          {/* Status row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#3ECF5A",animation:"pulse 2s infinite"}}/>
              Open to work · 接受项目
            </div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--muted)",letterSpacing:"0.1em"}}>[ 01 / 05 ]</span>
          </div>
        </div>

        {/* Backdrop */}
        {menuOpen && (
          <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,top:50,background:"rgba(17,17,16,.35)",zIndex:98,backdropFilter:"blur(2px)"}}/>
        )}

        {/* ── Hero ──────────────────────────────────────────────────────────────── */}
        <section className="kai-hero">

          {/* Left */}
          <div className="kai-hero-left">
            <div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:2,background:"linear-gradient(to bottom,transparent,var(--lime),transparent)"}}/>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"var(--muted)",textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:14,animation:heroVisible?"fadeUp .8s ease forwards":"none",opacity:0}}>
              <span style={{width:24,height:1,background:"var(--muted)",display:"inline-block"}}/>索引 01 · Index 01 · 开发者
            </div>
            <div style={{marginBottom:4,animation:heroVisible?"fadeUp .8s .06s ease forwards":"none",opacity:0}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(52px,8.5vw,108px)",lineHeight:.86,color:"var(--ink)",display:"block",letterSpacing:"0.01em"}}>KA<span style={{color:"var(--lime)"}}>I</span></span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(52px,8.5vw,108px)",lineHeight:.86,color:"var(--ink)",display:"block",letterSpacing:"0.01em",position:"relative"}}>
                STUD<span style={{color:"var(--lime)"}}>I</span>O
                <svg style={{position:"absolute",bottom:-3,left:0,width:"100%",height:5,pointerEvents:"none"}} viewBox="0 0 300 8" fill="none">
                  <path d="M2 6 C60 2, 130 7, 200 4 C240 2, 280 6, 298 5" stroke="#B8F03A" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
            <div style={{fontFamily:"'Instrument Serif','Noto Serif SC',serif",fontStyle:"italic",fontSize:"clamp(22px,3vw,36px)",color:"var(--muted)",marginTop:14,marginBottom:26,letterSpacing:"-0.01em",animation:heroVisible?"fadeUp .8s .11s ease forwards":"none",opacity:0}}>
              为互联网构建产品 — Building things for the web.
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:30,animation:heroVisible?"fadeUp .8s .16s ease forwards":"none",opacity:0}}>
              {["React","Node.js","TypeScript","Next.js","PostgreSQL","Docker","AWS 云端","GraphQL"].map((c,i)=>(
                <span key={c} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:500,letterSpacing:"0.09em",padding:"4px 10px",borderRadius:3,textTransform:"uppercase",cursor:"default",whiteSpace:"nowrap",background:i<2?"var(--ink)":i===2?"var(--lime)":"transparent",color:i<2?"var(--white)":i===2?"var(--ink)":"var(--ink)",border:i>=3?"1px solid var(--border)":"none"}}>{c}</span>
              ))}
            </div>
            <div className="kai-cta-row" style={{animation:heroVisible?"fadeUp .8s .22s ease forwards":"none",opacity:0}}>
              <button onClick={()=>{scrollTo("about");showToast("Loading projects...","↗")}} onMouseEnter={ce} onMouseLeave={cl} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 28px",background:"var(--ink)",color:"var(--white)",border:"none",borderRadius:100,cursor:"none",transition:"background .2s"}}>查看项目 · View Projects</button>
              <button onClick={()=>scrollTo("contact")} onMouseEnter={ce} onMouseLeave={cl} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 24px",background:"transparent",color:"var(--ink)",border:"1px solid var(--border)",borderRadius:100,cursor:"none"}}>联系我 · Get In Touch</button>
              <span style={{fontSize:18,display:"inline-block",marginLeft:8,animation:"arrowbounce 2.8s ease-in-out infinite"}}>↗</span>
            </div>
            <div className="kai-hero-tabs" style={{animation:heroVisible?"fadeUp .8s .3s ease forwards":"none",opacity:0}}>
              {[["01","网页应用 Web"],["02","接口 APIs"],["03","系统 Systems"],["04","开源 OSS"]].map(([num,label],i)=>(
                <div key={i} onMouseEnter={ce} onMouseLeave={cl} onClick={()=>{scrollTo(i<2?"about":"contact");showToast(["Web Apps","APIs","Systems","Open Source"][i]+" section coming soon");}} style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:"var(--ink)",padding:"12px 16px",cursor:"none",letterSpacing:"0.08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8,borderRight:i<3?"1px solid var(--border)":"none",overflow:"hidden"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)"}}>{num}</span>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — magazine lookbook panel (v3) */}
          <div className="kai-hero-right" style={{background:"#F7F5F0"}}>

            {/* Full-bleed noise grain overlay */}
            <div style={{position:"absolute",inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",backgroundRepeat:"repeat",backgroundSize:"160px",opacity:.28,pointerEvents:"none",zIndex:1,mixBlendMode:"multiply"}}/>

            {/* Left lime accent bar */}
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,zIndex:4,background:"linear-gradient(to bottom,transparent,var(--lime) 20%,var(--lime) 80%,transparent)"}}/>

            {/* Faint crosshatch — top-right quadrant only */}
            <svg style={{position:"absolute",top:0,right:0,width:"55%",height:"45%",pointerEvents:"none",opacity:.05,zIndex:1}} preserveAspectRatio="none">
              {Array.from({length:16}).map((_,i)=>(
                <line key={i} x1={i*22} y1="0" x2={i*22+200} y2="100%" stroke="#111" strokeWidth="1"/>
              ))}
            </svg>

            {/* Rotated ink stamp — bottom left */}
            <div style={{position:"absolute",bottom:24,left:24,zIndex:4,transform:"rotate(-6deg)",opacity:.18,pointerEvents:"none"}}>
              <div style={{width:58,height:58,border:"2.5px solid var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontFamily:"'Noto Serif SC',serif",fontSize:14,color:"var(--ink)",lineHeight:1.25,textAlign:"center",letterSpacing:"0.02em"}}>凯<br/>工</span>
              </div>
            </div>

            {/* ── TOP: quote block ── */}
            <div className="kai-rpad-top" style={{zIndex:5,animation:heroVisible?"fadeUp 1s .1s ease forwards":"none",opacity:0}}>

              {/* Eyebrow pill */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:26,border:"1px solid rgba(17,17,16,.12)",padding:"5px 12px 5px 8px"}}>
                <div style={{width:5,height:5,background:"var(--lime)",flexShrink:0}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.24em",color:"var(--muted)",textTransform:"uppercase"}}>工作哲学 · Philosophy</span>
              </div>

              {/* Quote */}
              <div style={{position:"relative"}}>
                {/* Decorative large open-quote */}
                <span style={{
                  position:"absolute",top:-52,left:-16,
                  fontFamily:"'Instrument Serif',serif",fontStyle:"italic",
                  fontSize:"clamp(120px,14vw,160px)",
                  color:"var(--lime)",lineHeight:1,opacity:.13,
                  pointerEvents:"none",userSelect:"none",
                }}>"</span>

                <div style={{position:"relative",zIndex:2}}>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(24px,3vw,36px)",lineHeight:1.15,color:"var(--ink)",letterSpacing:"-0.025em",marginBottom:8}}>
                    Code should be
                  </div>

                  {/* Highlighted display word */}
                  <div style={{display:"flex",alignItems:"flex-end",gap:0,marginBottom:8,lineHeight:1}}>
                    <span style={{
                      fontFamily:"'Bebas Neue',sans-serif",
                      fontSize:"clamp(56px,7.5vw,88px)",
                      letterSpacing:"0.025em",lineHeight:.9,
                      color:"var(--ink)",
                      position:"relative",
                    }}>
                      READABLE
                      {/* Lime underline sweep */}
                      <span style={{
                        position:"absolute",bottom:-4,left:0,right:0,height:5,
                        background:"var(--lime)",
                        transformOrigin:"left",
                        animation: heroVisible ? "sweepIn .9s .55s cubic-bezier(.4,0,.2,1) forwards" : "none",
                        transform:"scaleX(0)",
                      }}/>
                    </span>
                  </div>

                  <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(24px,3vw,36px)",lineHeight:1.15,color:"var(--ink)",letterSpacing:"-0.025em"}}>
                    first, clever second.
                  </div>
                </div>

                {/* Attribution */}
                <div style={{display:"flex",alignItems:"center",gap:14,marginTop:22}}>
                  <div style={{width:40,height:1,background:"var(--ink)",opacity:.14}}/>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",opacity:.7}}>Kai Zhang · 凯张</span>
                </div>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div className="kai-rpad-mid" style={{zIndex:5,display:"flex",alignItems:"center",gap:14,animation:heroVisible?"fadeUp 1s .2s ease forwards":"none",opacity:0}}>
              <div style={{flex:1,height:1,background:"rgba(17,17,16,.1)"}}/>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,letterSpacing:"0.24em",color:"var(--muted)",textTransform:"uppercase",whiteSpace:"nowrap",opacity:.6}}>精选项目 · Selected Works</span>
              <div style={{flex:1,height:1,background:"rgba(17,17,16,.1)"}}/>
            </div>

            {/* ── MIDDLE: project rows ── */}
            <div className="kai-rpad-inner" style={{zIndex:5,display:"flex",flexDirection:"column",justifyContent:"center",animation:heroVisible?"fadeUp 1s .3s ease forwards":"none",opacity:0}}>
              {[
                {idx:"01", slug:"Web App",    name:"Nexus Dashboard",  year:"2025", tech:"React · GraphQL",   bar:"var(--lime)"},
                {idx:"02", slug:"API",        name:"FlowAPI Platform", year:"2024", tech:"Node · PostgreSQL", bar:"#6B7CFF"    },
                {idx:"03", slug:"E-Commerce", name:"Atlas Commerce",   year:"2024", tech:"Next.js · Stripe",  bar:"var(--red)" },
                {idx:"04", slug:"Analytics",  name:"Orion Dashboard",  year:"2023", tech:"TypeScript · AWS",  bar:"#00C9A7"    },
              ].map((p,i)=>(
                <div key={i}
                  onMouseEnter={ce} onMouseLeave={cl}
                  onClick={()=>showToast("Case study coming soon","↗")}
                  style={{
                    display:"grid",
                    gridTemplateColumns:"28px auto 1fr auto",
                    alignItems:"center",gap:12,
                    padding:"14px 0",
                    borderBottom:"1px solid rgba(17,17,16,.08)",
                    borderTop: i===0 ? "1px solid rgba(17,17,16,.08)" : "none",
                    cursor:"none",transition:"background .25s, padding-left .25s",
                    position:"relative",overflow:"hidden",
                  }}
                  onMouseOver={e=>{
                    const el=e.currentTarget as HTMLElement;
                    el.style.background="rgba(184,240,58,.07)";
                    el.style.paddingLeft="8px";
                  }}
                  onMouseOut={e=>{
                    const el=e.currentTarget as HTMLElement;
                    el.style.background="transparent";
                    el.style.paddingLeft="0";
                  }}
                >
                  {/* Index */}
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--muted)",opacity:.35,letterSpacing:"0.04em"}}>{p.idx}</span>

                  {/* Colored bar tag */}
                  <div style={{width:3,height:32,background:p.bar,flexShrink:0,borderRadius:1}}/>

                  {/* Name + tech */}
                  <div style={{minWidth:0}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"var(--ink)",letterSpacing:"-0.015em",lineHeight:1.1}}>{p.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",color:"var(--muted)",textTransform:"uppercase",opacity:.7}}>{p.slug}</span>
                      <span style={{width:2,height:2,borderRadius:"50%",background:"var(--muted)",opacity:.3,display:"inline-block"}}/>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.08em",color:"var(--muted)",opacity:.55}}>{p.tech}</span>
                    </div>
                  </div>

                  {/* Year + arrow */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"var(--ink)",letterSpacing:"0.06em",lineHeight:1,opacity:.45}}>{p.year}</span>
                    <span style={{fontSize:11,color:p.bar,opacity:.7}}>↗</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── BOTTOM: availability card ── */}
            <div className="kai-rpad-bot" style={{zIndex:5,animation:heroVisible?"fadeUp 1s .42s ease forwards":"none",opacity:0}}>
              <div style={{
                border:"1px solid rgba(17,17,16,.1)",
                background:"rgba(255,255,255,.7)",
                backdropFilter:"blur(8px)",
                WebkitBackdropFilter:"blur(8px)",
                padding:"16px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                boxShadow:"0 4px 24px rgba(17,17,16,.06), inset 0 1px 0 rgba(255,255,255,.9)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#3ECF5A"}}/>
                    <div style={{position:"absolute",inset:-3,borderRadius:"50%",border:"2px solid rgba(62,207,90,.3)",animation:"pulse 2s infinite"}}/>
                  </div>
                  <div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"var(--ink)",letterSpacing:"-0.01em"}}>Available for work</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase",marginTop:2}}>接受项目 · &lt; 24h response</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.1em",color:"var(--muted)",textTransform:"uppercase"}}>📍 Remote</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,letterSpacing:"0.08em",color:"var(--muted)",opacity:.55,marginTop:2}}>UTC+8 · Global</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About & Contact (same structure, no changes) ─────────────────────── */}
        <SectionDivider label="索引 02 · 关于我 · About" activeDots={2}/>

        <section ref={aboutRef} id="about" className="kai-about">
          <div className="kai-about-l">
            <div style={{position:"absolute",left:0,top:"15%",bottom:"15%",width:2,background:"linear-gradient(to bottom,transparent,var(--red),transparent)"}}/>
            <div>
              <SectionLabel num="02" label="关于我 · About Me · 自我介绍" visible={aboutVisible} delay={0}/>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(60px,7vw,96px)",lineHeight:.88,color:"var(--ink)",letterSpacing:"0.01em",marginBottom:32,animation:aboutVisible?"fadeUp .8s .1s ease forwards":"none",opacity:0}}>CRAFTING<br/>CODE<br/><span style={{color:"var(--muted)",fontSize:"0.62em"}}>WITH PURPOSE</span></div>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:"clamp(17px,1.8vw,22px)",lineHeight:1.65,color:"var(--ink2)",letterSpacing:"-0.01em",marginBottom:36,animation:aboutVisible?"fadeUp .8s .2s ease forwards":"none",opacity:0}} className="kai-bio">
                I'm <strong style={{fontStyle:"italic",fontWeight:400,color:"var(--ink)",borderBottom:"1.5px solid var(--lime)",paddingBottom:1}}>Kai Zhang</strong>, a full-stack developer with 5 years of experience turning complex problems into elegant, performant digital products. I thrive at the intersection of{" "}
                <strong style={{fontStyle:"italic",fontWeight:400,color:"var(--ink)",borderBottom:"1.5px solid var(--lime)",paddingBottom:1}}>clean architecture</strong> and thoughtful user experience.<br/><br/>Based remotely, I collaborate with startups and product teams globally. Every line of code is written with intention.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:40,border:"1px solid var(--border)",animation:aboutVisible?"fadeUp .8s .3s ease forwards":"none",opacity:0}}>
                {[{num:"01",title:"Performance-First Thinking",desc:"Every decision — from architecture to micro-interaction — is measured against real-world impact on speed, accessibility, and scale."},{num:"02",title:"Ownership Over Everything",desc:"I treat every project like my own product. From CI/CD pipelines to pixel alignment — no detail is too small to care about."},{num:"03",title:"Clarity in Communication",desc:"Great software is built on clear communication. I document thoroughly, ship demos early, and align with stakeholders at every step."}].map((v,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:20,padding:"16px 20px",borderBottom:i<2?"1px solid var(--border)":"none",cursor:"default"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--lime)",background:"var(--ink)",padding:"2px 6px",letterSpacing:"0.06em",flexShrink:0,marginTop:2}}>{v.num}</span>
                    <div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)",letterSpacing:"0.02em"}}>{v.title}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"var(--muted)",lineHeight:1.5}}>{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="kai-cta-row" style={{animation:aboutVisible?"fadeUp .8s .4s ease forwards":"none",opacity:0}}>
              <button onClick={handleDownloadCV} onMouseEnter={ce} onMouseLeave={cl} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 28px",background:"var(--ink)",color:"var(--white)",border:"none",borderRadius:100,cursor:"none"}}>下载简历 · Download CV</button>
              <button onClick={()=>scrollTo("contact")} onMouseEnter={ce} onMouseLeave={cl} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:"12px 24px",background:"transparent",color:"var(--ink)",border:"1px solid var(--border)",borderRadius:100,cursor:"none"}}>联系我 · Contact</button>
            </div>
          </div>
          <div className="kai-about-r">
            <div style={{position:"absolute",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(200px,30vw,340px)",color:"rgba(17,17,16,.035)",lineHeight:1,bottom:-40,right:-30,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.06em"}}>02</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"var(--muted)",textTransform:"uppercase",marginBottom:40,animation:aboutVisible?"fadeUp .8s ease forwards":"none",opacity:0}}>经历 · Experience Timeline · 职业历程</div>
            <div style={{display:"flex",flexDirection:"column",gap:0,flex:1,marginBottom:40}}>
              {TIMELINE.map((t,i)=>(
                <div key={i} className="kai-tl-grid" style={{animation:aboutVisible?`fadeUp .8s ${.1+i*.15}s ease forwards`:"none",opacity:0}}>
                  <div style={{position:"absolute",left:80,top:0,bottom:0,width:1,background:i<TIMELINE.length-1?"var(--border)":"none"}}/>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--muted)",letterSpacing:"0.08em",padding:"24px 16px 24px 0",textAlign:"right",lineHeight:1,whiteSpace:"pre-line"}}>{t.years}</div>
                  <div style={{padding:"20px 0 20px 24px",borderBottom:i<TIMELINE.length-1?"1px solid var(--border)":"none",position:"relative"}}>
                    <div style={{position:"absolute",left:-4,top:28,width:7,height:7,borderRadius:"50%",background:t.active?"var(--lime)":"var(--bg2)",border:`1.5px solid ${t.active?"var(--lime)":"var(--border)"}`,boxShadow:t.active?"0 0 0 3px rgba(184,240,58,.2)":"none"}}/>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)",letterSpacing:"0.01em",marginBottom:3}}>{t.role}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>{t.company} · {t.location}</div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"rgba(17,17,16,.55)",lineHeight:1.55}}>{t.desc}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
                      {t.tags.map(tag=><span key={tag} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.08em",textTransform:"uppercase",padding:"3px 8px",border:"1px solid var(--border)",color:"var(--muted)"}}>{tag}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"var(--ink)",padding:"28px 28px 24px",position:"relative",animation:aboutVisible?"fadeUp .8s .5s ease forwards":"none",opacity:0}}>
              <div style={{position:"absolute",top:-1,left:0,width:40,height:3,background:"var(--lime)"}}/>
              <p style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(15px,1.4vw,18px)",color:"var(--white)",lineHeight:1.55,letterSpacing:"-0.01em"}}>"The best code is the code that doesn't need explaining — it reads like a well-written sentence. I write for the engineer who comes after me, not just the compiler in front of me."</p>
              <cite style={{display:"block",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.15em",color:"rgba(255,255,255,.25)",textTransform:"uppercase",marginTop:14,fontStyle:"normal"}}>— Kai Zhang · 凯 · Personal Philosophy</cite>
            </div>
          </div>
        </section>

        <SectionDivider label="索引 03 · 联系我 · Contact" activeDots={3}/>

        <section ref={contactRef} id="contact" className="kai-contact">
          <div className="kai-contact-l">
            <div style={{position:"absolute",left:0,top:"10%",bottom:"10%",width:2,background:"linear-gradient(to bottom,transparent,var(--lime),transparent)"}}/>
            <div style={{position:"absolute",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(120px,18vw,220px)",color:"rgba(255,255,255,.03)",lineHeight:1,bottom:-20,left:-10,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.04em"}}>联系</div>
            <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none"}}/>
            <div style={{position:"absolute",right:16,bottom:80,writingMode:"vertical-rl",fontFamily:"'Noto Serif SC',serif",fontWeight:300,fontSize:12,letterSpacing:"0.28em",color:"rgba(255,255,255,.08)",pointerEvents:"none",userSelect:"none",zIndex:2}}>诚邀合作 · 共创未来 · 精益求精</div>
            <div style={{position:"relative",zIndex:2}}>
              <div style={{display:"flex",alignItems:"center",gap:14,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"rgba(255,255,255,.25)",textTransform:"uppercase",marginBottom:40,animation:contactVisible?"fadeUp .8s ease forwards":"none",opacity:0}}>
                <span style={{fontSize:9,color:"var(--lime)",background:"rgba(255,255,255,.08)",padding:"2px 7px",letterSpacing:"0.1em"}}>03</span>联系我 · Get In Touch · お問い合わせ
              </div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(56px,6.5vw,88px)",lineHeight:.88,color:"var(--white)",letterSpacing:"0.01em",marginBottom:28,position:"relative",zIndex:2,animation:contactVisible?"fadeUp .8s .1s ease forwards":"none",opacity:0}}>LET'S<br/>BUILD<br/><span style={{color:"var(--lime)"}}>TOGETHER</span></div>
              <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"clamp(15px,1.5vw,19px)",color:"rgba(255,255,255,.45)",lineHeight:1.65,letterSpacing:"-0.01em",marginBottom:44,maxWidth:'min(360px,100%)',position:"relative",zIndex:2,animation:contactVisible?"fadeUp .8s .2s ease forwards":"none",opacity:0}}>Have a project in mind, a problem to solve, or just want to talk code? I'm always open to meaningful collaboration.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0,position:"relative",zIndex:2,marginBottom:44,animation:contactVisible?"fadeUp .8s .3s ease forwards":"none",opacity:0}}>
              {[{type:"Email · 邮件",icon:"✉",val:"kai@kaistudio.dev",fn:()=>window.location.href="mailto:kai@kaistudio.dev"},{type:"GitHub · 代码库",icon:"⌥",val:"github.com/kaistudio",fn:()=>window.open("https://github.com","_blank")},{type:"LinkedIn · 领英",icon:"◈",val:"linkedin.com/in/kaistudio",fn:()=>window.open("https://linkedin.com","_blank")},{type:"Response Time · 响应时间",icon:"◉",val:"Within 24 hours · 24小时内",fn:()=>showToast("I reply within 24 hours","⏱")}].map((ch,i)=>(
                <div key={i} onClick={ch.fn} onMouseEnter={ce} onMouseLeave={cl}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid rgba(255,255,255,.07)",borderTop:i===0?"1px solid rgba(255,255,255,.07)":"none",cursor:"none",transition:"padding-left .25s"}}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.paddingLeft="8px"}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.paddingLeft="0"}
                >
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:32,height:32,border:"1px solid rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{ch.icon}</div>
                    <div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.18em",color:"rgba(255,255,255,.25)",textTransform:"uppercase",marginBottom:2}}>{ch.type}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:"var(--white)",letterSpacing:"0.01em"}}>{ch.val}</div>
                    </div>
                  </div>
                  <span style={{fontSize:16,color:"rgba(255,255,255,.2)"}}>↗</span>
                </div>
              ))}
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(184,240,58,.1)",border:"1px solid rgba(184,240,58,.25)",padding:"10px 16px",position:"relative",zIndex:2,animation:contactVisible?"fadeUp .8s .4s ease forwards":"none",opacity:0}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"var(--lime)",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--lime)",textTransform:"uppercase"}}>接受工作 · Currently Available for Projects</span>
            </div>
          </div>
          <div className="kai-contact-r" style={{background:"var(--bg)"}}>
            <div style={{marginBottom:40,animation:contactVisible?"fadeUp .8s ease forwards":"none",opacity:0}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.24em",color:"var(--muted)",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <span style={{width:20,height:1,background:"var(--lime)",display:"inline-block"}}/>发送消息 · Send a Message
              </div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(36px,4vw,52px)",lineHeight:.9,color:"var(--ink)",letterSpacing:"0.02em"}}>START A<br/>CONVERSATION</div>
            </div>
            {!formSent ? (
              <div style={{display:"flex",flexDirection:"column",gap:0,flex:1,animation:shakeForm?"shake .6s ease":"none"}}>
                <div className="kai-form2">
                  <FieldGroup label="姓名 · Full Name *" visible={contactVisible} delay={.1}>
                    <input value={fname} onChange={e=>setFname(e.target.value)} placeholder="e.g. Alex Johnson" style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",background:"transparent",border:"none",outline:"none",width:"100%"}}/>
                  </FieldGroup>
                  <FieldGroup label="邮件 · Email Address *" visible={contactVisible} delay={.15} last>
                    <input value={femail} onChange={e=>setFemail(e.target.value)} type="email" placeholder="you@company.com" style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",background:"transparent",border:"none",outline:"none",width:"100%"}}/>
                  </FieldGroup>
                </div>
                <div className="kai-form2">
                  <FieldGroup label="公司 · Company / Studio" visible={contactVisible} delay={.2}>
                    <input value={fcompany} onChange={e=>setFcompany(e.target.value)} placeholder="Your company name" style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",background:"transparent",border:"none",outline:"none",width:"100%"}}/>
                  </FieldGroup>
                  <FieldGroup label="项目类型 · Project Type *" visible={contactVisible} delay={.25} last>
                    <select value={ftype} onChange={e=>setFtype(e.target.value)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",background:"transparent",border:"none",outline:"none",width:"100%",cursor:"none",appearance:"none"}}>
                      <option value="" disabled>Select a type…</option>
                      {["Web Application · 网页应用","API / Backend · 接口开发","E-Commerce · 电商平台","Dashboard / Analytics · 数据平台","Open Source · 开源项目","Consulting · 技术咨询","Other · 其他"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </FieldGroup>
                </div>
                <div style={{borderBottom:"1px solid var(--border)",padding:"20px 24px 16px",animation:contactVisible?"fadeUp .8s .3s ease forwards":"none",opacity:0}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>预算范围 · Budget Range</div>
                  <div className="kai-budget-chips">
                    {BUDGET_OPTS.map(b=>(
                      <span key={b} onMouseEnter={ce} onMouseLeave={cl} onClick={()=>setSelectedBudget(b)} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",padding:"5px 12px",border:"1px solid var(--border)",cursor:"none",transition:"all .18s",userSelect:"none",background:selectedBudget===b?"var(--ink)":"transparent",color:selectedBudget===b?"var(--lime)":"var(--muted)",borderColor:selectedBudget===b?"var(--ink)":"var(--border)"}}>{b}</span>
                    ))}
                  </div>
                </div>
                <FieldGroup label="项目描述 · Tell me about your project *" visible={contactVisible} delay={.35} full>
                  <textarea value={fmsg} onChange={e=>setFmsg(e.target.value)} placeholder="Briefly describe what you're building…" style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--ink)",background:"transparent",border:"none",outline:"none",width:"100%",minHeight:100,lineHeight:1.6,paddingTop:2,resize:"none"}}/>
                </FieldGroup>
                <div className="kai-send-row" style={{animation:contactVisible?"fadeUp .8s .4s ease forwards":"none",opacity:0}}>
                  <div className="kai-form-note">
                    <span style={{fontSize:8,color:"var(--lime)"}}>✦</span>Reply within 24h
                  </div>
                  <button onClick={handleSend} onMouseEnter={ce} onMouseLeave={cl} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",padding:"13px 32px",background:"var(--ink)",color:"var(--white)",border:"none",cursor:"none",display:"flex",alignItems:"center",gap:10}}>
                    发送消息 · Send Message <span>↗</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:16,padding:"clamp(20px,4vw,40px)",textAlign:"center",animation:"fadeUp .5s ease forwards"}}>
                <div style={{width:64,height:64,background:"var(--lime)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>✓</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:48,color:"var(--ink)",lineHeight:.9,letterSpacing:"0.02em"}}>MESSAGE<br/>SENT</div>
                <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:17,color:"var(--muted)",lineHeight:1.55,maxWidth:'min(320px,100%)'}}>谢谢你的留言 — Thank you for reaching out. I'll get back to you within 24 hours.</div>
              </div>
            )}
          </div>
        </section>

        <footer className="kai-footer">
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:"var(--muted)",textTransform:"uppercase"}}>© 2025 Kai Studio · 凯工作室 · All rights reserved</span>
          <div className="kai-footer-links">
            {[["GitHub","https://github.com"],["LinkedIn","https://linkedin.com"],["Twitter · 推特","https://twitter.com"],["Resume · 简历",null]].map(([label,url])=>(
              <a key={label as string} onMouseEnter={ce} onMouseLeave={cl} onClick={()=>url?window.open(url as string,"_blank"):handleDownloadCV()} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",color:"var(--muted)",textTransform:"uppercase",cursor:"none",textDecoration:"none"}}>{label}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function SectionDivider({ label, activeDots }: { label: string; activeDots: number }) {
  return (
    <div className="kai-divider">
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase",display:"flex",alignItems:"center",gap:12}}>
        <span style={{width:16,height:1,background:"var(--lime)",display:"inline-block"}}/>{label}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {[0,1,2,3,4].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:i<activeDots?"var(--lime)":"var(--border)"}}/>)}
      </div>
    </div>
  );
}

function SectionLabel({ num, label, visible, delay }: { num: string; label: string; visible: boolean; delay: number }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"var(--muted)",textTransform:"uppercase",marginBottom:40,animation:visible?`fadeUp .8s ${delay}s ease forwards`:"none",opacity:0}}>
      <span style={{fontSize:9,color:"var(--lime)",background:"var(--ink)",padding:"2px 7px",letterSpacing:"0.1em"}}>{num}</span>{label}
    </div>
  );
}

function FieldGroup({ label, children, visible, delay, last, full }: { label: string; children: React.ReactNode; visible: boolean; delay: number; last?: boolean; full?: boolean }) {
  return (
    <div style={{display:"flex",flexDirection:"column",borderBottom:"1px solid var(--border)",borderRight:last||full?"none":"1px solid var(--border)",gridColumn:full?"1 / -1":"auto",padding:"20px 24px 16px",position:"relative",transition:"background .2s",animation:visible?`fadeUp .8s ${delay}s ease forwards`:"none",opacity:0}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",color:"var(--muted)",textTransform:"uppercase",marginBottom:8}}>{label}</div>
      {children}
    </div>
  );
}