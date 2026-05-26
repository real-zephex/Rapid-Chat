"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Feature {
  title: string;
  desc: string;
  icon: string;
}

interface CompetitorFeature {
  name: string;
  rapid: boolean | string;
  chatgpt: boolean | string;
  claude: boolean | string;
  gemini: boolean | string;
}

type Badge = "winner" | "partial" | "none";

const FEATURES: Feature[] = [
  {
    title: "Multi-Model Chat",
    desc: "Switch between 30+ models from Groq and OpenRouter in a single conversation — no context loss.",
    icon: "M",
  },
  {
    title: "AI Council",
    desc: "Pose one question to multiple models simultaneously. A judge model synthesizes the best answer.",
    icon: "C",
  },
  {
    title: "Split View",
    desc: "Open two conversations side-by-side. Compare responses, swap panes, work in parallel.",
    icon: "S",
  },
  {
    title: "Privacy First",
    desc: "All chat data stays in your browser's IndexedDB. You bring your own API keys. Zero server storage.",
    icon: "P",
  },
  {
    title: "Tool Ecosystem",
    desc: "Six built-in tools: web reader, calculator, code execution, weather, YouTube transcripts, and time.",
    icon: "T",
  },
  {
    title: "Open Source",
    desc: "MIT-licensed. Self-host on your own infrastructure. Extend, customize, and contribute.",
    icon: "O",
  },
];

const COMPETITOR_FEATURES: CompetitorFeature[] = [
  { name: "Multi-model chat (one session)", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "Local-first privacy", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "Side-by-side comparison", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "AI Council (multi-model judge)", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "Bring your own API key", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "Open source / self-hostable", rapid: true, chatgpt: false, claude: false, gemini: false },
  { name: "Real-time streaming", rapid: true, chatgpt: true, claude: true, gemini: true },
  { name: "Code execution", rapid: true, chatgpt: true, claude: true, gemini: true },
  { name: "Voice input", rapid: true, chatgpt: true, claude: true, gemini: true },
  { name: "Image understanding", rapid: true, chatgpt: true, claude: true, gemini: true },
  { name: "PDF / document support", rapid: true, chatgpt: true, claude: true, gemini: true },
  { name: "Free tier available", rapid: true, chatgpt: "limited", claude: "limited", gemini: "limited" },
  { name: "Inference speed", rapid: "fastest", chatgpt: "moderate", claude: "moderate", gemini: "fast" },
];

function getBadge(val: boolean | string): Badge {
  if (val === true || val === "fastest") return "winner";
  if (typeof val === "string" && !["limited", "moderate", "plugins"].includes(val) && val !== "fast" && val !== "3 tools" && val !== "5 tools") return "winner";
  if (val === false) return "none";
  return "partial";
}

function getCellLabel(val: boolean | string): string {
  if (val === true) return "Yes";
  if (val === false) return "—";
  return val;
}

function renderCell(val: boolean | string, badge: Badge) {
  const label = getCellLabel(val);
  const isWinner = badge === "winner";
  return (
    <td
      className={`px-4 py-3 text-sm whitespace-nowrap ${
        isWinner ? "text-[#06d6a0] font-semibold" : "text-text-muted"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {isWinner && (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
            <path d="M7 0L8.57 5.13L13 5.13L9.5 8.27L10.9 13L7 10.2L3.1 13L4.5 8.27L1 5.13L5.43 5.13L7 0Z" fill="#06d6a0" />
          </svg>
        )}
        {label}
      </span>
    </td>
  );
}

function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [visible, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function RevealSection({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const styles = {
  section: "relative px-4 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-36",
  container: "mx-auto max-w-6xl",
  label: "inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#06d6a0] mb-5",
  h2: "font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-text-primary mb-4",
  body: "text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
};

function useIsDark() {
  const [dark, setDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme !== "light";
    }
    return true;
  });
  useEffect(() => {
    const el = document.documentElement;
    const check = () => setDark(el.dataset.theme !== "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function Header() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden"
      style={{ background: "#070707" }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6,214,160,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(255,209,102,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(6,214,160,0.4) 50%, transparent 100%)",
        }}
      />

      <div className="relative z-10 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div
          className="about-animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-8"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
            Introducing Rapid Chat
          </span>
        </div>

        <h1
          className="about-animate-fade-up font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight text-white mb-6"
          style={{ animationDelay: "0.25s" }}
        >
          Chat with every AI.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #06d6a0 0%, #ffd166 100%)",
            }}
          >
            Own your data.
          </span>
        </h1>

        <p
          className="about-animate-fade-up text-white/50 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ animationDelay: "0.45s" }}
        >
          A unified workspace for every AI model — with privacy-first local storage,
          side-by-side comparison, multi-model councils, and zero server lock-in.
        </p>

        <div
          className="about-animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-[0.14em] px-6 py-3 hover:bg-neutral-100 transition-all duration-200 shadow-lg"
          >
            Start Chatting
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="https://github.com/anomalyco/Rapid-Chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 text-white/70 font-bold text-sm uppercase tracking-[0.14em] px-6 py-3 hover:bg-white/[0.07] hover:border-white/40 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

function StatsBar() {
  const stats = [
    { label: "AI Models Supported", end: 30, suffix: "+" },
    { label: "Inference Providers", end: 3, suffix: "" },
    { label: "License", end: 2025, suffix: "", custom: "MIT" },
  ];

  return (
    <section className="relative border-y border-white/5" style={{ background: "#0a0a0a" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="grid grid-cols-3 divide-x divide-white/5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="py-8 sm:py-10 text-center about-animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight mb-1">
                {s.custom ? (
                  s.custom
                ) : (
                  <CountUp end={s.end} suffix={s.suffix} />
                )}
              </div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/40 font-bold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <RevealSection className={styles.section}>
      <div className={styles.container}>
        <span className={styles.label}>Manifesto</span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className={styles.h2}>
              The AI landscape is fractured.
            </h2>
            <p className={styles.body}>
              Every model has strengths. Every provider has a different API. Every
              conversation is locked inside a single chat window.
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              Rapid Chat is the workspace that brings them all together. Switch between
              30+ models mid-conversation. Compare responses side-by-side. Convene an
              AI Council — pose one question to multiple models and let a judge
              synthesize the best answer.
            </p>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              Your data stays with you — stored locally in your browser, not on our
              servers. Bring your own API keys. No accounts, no subscriptions, no
              lock-in.
            </p>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function FeaturesGrid() {
  return (
    <RevealSection className={styles.section}>
      <div className={styles.container}>
        <span className={styles.label}>Capabilities</span>
        <h2 className={styles.h2}>Everything you need to work with AI.</h2>
        <p className={`${styles.body} mb-10 sm:mb-14`}>
          From rapid prototyping to deep research — Rapid Chat adapts to how you think.
        </p>
        <div className={styles.grid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="about-animate-fade-up group relative rounded-2xl border border-border bg-background p-6 sm:p-8 hover:border-[#06d6a0]/20 hover:shadow-lg hover:shadow-[#06d6a0]/5 transition-all duration-300"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#06d6a0]/10 text-[#06d6a0] font-bold text-sm mb-5">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function CouncilShowcase() {
  return (
    <RevealSection className={styles.section}>
      <div className={styles.container}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className={styles.label}>Flagship Feature</span>
            <h2 className={styles.h2}>The AI Council.</h2>
            <p className={`${styles.body} mb-6`}>
              Pose one question to 2–5 models simultaneously. Each model responds in
              real-time. A designated judge model evaluates all responses and
              synthesizes a final verdict.
            </p>
            <ul className="space-y-3">
              {[
                "Parallel streaming from every council member",
                "Judge-synthesized final judgment",
                "Persistent council history in IndexedDB",
                "Copy any member response or the judgment",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/council"
              className="inline-flex items-center gap-2 mt-8 text-sm font-bold uppercase tracking-[0.14em] text-[#06d6a0] hover:text-[#05c494] transition-colors"
            >
              Try the Council
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="about-animate-scale-in relative" style={{ animationDelay: "0.2s" }}>
            <div
              className="rounded-2xl border border-white/10 p-1"
              style={{ background: "linear-gradient(135deg, rgba(6,214,160,0.12) 0%, rgba(255,209,102,0.08) 100%)" }}
            >
              <div className="rounded-xl bg-[#0a0a0a] p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 pb-3 border-b border-white/5">
                  <svg className="w-4 h-4 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1a9 9 0 100 18 9 9 0 000-18zM9 5a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h3V5z" />
                  </svg>
                  Council Session
                </div>
                {[
                  { name: "Llama 4 Scout", time: "1.2s", status: "complete" },
                  { name: "Gemma 3 27B", time: "0.9s", status: "complete" },
                  { name: "Claude Sonnet 4", time: "1.8s", status: "complete" },
                  { name: "GPT-4o Mini", time: "1.4s", status: "complete" },
                ].map((m, i) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03] border border-white/5 about-animate-fade-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#06d6a0]" />
                      <span className="text-sm text-white/80 font-medium">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{m.time}</span>
                      <svg className="w-3.5 h-3.5 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffd166]" />
                    <span className="text-sm text-white/80 font-semibold">Judge Verdict</span>
                    <span className="ml-auto text-xs text-[#ffd166] font-bold uppercase tracking-[0.12em]">
                      Synthesized
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">
                    Synthesized the strongest consensus across all responses, highlighting
                    key agreements and resolving contradictions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function ComparisonTable() {
  const dark = useIsDark();
  const headers = [
    { short: "", full: "Feature" },
    { short: "RC", full: "Rapid Chat", accent: true },
    { short: "GPT", full: "ChatGPT" },
    { short: "Cl", full: "Claude" },
    { short: "Ge", full: "Gemini" },
  ];

  return (
    <RevealSection
      className="relative py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-12"
      style={{ background: dark ? "#070707" : "#f0f0f0" }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n2)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] mb-5"
            style={{ color: "#06d6a0" }}
          >
            Head-to-Head
          </span>
          <h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-4"
            style={{ color: dark ? "#ffffff" : "#111111" }}
          >
            How we stack up.
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
          >
            An honest feature-by-feature comparison against the platforms you already know.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
          <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={h.full}
                    className={`sticky top-0 z-10 px-4 py-4 text-xs font-bold uppercase tracking-[0.12em] ${
                      i === 0 ? "text-left" : "text-center"
                    } ${h.accent ? "text-[#06d6a0]" : ""}`}
                    style={{
                      background: dark ? "#0a0a0a" : "#fafafa",
                      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      color: i === 0
                        ? (dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)")
                        : h.accent
                          ? "#06d6a0"
                          : (dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"),
                    }}
                  >
                    <span className="sm:hidden">{h.short}</span>
                    <span className="hidden sm:inline">{h.full}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_FEATURES.map((row, ri) => {
                const badges = {
                  rapid: getBadge(row.rapid),
                  chatgpt: getBadge(row.chatgpt),
                  claude: getBadge(row.claude),
                  gemini: getBadge(row.gemini),
                };
                const rowIsWinner = badges.rapid === "winner" && badges.chatgpt !== "winner" && badges.claude !== "winner" && badges.gemini !== "winner";
                return (
                  <tr
                    key={row.name}
                    className="about-animate-fade-up group transition-colors duration-200"
                    style={{
                      animationDelay: `${0.05 + ri * 0.04}s`,
                      background: dark
                        ? rowIsWinner ? "rgba(6,214,160,0.03)" : "transparent"
                        : rowIsWinner ? "rgba(6,214,160,0.04)" : "transparent",
                      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                    }}
                  >
                    <td
                      className="px-4 py-3 text-sm font-medium whitespace-nowrap"
                      style={{
                        color: dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                        borderRight: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      }}
                    >
                      {rowIsWinner && (
                        <span className="inline-block mr-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#06d6a0] bg-[#06d6a0]/10 rounded-full px-2 py-0.5 leading-normal">
                          Win
                        </span>
                      )}
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-center">{renderCell(row.rapid, badges.rapid)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.chatgpt, badges.chatgpt)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.claude, badges.claude)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.gemini, badges.gemini)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p
          className="text-xs mt-4 text-center"
          style={{ color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
        >
          Features and capabilities accurate as of May 2026. Competitor data based on publicly available information.
        </p>
      </div>
    </RevealSection>
  );
}

function PrivacySection() {
  return (
    <RevealSection className={styles.section}>
      <div className={styles.container}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div
              className="about-animate-scale-in relative rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "linear-gradient(135deg, rgba(6,214,160,0.06) 0%, rgba(255,209,102,0.04) 100%)",
                animationDelay: "0.2s",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#06d6a0]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Your Browser (IndexedDB)</div>
                    <div className="text-xs text-white/40">All chat data stored locally</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <svg className="w-4 h-4 text-[#ffd166]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-white/60">Data never leaves your machine except for API calls to the provider you choose.</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <svg className="w-4 h-4 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-white/60">Your API keys are sent directly to the provider — never stored or logged by us.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className={styles.label}>Privacy</span>
            <h2 className={styles.h2}>Your conversations are yours.</h2>
            <p className={`${styles.body} mb-6`}>
              Every message, every session, every council deliberation — stored in your
              browser&rsquo;s IndexedDB. No cloud sync, no training data, no surveillance.
            </p>
            <ul className="space-y-3">
              {[
                "Zero server-side storage of chat history",
                "Bring your own API keys — no subscriptions",
                "Local-first with localStorage fallback",
                "Delete all data with one click",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#06d6a0]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function OpenSourceSection() {
  const dark = useIsDark();
  return (
    <RevealSection
      className="relative py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-12 text-center overflow-hidden"
      style={{ background: dark ? "#070707" : "#f0f0f0" }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n3)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-8"
          style={{ background: "rgba(6,214,160,0.1)" }}
        >
          <svg className="w-7 h-7 text-[#06d6a0]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <span className={styles.label}>Open Source</span>
        <h2
          className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-4"
          style={{ color: dark ? "#ffffff" : "#111111" }}
        >
          Built in the open.
          <br />
          Free to use. Free to host.
        </h2>
        <p
          className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10"
          style={{ color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
        >
          MIT-licensed. Self-host on your own infrastructure. No telemetry, no tracking,
          no hidden costs. Contribute, fork, extend — it&rsquo;s yours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/anomalyco/Rapid-Chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-[0.14em] px-6 py-3 hover:bg-neutral-100 transition-all duration-200 shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Star on GitHub
          </a>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-bold text-sm uppercase tracking-[0.14em] transition-all duration-200"
            style={{
              borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
              color: dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
            }}
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}

function FooterCTA() {
  return (
    <section
      className="relative py-20 sm:py-28 text-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(6,214,160,0.08) 0%, rgba(255,209,102,0.04) 100%), #070707",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n4'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n4)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-8">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-white mb-4">
          Ready to go faster?
        </h2>
        <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10">
          No sign-up. No credit card. Just bring your API key and start chatting with
          every model you care about.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-[0.14em] px-8 py-4 hover:bg-neutral-100 transition-all duration-200 shadow-lg text-base"
        >
          Start Chatting Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = "About | Rapid Chat";
  }, []);

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>
      <Header />
      <StatsBar />
      <Manifesto />
      <FeaturesGrid />
      <CouncilShowcase />
      <ComparisonTable />
      <PrivacySection />
      <OpenSourceSection />
      <FooterCTA />
    </div>
  );
}
