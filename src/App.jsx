import { useState, useEffect, useCallback } from "react";

const TOPICS = [
  "Urban exploration", "Street food culture", "Tech startups", "Wildlife conservation",
  "Underground music scenes", "Space tourism", "Vintage fashion", "Coffee culture",
  "Digital nomads", "Extreme sports", "Artisan crafts", "Smart cities",
  "Ocean mysteries", "Film festivals", "Urban farming", "Cybersecurity",
  "Ancient civilizations", "Street art", "Mindfulness movement", "Food science",
  "Travel photography", "Local markets", "Language learning", "Architecture",
  "Sustainable living", "Music production", "Cooking traditions", "Social media",
  "Artificial intelligence in daily life", "Remote work culture",
  "Mental health awareness", "Electric vehicles", "Short-form video content",
  "Minimalism and decluttering", "Plant-based diets", "Cryptocurrency and Web3",
  "Climate anxiety", "Quiet quitting and work-life balance",
  "Influencer economy", "Gig economy workers", "Fast fashion vs slow fashion",
  "Neurodiversity in the workplace", "Sleep optimization",
  "Solo travel", "Fitness technology", "Online learning platforms",
  "Home automation and smart devices", "True crime obsession",
  "Reality TV culture", "Thrift shopping", "Escape rooms and puzzle culture",
  "Gaming and esports", "Podcasting boom", "Digital detox",
  "Wellness tourism", "Urban nightlife transformation", "Food delivery culture",
  "Volunteering abroad", "Zero waste lifestyle", "Freelancing and side hustles",
  "Streaming wars", "Pop-up experiences", "Retro gaming nostalgia",
];

const today = new Date();
const DAILY_SEED_BASE = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
const DEFAULT_TOPIC_INDEX = (today.getDate() + today.getMonth() * 31) % TOPICS.length;

const LEVELS = {
  b1: {
    id: "b1",
    label: "B1",
    fullLabel: "B1 Intermediate",
    color: "#22c55e",
    colorBg: "rgba(34,197,94,0.1)",
    colorBorder: "rgba(34,197,94,0.3)",
    description: "Simple sentences · Common words · Basic idioms",
    prompt: `You are an English language teacher creating content for B1 (intermediate) level learners.

B1 guidelines:
- Use common, everyday vocabulary — words learners encounter regularly
- Short to medium sentences; avoid complex structures
- Tenses: present simple, past simple, present perfect, future with will/going to
- Avoid subjunctive
- Story: 330-360 words, very clear narrative, short paragraphs
- Vocabulary: words a B1 student needs to know — not too easy, not too advanced
- Idioms: only the most common everyday idioms
- Questions: comprehension answers clearly in the text; discussion questions are simple and personal

Generate ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "story": "330-360 word story strictly at B1 level: simple clear sentences, common vocabulary, engaging narrative",
  "vocabulary": [{"word": "word or short phrase", "ipa": "/IPA/", "definition": "very simple definition", "example": "simple example sentence", "type": "noun or verb or adjective or phrasal verb"}],
  "idioms": [{"idiom": "common idiom", "meaning": "simple explanation", "used_in": "short quote from story"}],
  "questions": [{"question": "question", "type": "comprehension or discussion", "hint": "short hint"}]
}
Rules: 10-12 vocabulary items · 3-4 common idioms · exactly 15 questions (first 7 comprehension, last 8 discussion)`,
  },
  b1plus: {
    id: "b1plus",
    label: "B1+",
    fullLabel: "B1+ Upper Intermediate",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.1)",
    colorBorder: "rgba(245,158,11,0.3)",
    description: "Varied sentences · Richer vocabulary · Natural idioms",
    prompt: `You are an English language teacher creating content for B1+ (upper-intermediate, between B1 and B2) level learners.

B1+ guidelines:
- Mix simple and compound sentences; introduce some complex structures (relative clauses, "although", "despite")
- Vocabulary: richer than B1 — include some less common collocations and multi-word verbs
- Tenses: all B1 tenses plus present perfect continuous, past continuous, conditionals (type 1 and 2)
- Some passive voice is fine if natural
- Story: 360-400 words, engaging narrative with more descriptive language
- Vocabulary: target words that stretch a B1 learner toward B2 — useful but not overly academic
- Idioms: natural conversational idioms and fixed phrases
- Questions: comprehension requires reading between the lines; discussion questions invite personal opinions and reasons

Generate ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "story": "360-400 word story at B1+ level: varied sentences, descriptive language, engaging narrative with some complexity",
  "vocabulary": [{"word": "word or short phrase", "ipa": "/IPA/", "definition": "clear definition", "example": "natural example sentence", "type": "noun or verb or adjective or phrasal verb"}],
  "idioms": [{"idiom": "natural idiom or fixed phrase", "meaning": "plain explanation", "used_in": "short quote from story"}],
  "questions": [{"question": "question", "type": "comprehension or discussion", "hint": "short hint"}]
}
Rules: 12-14 vocabulary items · 4-5 idioms · exactly 15 questions (first 7 comprehension, last 8 discussion)`,
  },
};

function getSharedContent() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("c");
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch { return null; }
}

function encodeContent(content) {
  return btoa(encodeURIComponent(JSON.stringify(content)));
}

const TYPE_COLORS_DARK = {
  noun:           { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  text: "#4ade80" },
  verb:           { bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)",  text: "#60a5fa" },
  adjective:      { bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)", text: "#f472b6" },
  "phrasal verb": { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", text: "#a78bfa" },
};
const TYPE_COLORS_LIGHT = {
  noun:           { bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.25)",  text: "#15803d" },
  verb:           { bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.25)",  text: "#1d4ed8" },
  adjective:      { bg: "rgba(219,39,119,0.08)", border: "rgba(219,39,119,0.25)", text: "#be185d" },
  "phrasal verb": { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.25)", text: "#6d28d9" },
};

const THEMES = {
  dark: {
    bg: "#0c0e16", surface: "#13161f", surfaceEl: "#1a1d2a",
    border: "rgba(255,255,255,0.07)", borderHover: "rgba(255,255,255,0.16)",
    text: "#e8eaf0", textMuted: "#8b92a5", textFaint: "#4a5268", textFaintest: "#272b3a",
    accent: "#4f7ef8", accentText: "#7ea9ff", accentBg: "rgba(79,126,248,0.12)", accentBorder: "rgba(79,126,248,0.3)",
    tabActive: "rgba(79,126,248,0.18)", tabActiveText: "#7ea9ff", tabText: "#4a5268",
    idiomBg: "rgba(251,146,60,0.07)", idiomBorder: "rgba(251,146,60,0.2)", idiomText: "#fb923c", idiomMuted: "#6b6355",
    successBg: "rgba(34,197,94,0.07)", successBorder: "rgba(34,197,94,0.2)", successText: "#6ee7a0",
    inputBg: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)",
    storyText: "#c8cdd8", ipaColor: "#6b7db5",
    speakBtn: "rgba(79,126,248,0.15)", speakBtnText: "#7ea9ff",
  },
  light: {
    bg: "#f5f6fa", surface: "#ffffff", surfaceEl: "#f0f2f8",
    border: "rgba(0,0,0,0.07)", borderHover: "rgba(0,0,0,0.16)",
    text: "#1a1d2e", textMuted: "#4a5268", textFaint: "#8b92a5", textFaintest: "#c8cdd8",
    accent: "#3b63e8", accentText: "#2952d4", accentBg: "rgba(59,99,232,0.08)", accentBorder: "rgba(59,99,232,0.22)",
    tabActive: "rgba(59,99,232,0.1)", tabActiveText: "#2952d4", tabText: "#8b92a5",
    idiomBg: "rgba(234,88,12,0.06)", idiomBorder: "rgba(234,88,12,0.18)", idiomText: "#b94d00", idiomMuted: "#9a8e83",
    successBg: "rgba(22,163,74,0.07)", successBorder: "rgba(22,163,74,0.2)", successText: "#166534",
    inputBg: "rgba(0,0,0,0.03)", inputBorder: "rgba(0,0,0,0.09)",
    storyText: "#2d3148", ipaColor: "#5568a8",
    speakBtn: "rgba(59,99,232,0.08)", speakBtnText: "#2952d4",
  },
};

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch {
    const m = clean.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch {
      console.log('error')
    }
  }
  return null;
}

function speakWord(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang="en-US"; utt.rate=0.8;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v=>v.lang==="en-US"&&v.localService)||voices.find(v=>v.lang==="en-US")||voices.find(v=>v.lang.startsWith("en"));
  if (v) utt.voice=v;
  window.speechSynthesis.speak(utt);
}

function VocabCard({ item, active, T, TYPE_COLORS, onHighlight }) {
  const [speaking, setSpeaking] = useState(false);
  const c = TYPE_COLORS[item.type] || TYPE_COLORS.noun;
  const handleSpeak = (e) => {
    e.stopPropagation(); setSpeaking(true); speakWord(item.word);
    setTimeout(()=>setSpeaking(false), 1200);
  };
  return (
    <div onClick={()=>onHighlight(item.word)} style={{ background:active?T.accentBg:T.surface, border:`1px solid ${active?T.accentBorder:T.border}`, borderRadius:14, padding:"14px 16px", cursor:"pointer", transition:"all 0.18s", boxShadow:active?`0 0 0 2px ${T.accentBorder}`:"none" }}
      onMouseOver={e=>{if(!active)e.currentTarget.style.borderColor=T.borderHover;}}
      onMouseOut={e=>{if(!active)e.currentTarget.style.borderColor=T.border;}}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <span style={{ fontSize:16, color:T.text, fontWeight:700 }}>{item.word}</span>
          <button onClick={handleSpeak} style={{ background:speaking?T.accentBg:T.speakBtn, border:`1px solid ${speaking?T.accentBorder:"transparent"}`, borderRadius:20, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.15s", color:T.speakBtnText, fontSize:13, transform:speaking?"scale(1.15)":"scale(1)" }}>
            {speaking?"🔊":"🔈"}
          </button>
        </div>
        <span style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", background:c.bg, color:c.text, border:`1px solid ${c.border}`, borderRadius:20, padding:"2px 10px", whiteSpace:"nowrap", flexShrink:0 }}>{item.type}</span>
      </div>
      {item.ipa && <div style={{ fontSize:13, color:T.ipaColor, marginBottom:6, fontFamily:"monospace", letterSpacing:"0.04em" }}>{item.ipa}</div>}
      <div style={{ fontSize:13, color:T.textMuted, marginBottom:4, lineHeight:1.5 }}>{item.definition}</div>
      <div style={{ fontSize:12, color:T.textFaint, fontStyle:"italic", lineHeight:1.4 }}>"{item.example}"</div>
    </div>
  );
}

function QuestionCard({ q, i, T, answer, setAnswer, isSubmitted, onSubmit }) {
  const isComp = q.type==="comprehension";
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:11 }}>
        <div style={{ minWidth:26, height:26, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:isComp?T.accentBg:"rgba(236,72,153,0.12)", color:isComp?T.accentText:"#f472b6", fontSize:11, fontWeight:700 }}>{i+1}</div>
        <div>
          <div style={{ fontSize:"clamp(13px,2.3vw,15px)", color:T.text, lineHeight:1.6, marginBottom:4 }}>{q.question}</div>
          {q.hint&&<div style={{ fontSize:11, color:T.textFaint, fontStyle:"italic" }}>💡 {q.hint}</div>}
        </div>
      </div>
      {isSubmitted ? (
        <div style={{ background:T.successBg, border:`1px solid ${T.successBorder}`, borderRadius:9, padding:"10px 14px", fontSize:13, color:T.successText, lineHeight:1.5 }}>✓ {answer}</div>
      ) : (
        <div style={{ display:"flex", gap:8 }}>
          <textarea value={answer||""} onChange={e=>setAnswer(e.target.value)} placeholder="Write your answer here…" rows={2}
            style={{ flex:1, background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:9, padding:"10px 13px", color:T.text, fontSize:13, resize:"vertical", outline:"none", transition:"border-color 0.18s", fontFamily:"'Inter',sans-serif", lineHeight:1.5 }}
            onFocus={e=>e.target.style.borderColor=T.accentBorder}
            onBlur={e=>e.target.style.borderColor=T.inputBorder}
          />
          <button onClick={onSubmit} style={{ background:answer?.trim()?T.accent:T.surfaceEl, border:"none", borderRadius:9, padding:"0 16px", color:answer?.trim()?"white":T.textFaint, cursor:answer?.trim()?"pointer":"default", fontSize:17, alignSelf:"flex-end", height:42, transition:"background 0.18s", flexShrink:0 }}>✓</button>
        </div>
      )}
    </div>
  );
}

export default function WordAndWorld() {
  const [isDark, setIsDark] = useState(true);
  const [level, setLevel] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("lvl")==="b1plus" ? "b1plus" : "b1";
  });
  const [topicIndex, setTopicIndex] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("t");
    if (t!==null && !isNaN(t) && Number(t)<TOPICS.length) return Number(t);
    return DEFAULT_TOPIC_INDEX;
  });

  // If URL has encoded content → use it directly, skip generation
  const [content, setContent] = useState(() => getSharedContent());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("story");
  const [highlighted, setHighlighted] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [appear, setAppear] = useState(() => !!getSharedContent()); // immediate if shared
  const [regenCount, setRegenCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const isSharedLesson = !!new URLSearchParams(window.location.search).get("c");

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load(); window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const T = THEMES[isDark?"dark":"light"];
  const TYPE_COLORS = isDark ? TYPE_COLORS_DARK : TYPE_COLORS_LIGHT;
  const LVL = LEVELS[level];
  const DAILY_TOPIC = TOPICS[topicIndex];
  const DAILY_SEED = `${DAILY_SEED_BASE}-${regenCount}-${level}`;

  const fetchContent = useCallback(async () => {
    setLoading(true); setError(null); setAppear(false);
    setContent(null); setAnswers({}); setSubmitted({}); setHighlighted(null); setTab("story");
    try {
      const cacheKey = `ww_${level}_${DAILY_SEED}_${topicIndex}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setContent(JSON.parse(cached)); setTimeout(()=>setAppear(true),50); setLoading(false); return;
      }
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${import.meta.env.VITE_GROQ_API_KEY}`},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:3500,
          messages:[
            {role:"system", content:LVL.prompt},
            {role:"user", content:`Topic: "${DAILY_TOPIC}". Seed: ${DAILY_SEED}. Return ONLY raw JSON.`}
          ],
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJSON(raw);
      if (!parsed) throw new Error("Could not parse response. Please retry.");
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      setContent(parsed);
      setTimeout(()=>setAppear(true),50);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [DAILY_SEED, topicIndex, DAILY_TOPIC, level, LVL]);

  // Only auto-fetch if no shared content in URL
  useEffect(() => {
    if (!getSharedContent()) fetchContent();
  }, [fetchContent]);

  const regenerate = () => {
    // Clear shared content from URL
    window.history.replaceState(null, "", window.location.pathname);
    const newIdx = Math.floor(Math.random()*TOPICS.length);
    setTopicIndex(newIdx);
    setRegenCount(c=>c+1);
  };

  const switchLevel = (newLevel) => {
    if (newLevel===level) return;
    window.history.replaceState(null, "", window.location.pathname);
    setLevel(newLevel);
    setRegenCount(0);
  };

  // Share: encode full content into URL so recipient gets IDENTICAL text
  const shareLink = () => {
    if (!content) return;
    const encoded = encodeContent({ ...content, _topic: DAILY_TOPIC, _level: level });
    const url = `${window.location.origin}${window.location.pathname}?t=${topicIndex}&lvl=${level}&c=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(()=>setCopied(false), 2500);
    });
  };

  const renderHighlighted = (text) => {
    if (!highlighted||!text) return text;
    const esc = highlighted.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    return text.split(new RegExp(`(${esc})`,"gi")).map((p,i)=>
      p.toLowerCase()===highlighted.toLowerCase()
        ? <mark key={i} style={{background:"#fde68a",color:"#1c1917",borderRadius:3,padding:"0 2px"}}>{p}</mark>
        : p
    );
  };

  const dateStr = today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const allDone = content && content.questions?.length>0 && Object.keys(submitted).length>=content.questions.length;
  const answeredCount = Object.keys(submitted).length;
  const totalQ = content?.questions?.length||0;
  const sharedTopic = content?._topic || DAILY_TOPIC;

  const tabStyle = (t) => ({
    flex:1, padding:"9px 6px", border:"none", cursor:"pointer",
    borderRadius:9, fontSize:"clamp(12px,2.5vw,14px)",
    fontFamily:"'Inter',sans-serif", fontWeight:tab===t?600:400,
    transition:"all 0.18s",
    background:tab===t?T.tabActive:"transparent",
    color:tab===t?T.tabActiveText:T.tabText,
    whiteSpace:"nowrap",
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Inter',sans-serif", color:T.text, transition:"background 0.3s,color 0.25s" }}>
        <div style={{ maxWidth:820, margin:"0 auto", padding:"clamp(20px,5vw,40px) clamp(16px,4vw,24px) 100px" }}>

          {/* HEADER */}
          <header style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:"0.35em", textTransform:"uppercase", color:T.accent, marginBottom:8, fontWeight:600 }}>◆ Daily English</div>
                <h1 style={{ margin:0, fontSize:"clamp(24px,6vw,42px)", fontWeight:700, letterSpacing:"-0.03em", color:T.text, lineHeight:1 }}>
                  Word <span style={{color:T.accent}}>&</span> World
                </h1>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={()=>setIsDark(d=>!d)} style={{ background:T.surfaceEl, border:`1px solid ${T.border}`, borderRadius:10, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16 }}>
                  {isDark?"☀️":"🌙"}
                </button>
                <button onClick={shareLink} disabled={!content} style={{ background:copied?"rgba(34,197,94,0.12)":T.surfaceEl, border:`1px solid ${copied?"rgba(34,197,94,0.35)":T.border}`, borderRadius:10, height:38, padding:"0 14px", cursor:content?"pointer":"not-allowed", fontSize:13, color:copied?"#22c55e":T.textMuted, fontWeight:600, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s", opacity:content?1:0.4 }}>
                  {copied?"✓ Copied!":"🔗 Share"}
                </button>
                <button onClick={regenerate} disabled={loading} style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, height:38, padding:"0 16px", cursor:loading?"not-allowed":"pointer", fontSize:13, color:T.accentText, fontWeight:600, opacity:loading?0.5:1, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ animation:loading?"spin 1s linear infinite":"none", display:"inline-block" }}>↻</span>
                  New topic
                </button>
              </div>
            </div>

            {/* SHARED LESSON BANNER */}
            {isSharedLesson && (
              <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:12, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:18 }}>🔗</span>
                <div>
                  <div style={{ fontSize:13, color:"#22c55e", fontWeight:700, marginBottom:2 }}>Shared lesson — identical for both learners</div>
                  <div style={{ fontSize:12, color:T.textFaint }}>This lesson was shared with you. You are reading the exact same story and questions as your partner.</div>
                </div>
              </div>
            )}

            {/* LEVEL SWITCHER */}
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {Object.values(LEVELS).map(lvl => {
                const active = level===lvl.id;
                return (
                  <button key={lvl.id} onClick={()=>switchLevel(lvl.id)} style={{ border:`2px solid ${active?lvl.color:T.border}`, borderRadius:12, padding:"10px 18px", cursor:"pointer", background:active?lvl.colorBg:T.surface, transition:"all 0.2s", textAlign:"left", boxShadow:active?`0 0 0 1px ${lvl.colorBorder}`:"none", flex:"1 1 180px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16, fontWeight:800, color:active?lvl.color:T.textMuted }}>{lvl.label}</span>
                      <span style={{ fontSize:12, color:active?lvl.color:T.textFaint, fontWeight:600 }}>{lvl.fullLabel}</span>
                      {active&&<span style={{ marginLeft:"auto", fontSize:10, background:lvl.colorBg, color:lvl.color, border:`1px solid ${lvl.colorBorder}`, borderRadius:20, padding:"1px 8px", fontWeight:700 }}>ACTIVE</span>}
                    </div>
                    <div style={{ fontSize:11, color:active?lvl.color:T.textFaint, opacity:active?0.85:1 }}>{lvl.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Topic pill */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:T.surface, border:`1px solid ${T.border}`, borderRadius:50, padding:"8px 18px" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:LVL.color, boxShadow:isDark?`0 0 8px ${LVL.color}`:"none", flexShrink:0 }}/>
                <span style={{ fontSize:10, color:T.textFaint, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600 }}>topic</span>
                <span style={{ fontSize:"clamp(13px,3vw,15px)", color:T.text, fontWeight:500 }}>{sharedTopic}</span>
              </div>
              <span style={{ fontSize:12, color:T.textFaint }}>{dateStr}</span>
            </div>
          </header>

          {/* LOADING */}
          {loading && (
            <div style={{ textAlign:"center", padding:"90px 0" }}>
              <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:18 }}>
                <div style={{ position:"relative", width:48, height:48 }}>
                  <div style={{ position:"absolute", inset:0, border:`2px solid ${T.border}`, borderRadius:"50%" }}/>
                  <div style={{ position:"absolute", inset:0, border:"2px solid transparent", borderTopColor:LVL.color, borderRadius:"50%", animation:"spin 0.85s linear infinite" }}/>
                </div>
                <div style={{ fontSize:14, color:T.textFaint, fontWeight:500 }}>Crafting your {LVL.label} lesson…</div>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14, padding:"18px 22px", marginBottom:20 }}>
              <div style={{ color:"#fca5a5", fontSize:14, marginBottom:12 }}>{error}</div>
              <button onClick={fetchContent} style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:9, padding:"8px 22px", color:T.accentText, cursor:"pointer", fontSize:13, fontWeight:600 }}>Try again</button>
            </div>
          )}

          {/* CONTENT */}
          {content && !loading && (
            <div style={{ opacity:appear?1:0, transform:appear?"none":"translateY(12px)", transition:"opacity 0.45s ease,transform 0.45s ease" }}>

              <div style={{ background:LVL.colorBg, border:`1px solid ${LVL.colorBorder}`, borderRadius:10, padding:"9px 16px", marginBottom:16, display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
                <span style={{ fontSize:13, color:LVL.color, fontWeight:700 }}>{LVL.fullLabel}</span>
                <span style={{ fontSize:12, color:LVL.color, opacity:0.8 }}>{LVL.description}</span>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", gap:3, marginBottom:22, background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.04)", border:`1px solid ${T.border}`, borderRadius:13, padding:4 }}>
                {[["story","📖","Story"],["vocabulary","📚","Words"],["questions","💬","Questions"]].map(([t,icon,label])=>(
                  <button key={t} onClick={()=>setTab(t)} style={tabStyle(t)}>{icon} {label}</button>
                ))}
              </div>

              {/* STORY */}
              {tab==="story" && (
                <div style={{ animation:"fadeUp 0.3s ease" }}>
                  <div style={{ background:LVL.colorBg, border:`1px solid ${LVL.colorBorder}`, borderRadius:10, padding:"9px 16px", marginBottom:14, fontSize:12, color:LVL.color, display:"flex", gap:8, alignItems:"center" }}>
                    <span>💡</span>
                    <span>{level==="b1" ? "Read carefully. Try to understand the main idea first, then read again for details." : "Read the full story. Pay attention to how ideas connect between sentences."}</span>
                  </div>
                  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"clamp(20px,5vw,32px) clamp(18px,5vw,36px)", lineHeight:2, fontSize:"clamp(15px,2.5vw,17px)", color:T.storyText, marginBottom:22, fontWeight:400, boxShadow:isDark?"none":"0 2px 16px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin:0 }}>{highlighted ? renderHighlighted(content.story) : content.story}</p>
                  </div>
                  {content.idioms?.length>0 && (
                    <div style={{ marginBottom:24 }}>
                      <div style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:T.idiomText, marginBottom:12, fontWeight:700 }}>✦ Idioms in this story</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {content.idioms.map((id,i)=>(
                          <div key={i} style={{ background:T.idiomBg, border:`1px solid ${T.idiomBorder}`, borderRadius:11, padding:"9px 14px" }}>
                            <div style={{ fontSize:14, color:T.idiomText, fontStyle:"italic", marginBottom:3, fontWeight:500 }}>"{id.idiom}"</div>
                            <div style={{ fontSize:12, color:T.idiomMuted }}>{id.meaning}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                    <button onClick={()=>setTab("vocabulary")} style={{ background:"transparent", border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"11px 28px", color:T.accentText, cursor:"pointer", fontSize:14, fontWeight:600 }}>Study vocabulary →</button>
                    <button onClick={()=>setTab("questions")} style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"11px 28px", color:T.accentText, cursor:"pointer", fontSize:14, fontWeight:600 }}>Go to questions →</button>
                  </div>
                </div>
              )}

              {/* VOCABULARY */}
              {tab==="vocabulary" && (
                <div style={{ animation:"fadeUp 0.3s ease" }}>
                  <div style={{ fontSize:11, color:T.textFaint, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14, fontWeight:600 }}>
                    🔈 Tap to hear · tap card to find in story · {content.vocabulary?.length} {LVL.label} words
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))", gap:10, marginBottom:28 }}>
                    {content.vocabulary?.map((item,i)=>(
                      <VocabCard key={i} item={item} T={T} TYPE_COLORS={TYPE_COLORS}
                        active={highlighted===item.word}
                        onHighlight={(word)=>{ setHighlighted(highlighted===word?null:word); if(highlighted!==word) setTab("story"); }}
                      />
                    ))}
                  </div>
                  {content.idioms?.length>0 && (
                    <>
                      <div style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:T.idiomText, marginBottom:12, fontWeight:700 }}>✦ Idioms & Phrases</div>
                      <div style={{ display:"grid", gap:8, marginBottom:28 }}>
                        {content.idioms.map((item,i)=>(
                          <div key={i} style={{ background:T.idiomBg, border:`1px solid ${T.idiomBorder}`, borderRadius:12, padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                              <span style={{ fontSize:15, color:T.idiomText, fontStyle:"italic", fontWeight:500 }}>"{item.idiom}"</span>
                              <button onClick={()=>speakWord(item.idiom)} style={{ background:T.speakBtn, border:"none", borderRadius:20, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12, color:T.speakBtnText, flexShrink:0 }}>🔈</button>
                            </div>
                            <div style={{ fontSize:13, color:T.textMuted, marginBottom:item.used_in?4:0 }}>{item.meaning}</div>
                            {item.used_in&&<div style={{ fontSize:12, color:T.textFaint, fontStyle:"italic" }}>In the story: "{item.used_in}"</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div style={{ textAlign:"center" }}>
                    <button onClick={()=>setTab("questions")} style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"11px 30px", color:T.accentText, cursor:"pointer", fontSize:14, fontWeight:600 }}>Answer questions →</button>
                  </div>
                </div>
              )}

              {/* QUESTIONS */}
              {tab==="questions" && (
                <div style={{ animation:"fadeUp 0.3s ease" }}>
                  <div style={{ marginBottom:22, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:13, color:T.textMuted, fontWeight:500 }}>Progress</span>
                      <span style={{ fontSize:13, color:T.accentText, fontWeight:700 }}>{answeredCount} / {totalQ}</span>
                    </div>
                    <div style={{ height:6, background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(answeredCount/(totalQ||1))*100}%`, background:`linear-gradient(90deg,${LVL.color},${T.accent})`, borderRadius:3, transition:"width 0.4s ease" }}/>
                    </div>
                  </div>

                  <div style={{ marginBottom:28 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div style={{ height:1, flex:1, background:T.accentBorder }}/>
                      <span style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:T.accentText, fontWeight:700, whiteSpace:"nowrap" }}>📖 Comprehension</span>
                      <div style={{ height:1, flex:1, background:T.accentBorder }}/>
                    </div>
                    <div style={{ display:"grid", gap:10 }}>
                      {content.questions?.map((q,i)=>q.type==="comprehension"?(
                        <QuestionCard key={i} q={q} i={i} T={T}
                          answer={answers[i]} setAnswer={v=>setAnswers(a=>({...a,[i]:v}))}
                          isSubmitted={!!submitted[i]}
                          onSubmit={()=>{ if(answers[i]?.trim()) setSubmitted(s=>({...s,[i]:true})); }}
                        />
                      ):null)}
                    </div>
                  </div>

                  <div style={{ marginBottom:28 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div style={{ height:1, flex:1, background:"rgba(244,114,182,0.3)" }}/>
                      <span style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#f472b6", fontWeight:700, whiteSpace:"nowrap" }}>💬 Discussion</span>
                      <div style={{ height:1, flex:1, background:"rgba(244,114,182,0.3)" }}/>
                    </div>
                    <div style={{ display:"grid", gap:10 }}>
                      {content.questions?.map((q,i)=>q.type==="discussion"?(
                        <QuestionCard key={i} q={q} i={i} T={T}
                          answer={answers[i]} setAnswer={v=>setAnswers(a=>({...a,[i]:v}))}
                          isSubmitted={!!submitted[i]}
                          onSubmit={()=>{ if(answers[i]?.trim()) setSubmitted(s=>({...s,[i]:true})); }}
                        />
                      ):null)}
                    </div>
                  </div>

                  {allDone && (
                    <div style={{ textAlign:"center", background:LVL.colorBg, border:`1px solid ${LVL.colorBorder}`, borderRadius:18, padding:"32px 20px" }}>
                      <div style={{ fontSize:38, marginBottom:10 }}>🎓</div>
                      <div style={{ fontSize:22, color:LVL.color, marginBottom:6, fontWeight:700 }}>Lesson complete!</div>
                      <div style={{ fontSize:14, color:T.textMuted, marginBottom:20 }}>Great job — all 15 questions answered!</div>
                      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                        <button onClick={regenerate} style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"11px 24px", color:T.accentText, cursor:"pointer", fontSize:14, fontWeight:600 }}>↻ New topic</button>
                        <button onClick={shareLink} style={{ background:copied?"rgba(34,197,94,0.12)":T.surfaceEl, border:`1px solid ${copied?"rgba(34,197,94,0.35)":T.border}`, borderRadius:10, padding:"11px 24px", color:copied?"#22c55e":T.textMuted, cursor:"pointer", fontSize:14, fontWeight:600, transition:"all 0.2s" }}>
                          {copied?"✓ Copied!":"🔗 Share this lesson"}
                        </button>
                        <button onClick={()=>switchLevel(level==="b1"?"b1plus":"b1")} style={{ background:LVL.colorBg, border:`1px solid ${LVL.colorBorder}`, borderRadius:10, padding:"11px 24px", color:LVL.color, cursor:"pointer", fontSize:14, fontWeight:600 }}>
                          {level==="b1"?"Try B1+ →":"← Try B1"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <footer style={{ marginTop:60, textAlign:"center" }}>
            <div style={{ fontSize:11, color:T.textFaintest, letterSpacing:"0.12em", fontWeight:500 }}>
              WORD & WORLD · {LVL.fullLabel.toUpperCase()} · {dateStr.toUpperCase()}
            </div>
          </footer>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width:5px; }
          ::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.15); border-radius:3px; }
          textarea, button { font-family:'Inter',sans-serif !important; }
        `}</style>
      </div>
    </>
  );
}