import { useState, useEffect, useCallback } from "react";

const TOPICS = [
  "Urban exploration",
  "Street food culture",
  "Tech startups",
  "Wildlife conservation",
  "Underground music scenes",
  "Space tourism",
  "Vintage fashion",
  "Coffee culture",
  "Digital nomads",
  "Extreme sports",
  "Artisan crafts",
  "Smart cities",
  "Ocean mysteries",
  "Film festivals",
  "Urban farming",
  "Cybersecurity",
  "Ancient civilizations",
  "Street art",
  "Mindfulness movement",
  "Food science",
  "Travel photography",
  "Local markets",
  "Language learning",
  "Architecture",
  "Sustainable living",
  "Music production",
  "Cooking traditions",
  "Social media",
  "Artificial intelligence in daily life",
  "Remote work culture",
  "Mental health awareness",
  "Electric vehicles",
  "Short-form video content",
  "Minimalism and decluttering",
  "Plant-based diets",
  "Cryptocurrency and Web3",
  "Climate anxiety",
  "Quiet quitting and work-life balance",
  "Influencer economy",
  "Gig economy workers",
  "Fast fashion vs slow fashion",
  "Neurodiversity in the workplace",
  "Sleep optimization",
  "Solo travel",
  "Fitness technology",
  "Online learning platforms",
  "Home automation and smart devices",
  "True crime obsession",
  "Reality TV culture",
  "Thrift shopping",
  "Escape rooms and puzzle culture",
  "Gaming and esports",
  "Podcasting boom",
  "Digital detox",
  "Wellness tourism",
  "Urban nightlife transformation",
  "Food delivery culture",
  "Volunteering abroad",
  "Zero waste lifestyle",
  "Freelancing and side hustles",
  "Streaming wars",
  "Pop-up experiences",
  "Retro gaming nostalgia",
];

const today = new Date();
const DAILY_SEED_BASE = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
const DEFAULT_TOPIC_INDEX =
  (today.getDate() + today.getMonth() * 31) % TOPICS.length;

const LEVELS = {
  b1: {
    id: "b1",
    label: "B1",
    fullLabel: "B1 Intermediate",
    color: "#16a34a",
    colorDark: "#4ade80",
    colorBg: "rgba(22,163,74,0.08)",
    colorBgDark: "rgba(74,222,128,0.07)",
    colorBorder: "rgba(22,163,74,0.25)",
    colorBorderDark: "rgba(74,222,128,0.2)",
    description: "Simple sentences · Common words · Basic idioms",
    prompt: `You are an English language teacher creating content for B1 (intermediate) level learners.
B1 guidelines:
- Use common, everyday vocabulary — words learners encounter regularly
- Short to medium sentences; avoid complex structures
- Tenses: present simple, past simple, present perfect, future with will/going to
- Avoid subjunctive
- Story: 400-460 words, very clear narrative, short paragraphs
- Vocabulary: words a B1 student needs to know — not too easy, not too advanced
- Idioms: only the most common everyday idioms
Generate ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "story": "400-460 word story at B1 level",
  "vocabulary": [{"word": "word","ipa": "/IPA/","definition": "very simple definition","example": "simple example","type": "noun or verb or adjective or phrasal verb"}],
  "idioms": [{"idiom": "idiom","meaning": "simple explanation","used_in": "quote from story"}],
  "questions": [{"question": "question","type": "comprehension or discussion","hint": "hint"}]
}
Rules: 10-12 vocabulary items · 3-4 idioms · exactly 15 questions (first 7 comprehension, last 8 discussion)`,
  },
  b1plus: {
    id: "b1plus",
    label: "B1+",
    fullLabel: "B1+ Upper Intermediate",
    color: "#b45309",
    colorDark: "#fbbf24",
    colorBg: "rgba(180,83,9,0.08)",
    colorBgDark: "rgba(251,191,36,0.07)",
    colorBorder: "rgba(180,83,9,0.25)",
    colorBorderDark: "rgba(251,191,36,0.2)",
    description: "Varied sentences · Richer vocabulary · Natural idioms",
    prompt: `You are an English language teacher creating content for B1+ (upper-intermediate) level learners.
B1+ guidelines:
- Mix simple and compound sentences; relative clauses, "although", "despite" are fine
- Vocabulary: richer than B1 — include some collocations and multi-word verbs
- Tenses: all B1 tenses plus present perfect continuous, past continuous, conditionals type 1 & 2
- Story: 460-500 words, engaging with descriptive language
Generate ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "story": "460-500 word story at B1+ level",
  "vocabulary": [{"word": "word","ipa": "/IPA/","definition": "definition","example": "natural example","type": "noun or verb or adjective or phrasal verb"}],
  "idioms": [{"idiom": "idiom","meaning": "explanation","used_in": "quote from story"}],
  "questions": [{"question": "question","type": "comprehension or discussion","hint": "hint"}]
}
Rules: 12-14 vocabulary items · 4-5 idioms · exactly 15 questions (first 7 comprehension, last 8 discussion)`,
  },
};

const TYPE_COLORS = {
  dark: {
    noun: {
      accent: "#4ade80",
      bg: "rgba(74,222,128,0.08)",
      border: "rgba(74,222,128,0.2)",
    },
    verb: {
      accent: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
      border: "rgba(96,165,250,0.2)",
    },
    adjective: {
      accent: "#f472b6",
      bg: "rgba(244,114,182,0.08)",
      border: "rgba(244,114,182,0.2)",
    },
    "phrasal verb": {
      accent: "#c084fc",
      bg: "rgba(192,132,252,0.08)",
      border: "rgba(192,132,252,0.2)",
    },
  },
  light: {
    noun: {
      accent: "#15803d",
      bg: "rgba(22,163,74,0.07)",
      border: "rgba(22,163,74,0.18)",
    },
    verb: {
      accent: "#1d4ed8",
      bg: "rgba(29,78,216,0.07)",
      border: "rgba(29,78,216,0.18)",
    },
    adjective: {
      accent: "#be185d",
      bg: "rgba(190,24,93,0.07)",
      border: "rgba(190,24,93,0.18)",
    },
    "phrasal verb": {
      accent: "#7e22ce",
      bg: "rgba(126,34,206,0.07)",
      border: "rgba(126,34,206,0.18)",
    },
  },
};

const THEMES = {
  dark: {
    bg: "#141210",
    surface: "#1d1a17",
    surfaceEl: "#252119",
    surfaceElHover: "#2d2920",
    border: "rgba(255,255,255,0.07)",
    borderStrong: "rgba(255,255,255,0.13)",
    text: "#f0ebe3",
    textMuted: "#9c9280",
    textFaint: "#5c5448",
    textFaintest: "#302c28",
    accent: "#e8a020",
    accentText: "#f5bb4a",
    accentBg: "rgba(232,160,32,0.1)",
    accentBorder: "rgba(232,160,32,0.28)",
    tabActiveText: "#f5bb4a",
    tabText: "#5c5448",
    idiomBg: "rgba(244,114,182,0.06)",
    idiomBorder: "rgba(244,114,182,0.15)",
    idiomText: "#f472b6",
    idiomMuted: "#6b5f62",
    successBg: "rgba(74,222,128,0.06)",
    successBorder: "rgba(74,222,128,0.18)",
    successText: "#4ade80",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.08)",
    storyText: "#c8bfb0",
    ipaColor: "#7a8fba",
    speakBg: "rgba(232,160,32,0.12)",
    speakText: "#f5bb4a",
  },
  light: {
    bg: "#faf7f2",
    surface: "#ffffff",
    surfaceEl: "#f4f0e8",
    surfaceElHover: "#ece7dc",
    border: "rgba(0,0,0,0.07)",
    borderStrong: "rgba(0,0,0,0.14)",
    text: "#1c1814",
    textMuted: "#5c5040",
    textFaint: "#a09080",
    textFaintest: "#d4ccc0",
    accent: "#b45309",
    accentText: "#92400e",
    accentBg: "rgba(180,83,9,0.07)",
    accentBorder: "rgba(180,83,9,0.22)",
    tabActiveText: "#92400e",
    tabText: "#a09080",
    idiomBg: "rgba(190,24,93,0.05)",
    idiomBorder: "rgba(190,24,93,0.14)",
    idiomText: "#9d174d",
    idiomMuted: "#9e8890",
    successBg: "rgba(22,163,74,0.06)",
    successBorder: "rgba(22,163,74,0.18)",
    successText: "#15803d",
    inputBg: "rgba(0,0,0,0.025)",
    inputBorder: "rgba(0,0,0,0.09)",
    storyText: "#2d2620",
    ipaColor: "#4a6090",
    speakBg: "rgba(180,83,9,0.09)",
    speakText: "#92400e",
  },
};

function getSharedContent() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("c");
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function encodeContent(content) {
  return btoa(encodeURIComponent(JSON.stringify(content)));
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const m = clean.match(/\{[\s\S]*\}/);
    if (m)
      try {
        return JSON.parse(m[0]);
      } catch {
        console.log('error')
      }
  }
  return null;
}

function speakWord(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  utt.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((v) => v.lang === "en-US" && v.localService) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en"));
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

function VocabCard({ item, active, T, isDark, onHighlight }) {
  const [speaking, setSpeaking] = useState(false);
  const tc = TYPE_COLORS[isDark ? "dark" : "light"];
  const c = tc[item.type] || tc.noun;

  const handleSpeak = (e) => {
    e.stopPropagation();
    setSpeaking(true);
    speakWord(item.word);
    setTimeout(() => setSpeaking(false), 1200);
  };

  return (
    <div
      onClick={() => onHighlight(item.word)}
      style={{
        background: active ? T.accentBg : T.surface,
        border: `1px solid ${active ? T.accentBorder : T.border}`,
        borderLeft: `3px solid ${active ? T.accent : c.accent}`,
        borderRadius: "0 10px 10px 0",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = T.borderStrong;
        e.currentTarget.style.borderLeftColor = c.accent;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = active ? T.accentBorder : T.border;
        e.currentTarget.style.borderLeftColor = active ? T.accent : c.accent;
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          <span
            style={{
              fontSize: 15,
              color: T.text,
              fontWeight: 600,
              fontFamily: "'Fraunces', serif",
            }}
          >
            {item.word}
          </span>
          <button
            onClick={handleSpeak}
            style={{
              background: speaking ? T.accentBg : T.speakBg,
              border: "none",
              borderRadius: "50%",
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.12s",
              color: T.speakText,
              fontSize: 12,
              transform: speaking ? "scale(1.2)" : "scale(1)",
            }}
          >
            {speaking ? "🔊" : "🔈"}
          </button>
        </div>
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: c.accent,
            border: `1px solid ${c.border}`,
            background: c.bg,
            borderRadius: 4,
            padding: "2px 8px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          }}
        >
          {item.type}
        </span>
      </div>
      {item.ipa && (
        <div
          style={{
            fontSize: 12,
            color: T.ipaColor,
            marginBottom: 6,
            fontFamily: "monospace",
            letterSpacing: "0.06em",
          }}
        >
          {item.ipa}
        </div>
      )}
      <div
        style={{
          fontSize: 13,
          color: T.textMuted,
          marginBottom: 4,
          lineHeight: 1.55,
        }}
      >
        {item.definition}
      </div>
      <div
        style={{
          fontSize: 12,
          color: T.textFaint,
          fontStyle: "italic",
          lineHeight: 1.4,
        }}
      >
        "{item.example}"
      </div>
    </div>
  );
}

function QuestionCard({ q, i, T, isDark, answer, setAnswer, isSubmitted, onSubmit }) {  const isComp = q.type === "comprehension";
  return (
    <div
      style={{
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        padding: "16px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isComp ? T.accentText : T.idiomText,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.05em",
            minWidth: 22,
            paddingTop: 2,
          }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "clamp(13px, 2.3vw, 15px)",
              color: T.text,
              lineHeight: 1.65,
              marginBottom: 4,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {q.question}
          </div>
          {q.hint && (
            <div
              style={{ fontSize: 11, color: T.textFaint, fontStyle: "italic" }}
            >
              ↳ {q.hint}
            </div>
          )}
        </div>
      </div>
      {isSubmitted ? (
        <div
          style={{
            marginLeft: 36,
            background: T.successBg,
            borderLeft: `2px solid ${T.successText}`,
            padding: "9px 14px",
            fontSize: 13,
            color: T.successText,
            lineHeight: 1.5,
            borderRadius: "0 6px 6px 0",
          }}
        >
          {answer}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginLeft: 36 }}>
          <textarea
            value={answer || ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here…"
            rows={2}
            style={{
              flex: 1,
              background: T.inputBg,
              border: `1px solid ${T.inputBorder}`,
              borderRadius: 8,
              padding: "10px 13px",
              color: T.text,
              fontSize: 13,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s",
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.5,
            }}
            onFocus={(e) => (e.target.style.borderColor = T.accentBorder)}
            onBlur={(e) => (e.target.style.borderColor = T.inputBorder)}
          />
          <button
            onClick={onSubmit}
            style={{
              background: answer?.trim() ? T.accent : "transparent",
              border: `1px solid ${answer?.trim() ? T.accent : T.border}`,
              borderRadius: 8,
              padding: "0 14px",
              color: answer?.trim()
                ? isDark
                  ? "#1c1814"
                  : "#fff"
                : T.textFaint,
              cursor: answer?.trim() ? "pointer" : "default",
              fontSize: 15,
              alignSelf: "flex-end",
              height: 40,
              transition: "all 0.15s",
              flexShrink: 0,
              fontWeight: 700,
            }}
          >
            ✓
          </button>
        </div>
      )}
    </div>
  );
}

// expose isDark to QuestionCard — wrap
function QuestionCardWrapper(props) {
  return <QuestionCard {...props} />;
}

export default function WordAndWorld() {
  const [isDark, setIsDark] = useState(true);
  const [level, setLevel] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("lvl") === "b1plus" ? "b1plus" : "b1";
  });
  const [topicIndex, setTopicIndex] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("t");
    if (t !== null && !isNaN(t) && Number(t) < TOPICS.length) return Number(t);
    return DEFAULT_TOPIC_INDEX;
  });
  const [content, setContent] = useState(() => getSharedContent());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("story");
  const [highlighted, setHighlighted] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [appear, setAppear] = useState(() => !!getSharedContent());
  const [regenCount, setRegenCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const isSharedLesson = !!new URLSearchParams(window.location.search).get("c");

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const T = THEMES[isDark ? "dark" : "light"];
  const LVL = LEVELS[level];
  const lvlColor = isDark ? LVL.colorDark : LVL.color;
  const lvlBg = isDark ? LVL.colorBgDark : LVL.colorBg;
  const lvlBorder = isDark ? LVL.colorBorderDark : LVL.colorBorder;
  const DAILY_TOPIC = TOPICS[topicIndex];
  const DAILY_SEED = `${DAILY_SEED_BASE}-${regenCount}-${level}`;

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAppear(false);
    setContent(null);
    setAnswers({});
    setSubmitted({});
    setHighlighted(null);
    setTab("story");
    try {
      const cacheKey = `ww_${level}_${DAILY_SEED}_${topicIndex}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setContent(JSON.parse(cached));
        setTimeout(() => setAppear(true), 50);
        setLoading(false);
        return;
      }
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 3500,
            messages: [
              { role: "system", content: LVL.prompt },
              {
                role: "user",
                content: `Topic: "${DAILY_TOPIC}". Seed: ${DAILY_SEED}. Return ONLY raw JSON.`,
              },
            ],
          }),
        }
      );
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJSON(raw);
      if (!parsed) throw new Error("Could not parse response. Please retry.");
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      setContent(parsed);
      setTimeout(() => setAppear(true), 50);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [DAILY_SEED, topicIndex, DAILY_TOPIC, level, LVL]);

  useEffect(() => {
    if (!getSharedContent()) fetchContent();
  }, [fetchContent]);

  const regenerate = () => {
    window.history.replaceState(null, "", window.location.pathname);
    const newIdx = Math.floor(Math.random() * TOPICS.length);
    setTopicIndex(newIdx);
    setRegenCount((c) => c + 1);
  };

  const switchLevel = (newLevel) => {
    if (newLevel === level) return;
    window.history.replaceState(null, "", window.location.pathname);
    setLevel(newLevel);
    setRegenCount(0);
  };

  const shareLink = () => {
    if (!content) return;
    const encoded = encodeContent({
      ...content,
      _topic: DAILY_TOPIC,
      _level: level,
    });
    const url = `${window.location.origin}${window.location.pathname}?t=${topicIndex}&lvl=${level}&c=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const renderHighlighted = (text) => {
    if (!highlighted || !text) return text;
    const esc = highlighted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.split(new RegExp(`(${esc})`, "gi")).map((p, i) =>
      p.toLowerCase() === highlighted.toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: "#fde68a",
            color: "#1c1403",
            borderRadius: 2,
            padding: "0 2px",
          }}
        >
          {p}
        </mark>
      ) : (
        p
      )
    );
  };

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const allDone =
    content &&
    content.questions?.length > 0 &&
    Object.keys(submitted).length >= content.questions.length;
  const answeredCount = Object.keys(submitted).length;
  const totalQ = content?.questions?.length || 0;
  const sharedTopic = content?._topic || DAILY_TOPIC;

  const iconBtn = (onClick, children, opts = {}) => (
    <button
      onClick={onClick}
      style={{
        background: opts.active ? T.accentBg : "transparent",
        border: `1px solid ${opts.active ? T.accentBorder : T.border}`,
        borderRadius: 8,
        height: 36,
        padding: "0 12px",
        cursor: "pointer",
        fontSize: 13,
        color: opts.active ? T.accentText : T.textMuted,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s",
        ...opts.style,
      }}
    >
      {children}
    </button>
  );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          fontFamily: "'Outfit', sans-serif",
          color: T.text,
          transition: "background 0.3s, color 0.25s",
        }}
      >
        {/* thin top accent line */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${T.accent} 0%, transparent 100%)`,
          }}
        />

        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "clamp(24px,5vw,48px) clamp(20px,4vw,28px) 120px",
          }}
        >
          {/* ── HEADER ── */}
          <header style={{ marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {/* Logo */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: T.textFaint,
                    marginBottom: 10,
                    fontWeight: 500,
                  }}
                >
                  Daily English
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Fraunces', serif",
                    fontSize: "clamp(32px, 7vw, 52px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 0.95,
                    color: T.text,
                  }}
                >
                  Word{" "}
                  <span style={{ fontStyle: "italic", color: T.accent }}>
                    &
                  </span>{" "}
                  World
                </h1>
              </div>

              {/* Controls */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {iconBtn(
                  () => setIsDark((d) => !d),
                  isDark ? "☀ Light" : "☾ Dark"
                )}
                {iconBtn(shareLink, copied ? "✓ Copied" : "↗ Share", {
                  active: copied,
                  style: {
                    opacity: content ? 1 : 0.4,
                    pointerEvents: content ? "auto" : "none",
                  },
                })}
                <button
                  onClick={regenerate}
                  disabled={loading}
                  style={{
                    background: T.accent,
                    border: "none",
                    borderRadius: 8,
                    height: 36,
                    padding: "0 16px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 13,
                    color: isDark ? "#1c1814" : "#fff",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "opacity 0.15s",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      animation: loading ? "spin 1s linear infinite" : "none",
                    }}
                  >
                    ↻
                  </span>
                  New topic
                </button>
              </div>
            </div>

            {/* Shared banner */}
            {isSharedLesson && (
              <div
                style={{
                  background: T.successBg,
                  borderLeft: `3px solid ${T.successText}`,
                  borderRadius: "0 8px 8px 0",
                  padding: "10px 16px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: T.successText,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  Shared lesson
                </div>
                <div style={{ fontSize: 12, color: T.textFaint }}>
                  You and your partner are reading the exact same story and
                  questions.
                </div>
              </div>
            )}

            {/* Level switcher */}
            <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
              {Object.values(LEVELS).map((lvl) => {
                const active = level === lvl.id;
                const lc = isDark ? lvl.colorDark : lvl.color;
                const lb = isDark ? lvl.colorBgDark : lvl.colorBg;
                const lborder = isDark ? lvl.colorBorderDark : lvl.colorBorder;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => switchLevel(lvl.id)}
                    style={{
                      flex: "1 1 160px",
                      border: `1px solid ${active ? lborder : T.border}`,
                      borderTop: active
                        ? `3px solid ${lc}`
                        : `3px solid transparent`,
                      borderRadius: 8,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: active ? lb : T.surface,
                      transition: "all 0.18s",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: active ? lc : T.textMuted,
                          fontFamily: "'Fraunces', serif",
                        }}
                      >
                        {lvl.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: active ? lc : T.textFaint,
                          fontWeight: 500,
                        }}
                      >
                        {lvl.fullLabel}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: active ? lc : T.textFaint,
                        opacity: 0.85,
                        lineHeight: 1.4,
                      }}
                    >
                      {lvl.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Topic + date row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 16px",
                  background: T.surfaceEl,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: lvlColor,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: T.textFaint,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Topic
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: T.text,
                    fontFamily: "'Fraunces', serif",
                    fontStyle: "italic",
                  }}
                >
                  {sharedTopic}
                </span>
              </div>
              <span style={{ fontSize: 12, color: T.textFaint }}>
                {dateStr}
              </span>
            </div>
          </header>

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div style={{ position: "relative", width: 44, height: 44 }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: `1.5px solid ${T.border}`,
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "1.5px solid transparent",
                      borderTopColor: T.accent,
                      borderRadius: "50%",
                      animation: "spin 0.9s linear infinite",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: T.textFaint,
                    fontStyle: "italic",
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  Crafting your {LVL.label} lesson…
                </span>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.06)",
                borderLeft: "3px solid #ef4444",
                borderRadius: "0 8px 8px 0",
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 10 }}>
                {error}
              </div>
              <button
                onClick={fetchContent}
                style={{
                  background: "transparent",
                  border: `1px solid ${T.accentBorder}`,
                  borderRadius: 6,
                  padding: "7px 18px",
                  color: T.accentText,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* ── CONTENT ── */}
          {content && !loading && (
            <div
              style={{
                opacity: appear ? 1 : 0,
                transform: appear ? "none" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              {/* level strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: lvlColor,
                    fontWeight: 600,
                    background: lvlBg,
                    border: `1px solid ${lvlBorder}`,
                    borderRadius: 4,
                    padding: "2px 10px",
                  }}
                >
                  {LVL.fullLabel}
                </span>
                <span style={{ fontSize: 12, color: T.textFaint }}>
                  {LVL.description}
                </span>
              </div>

              {/* Tabs — underline style */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  marginBottom: 28,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {[
                  ["story", "Story"],
                  ["vocabulary", "Words"],
                  ["questions", "Questions"],
                ].map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "10px 20px",
                      fontSize: 14,
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: tab === t ? 600 : 400,
                      color: tab === t ? T.accentText : T.tabText,
                      borderBottom: `2px solid ${
                        tab === t ? T.accent : "transparent"
                      }`,
                      marginBottom: -1,
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── STORY ── */}
              {tab === "story" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  <div
                    style={{
                      background: lvlBg,
                      borderLeft: `3px solid ${lvlColor}`,
                      borderRadius: "0 6px 6px 0",
                      padding: "10px 16px",
                      marginBottom: 24,
                      fontSize: 12,
                      color: lvlColor,
                    }}
                  >
                    {level === "b1"
                      ? "Read carefully. Understand the main idea first, then read for details."
                      : "Notice how ideas connect between sentences. Pay attention to structure."}
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(16px, 2.5vw, 18px)",
                      lineHeight: 2,
                      color: T.storyText,
                      marginBottom: 32,
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {highlighted
                      ? renderHighlighted(content.story)
                      : content.story}
                  </div>

                  {content.idioms?.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: T.textFaint,
                          marginBottom: 14,
                          fontWeight: 600,
                        }}
                      >
                        Idioms in this story
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                          gap: 8,
                        }}
                      >
                        {content.idioms.map((id, i) => (
                          <div
                            key={i}
                            style={{
                              background: T.idiomBg,
                              borderLeft: `2px solid ${T.idiomText}`,
                              borderRadius: "0 8px 8px 0",
                              padding: "10px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                color: T.idiomText,
                                fontFamily: "'Fraunces', serif",
                                fontStyle: "italic",
                                marginBottom: 3,
                              }}
                            >
                              "{id.idiom}"
                            </div>
                            <div style={{ fontSize: 12, color: T.idiomMuted }}>
                              {id.meaning}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      paddingTop: 16,
                      borderTop: `1px solid ${T.border}`,
                    }}
                  >
                    <button
                      onClick={() => setTab("vocabulary")}
                      style={{
                        background: "transparent",
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "10px 22px",
                        color: T.textMuted,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Study words →
                    </button>
                    <button
                      onClick={() => setTab("questions")}
                      style={{
                        background: T.accent,
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 22px",
                        color: isDark ? "#1c1814" : "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Answer questions →
                    </button>
                  </div>
                </div>
              )}

              {/* ── VOCABULARY ── */}
              {tab === "vocabulary" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textFaint,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 18,
                      fontWeight: 600,
                    }}
                  >
                    🔈 Tap speaker to hear · tap card to highlight in story ·{" "}
                    {content.vocabulary?.length} words
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
                      gap: 10,
                      marginBottom: 36,
                    }}
                  >
                    {content.vocabulary?.map((item, i) => (
                      <VocabCard
                        key={i}
                        item={item}
                        T={T}
                        isDark={isDark}
                        active={highlighted === item.word}
                        onHighlight={(word) => {
                          setHighlighted(highlighted === word ? null : word);
                          if (highlighted !== word) setTab("story");
                        }}
                      />
                    ))}
                  </div>

                  {content.idioms?.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: T.textFaint,
                          marginBottom: 14,
                          fontWeight: 600,
                        }}
                      >
                        Idioms & Fixed Phrases
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {content.idioms.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              background: T.idiomBg,
                              borderLeft: `2px solid ${T.idiomText}`,
                              borderRadius: "0 8px 8px 0",
                              padding: "12px 16px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 14,
                                  color: T.idiomText,
                                  fontFamily: "'Fraunces', serif",
                                  fontStyle: "italic",
                                }}
                              >
                                "{item.idiom}"
                              </span>
                              <button
                                onClick={() => speakWord(item.idiom)}
                                style={{
                                  background: T.speakBg,
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 24,
                                  height: 24,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: 11,
                                  color: T.speakText,
                                  flexShrink: 0,
                                }}
                              >
                                🔈
                              </button>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: T.textMuted,
                                marginBottom: item.used_in ? 3 : 0,
                              }}
                            >
                              {item.meaning}
                            </div>
                            {item.used_in && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: T.textFaint,
                                  fontStyle: "italic",
                                }}
                              >
                                "{item.used_in}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      paddingTop: 16,
                      borderTop: `1px solid ${T.border}`,
                    }}
                  >
                    <button
                      onClick={() => setTab("questions")}
                      style={{
                        background: T.accent,
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 22px",
                        color: isDark ? "#1c1814" : "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Answer questions →
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUESTIONS ── */}
              {tab === "questions" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  {/* Progress */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: T.textFaint }}>
                      Progress
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: T.accentText,
                        fontWeight: 600,
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {answeredCount} / {totalQ}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: T.border,
                      borderRadius: 2,
                      marginBottom: 32,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(answeredCount / (totalQ || 1)) * 100}%`,
                        background: T.accent,
                        borderRadius: 2,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Comprehension section */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: T.accentText,
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      Comprehension
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textFaint,
                        marginBottom: 16,
                      }}
                    >
                      Based on the story
                    </div>
                    {content.questions?.map((q, i) =>
                      q.type === "comprehension" ? (
                        <QuestionCardWrapper
                          key={i}
                          q={q}
                          i={i}
                          T={T}
                          isDark={isDark}
                          answer={answers[i]}
                          setAnswer={(v) =>
                            setAnswers((a) => ({ ...a, [i]: v }))
                          }
                          isSubmitted={!!submitted[i]}
                          onSubmit={() => {
                            if (answers[i]?.trim())
                              setSubmitted((s) => ({ ...s, [i]: true }));
                          }}
                        />
                      ) : null
                    )}
                  </div>

                  {/* Discussion section */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: T.idiomText,
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      Discussion
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textFaint,
                        marginBottom: 16,
                      }}
                    >
                      Your thoughts & experience
                    </div>
                    {content.questions?.map((q, i) =>
                      q.type === "discussion" ? (
                        <QuestionCardWrapper
                          key={i}
                          q={q}
                          i={i}
                          T={T}
                          isDark={isDark}
                          answer={answers[i]}
                          setAnswer={(v) =>
                            setAnswers((a) => ({ ...a, [i]: v }))
                          }
                          isSubmitted={!!submitted[i]}
                          onSubmit={() => {
                            if (answers[i]?.trim())
                              setSubmitted((s) => ({ ...s, [i]: true }));
                          }}
                        />
                      ) : null
                    )}
                  </div>

                  {allDone && (
                    <div
                      style={{
                        textAlign: "center",
                        background: lvlBg,
                        border: `1px solid ${lvlBorder}`,
                        borderRadius: 12,
                        padding: "36px 24px",
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: 42,
                          marginBottom: 12,
                        }}
                      >
                        🎓
                      </div>
                      <div
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: 26,
                          color: lvlColor,
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Lesson complete
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: T.textFaint,
                          marginBottom: 24,
                        }}
                      >
                        All 15 questions answered. Well done.
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={regenerate}
                          style={{
                            background: T.accent,
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 22px",
                            color: isDark ? "#1c1814" : "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          ↻ New topic
                        </button>
                        <button
                          onClick={shareLink}
                          style={{
                            background: "transparent",
                            border: `1px solid ${T.border}`,
                            borderRadius: 8,
                            padding: "10px 22px",
                            color: copied ? T.successText : T.textMuted,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {copied ? "✓ Copied!" : "↗ Share this lesson"}
                        </button>
                        <button
                          onClick={() =>
                            switchLevel(level === "b1" ? "b1plus" : "b1")
                          }
                          style={{
                            background: lvlBg,
                            border: `1px solid ${lvlBorder}`,
                            borderRadius: 8,
                            padding: "10px 22px",
                            color: lvlColor,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {level === "b1" ? "Try B1+" : "Try B1"} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <footer
            style={{
              marginTop: 80,
              paddingTop: 24,
              borderTop: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: T.textFaintest,
                letterSpacing: "0.15em",
                fontWeight: 500,
              }}
            >
              WORD & WORLD
            </span>
            <span
              style={{
                fontSize: 11,
                color: T.textFaintest,
                letterSpacing: "0.1em",
              }}
            >
              {LVL.fullLabel.toUpperCase()} · {dateStr.toUpperCase()}
            </span>
          </footer>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.12); border-radius: 2px; }
          textarea, button, input { font-family: 'Outfit', sans-serif !important; }
          textarea::placeholder { color: ${T.textFaint}; }
        `}</style>
      </div>
    </>
  );
}
