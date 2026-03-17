import { useState, useEffect, useCallback, useRef } from "react";

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
    tooltipBg: "#2a2520",
    tooltipBorder: "rgba(232,160,32,0.3)",
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
    tooltipBg: "#ffffff",
    tooltipBorder: "rgba(180,83,9,0.3)",
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
        console.log("error");
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

// ── Word Tooltip ─────────────────────────────────────────────────
function WordTooltip({ word, T, isDark, onClose }) {
  const [speaking, setSpeaking] = useState(false);
  if (!word) return null;
  const tc = TYPE_COLORS[isDark ? "dark" : "light"];
  const c = tc[word.type] || tc.noun;

  const handleSpeak = () => {
    setSpeaking(true);
    speakWord(word.word);
    setTimeout(() => setSpeaking(false), 1200);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: T.tooltipBg,
        borderTop: `2px solid ${T.accent}`,
        borderRadius: "16px 16px 0 0",
        padding: "20px 20px 32px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
        animation: "slideUp 0.22s ease",
      }}
    >
      {/* drag handle */}
      <div
        style={{
          width: 36,
          height: 3,
          borderRadius: 2,
          background: T.border,
          margin: "0 auto 18px",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: T.text,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {word.word}
          </span>
          <button
            onClick={handleSpeak}
            style={{
              background: speaking ? T.accentBg : T.speakBg,
              border: `1px solid ${speaking ? T.accentBorder : "transparent"}`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              color: T.speakText,
              transform: speaking ? "scale(1.15)" : "scale(1)",
              transition: "all 0.12s",
            }}
          >
            {speaking ? "🔊" : "🔈"}
          </button>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: c.accent,
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 4,
              padding: "3px 10px",
              fontWeight: 700,
            }}
          >
            {word.type}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            width: 34,
            height: 34,
            cursor: "pointer",
            color: T.textMuted,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {word.ipa && (
        <div
          style={{
            fontSize: 15,
            color: T.ipaColor,
            marginBottom: 10,
            fontFamily: "monospace",
            letterSpacing: "0.06em",
          }}
        >
          {word.ipa}
        </div>
      )}
      <div
        style={{
          fontSize: 17,
          color: T.text,
          lineHeight: 1.55,
          marginBottom: 10,
          fontWeight: 400,
        }}
      >
        {word.definition}
      </div>
      <div
        style={{
          fontSize: 15,
          color: T.textFaint,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        "{word.example}"
      </div>
    </div>
  );
}

// ── Clickable Story Text ─────────────────────────────────────────
function ClickableStory({ text, vocabulary, highlighted, T, onWordClick }) {
  if (!text) return null;

  // build a map of vocab words (lowercase) → item
  const vocabMap = {};
  (vocabulary || []).forEach((item) => {
    vocabMap[item.word.toLowerCase()] = item;
  });

  // split text into tokens (words + punctuation/spaces)
  const tokens = text.split(/(\s+|[.,!?;:"""''()\-–—])/);

  return (
    <span>
      {tokens.map((token, i) => {
        const clean = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
        const vocabItem = vocabMap[clean];
        const isHighlighted =
          highlighted && clean === highlighted.toLowerCase();

        if (vocabItem) {
          return (
            <span
              key={i}
              onClick={() => onWordClick(vocabItem)}
              style={{
                cursor: "pointer",
                borderBottom: `2px solid ${
                  isHighlighted ? "#fbbf24" : T.accent
                }`,
                background: isHighlighted
                  ? "rgba(251,191,36,0.15)"
                  : "transparent",
                borderRadius: 2,
                padding: "0 1px",
                transition: "background 0.15s",
              }}
            >
              {token}
            </span>
          );
        }
        if (isHighlighted && clean) {
          return (
            <mark
              key={i}
              style={{
                background: "#fde68a",
                color: "#1c1403",
                borderRadius: 2,
                padding: "0 2px",
              }}
            >
              {token}
            </mark>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </span>
  );
}
// ────────────────────────────────────────────────────────────────

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
        padding: "16px 18px",
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
          marginBottom: 8,
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 17,
              color: T.text,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
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
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.12s",
              color: T.speakText,
              fontSize: 14,
              transform: speaking ? "scale(1.2)" : "scale(1)",
            }}
          >
            {speaking ? "🔊" : "🔈"}
          </button>
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: c.accent,
            border: `1px solid ${c.border}`,
            background: c.bg,
            borderRadius: 4,
            padding: "3px 10px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            fontWeight: 700,
          }}
        >
          {item.type}
        </span>
      </div>
      {item.ipa && (
        <div
          style={{
            fontSize: 14,
            color: T.ipaColor,
            marginBottom: 8,
            fontFamily: "monospace",
            letterSpacing: "0.06em",
          }}
        >
          {item.ipa}
        </div>
      )}
      <div
        style={{
          fontSize: 15,
          color: T.textMuted,
          marginBottom: 6,
          lineHeight: 1.55,
        }}
      >
        {item.definition}
      </div>
      <div
        style={{
          fontSize: 14,
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

function QuestionCard({
  q,
  i,
  T,
  isDark,
  answer,
  setAnswer,
  isSubmitted,
  onSubmit,
}) {
  const isComp = q.type === "comprehension";
  return (
    <div
      style={{
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        padding: "18px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isComp ? T.accentText : T.idiomText,
            letterSpacing: "0.05em",
            minWidth: 24,
            paddingTop: 2,
          }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              color: T.text,
              lineHeight: 1.65,
              marginBottom: 6,
            }}
          >
            {q.question}
          </div>
          {q.hint && (
            <div
              style={{ fontSize: 13, color: T.textFaint, fontStyle: "italic" }}
            >
              ↳ {q.hint}
            </div>
          )}
        </div>
      </div>
      {isSubmitted ? (
        <div
          style={{
            marginLeft: 38,
            background: T.successBg,
            borderLeft: `2px solid ${T.successText}`,
            padding: "10px 16px",
            fontSize: 15,
            color: T.successText,
            lineHeight: 1.5,
            borderRadius: "0 6px 6px 0",
          }}
        >
          {answer}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginLeft: 38 }}>
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
              padding: "12px 14px",
              color: T.text,
              fontSize: 16,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s",
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
              padding: "0 16px",
              color: answer?.trim()
                ? isDark
                  ? "#1c1814"
                  : "#fff"
                : T.textFaint,
              cursor: answer?.trim() ? "pointer" : "default",
              fontSize: 18,
              alignSelf: "flex-end",
              height: 44,
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
  const [tooltipWord, setTooltipWord] = useState(null); // ← tooltip state

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [activeTopic, setActiveTopic] = useState(() => {
    const shared = getSharedContent();
    return shared?._topic || null;
  });
  const customTopicRef = useRef(null);
  const isSharedLesson = !!new URLSearchParams(window.location.search).get("c");

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // close tooltip on outside tap
  useEffect(() => {
    if (!tooltipWord) return;
    const handler = (e) => {
      if (
        !e.target.closest("[data-tooltip-root]") &&
        !e.target.closest("[data-vocab-word]")
      ) {
        setTooltipWord(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [tooltipWord]);

  const T = THEMES[isDark ? "dark" : "light"];
  const LVL = LEVELS[level];
  const lvlColor = isDark ? LVL.colorDark : LVL.color;
  const lvlBg = isDark ? LVL.colorBgDark : LVL.colorBg;
  const lvlBorder = isDark ? LVL.colorBorderDark : LVL.colorBorder;
  const DAILY_TOPIC = activeTopic || TOPICS[topicIndex];
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
    setTooltipWord(null);
    const topicToUse =
      customTopicRef.current || activeTopic || TOPICS[topicIndex];
    customTopicRef.current = null;
    try {
      const cacheKey = `ww_${level}_${DAILY_SEED}_${topicToUse}`;
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
                content: `Topic: "${topicToUse}". Seed: ${DAILY_SEED}. Return ONLY raw JSON.`,
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
      setContent({ ...parsed, _topic: topicToUse });
      setTimeout(() => setAppear(true), 50);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [DAILY_SEED, topicIndex, activeTopic, level, LVL]);

  useEffect(() => {
    if (!getSharedContent()) fetchContent();
  }, [fetchContent]);

  const regenerate = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setTopicIndex(Math.floor(Math.random() * TOPICS.length));
    setActiveTopic(null);
    setRegenCount((c) => c + 1);
  };

  const handleCustomTopicSubmit = (e) => {
    e.preventDefault();
    const val = customTopicInput.trim();
    if (!val) return;
    window.history.replaceState(null, "", window.location.pathname);
    customTopicRef.current = val;
    setActiveTopic(val);
    setCustomTopicInput("");
    setShowCustomInput(false);
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
    const topicForShare = content._topic || DAILY_TOPIC;
    const encoded = encodeContent({
      ...content,
      _topic: topicForShare,
      _level: level,
    });
    const url = `${window.location.origin}${window.location.pathname}?t=${topicIndex}&lvl=${level}&c=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
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
  const displayTopic = content?._topic || DAILY_TOPIC;

  const iconBtn = (onClick, children, opts = {}) => (
    <button
      onClick={onClick}
      style={{
        background: opts.active ? T.accentBg : "transparent",
        border: `1px solid ${opts.active ? T.accentBorder : T.border}`,
        borderRadius: 8,
        height: 40,
        padding: "0 14px",
        cursor: "pointer",
        fontSize: 14,
        color: opts.active ? T.accentText : T.textMuted,
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
        href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          fontFamily: "'Inter', sans-serif",
          color: T.text,
          transition: "background 0.3s, color 0.25s",
        }}
      >
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${T.accent} 0%, transparent 100%)`,
          }}
        />

        {/* no max-width on outer, padding only horizontal */}
        <div style={{ padding: "clamp(20px,4vw,40px) 0 120px" }}>
          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              padding: "0 clamp(12px, 3vw, 24px)",
            }}
          >
            {/* HEADER */}
            <header style={{ marginBottom: 36 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                      color: T.textFaint,
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    Daily English
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(28px, 6vw, 48px)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: 0.95,
                      color: T.text,
                    }}
                  >
                    Word{" "}
                    <span style={{ color: T.accent, fontStyle: "italic" }}>
                      &
                    </span>{" "}
                    World
                  </h1>
                </div>

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
                  {showCustomInput ? (
                    <form
                      onSubmit={handleCustomTopicSubmit}
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <input
                        autoFocus
                        value={customTopicInput}
                        onChange={(e) => setCustomTopicInput(e.target.value)}
                        placeholder="e.g. Hiking in Norway…"
                        style={{
                          background: T.inputBg,
                          border: `1px solid ${T.accentBorder}`,
                          borderRadius: 8,
                          height: 40,
                          padding: "0 14px",
                          color: T.text,
                          fontSize: 15,
                          outline: "none",
                          width: "clamp(150px, 22vw, 220px)",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!customTopicInput.trim()}
                        style={{
                          background: customTopicInput.trim()
                            ? T.accent
                            : T.surfaceEl,
                          border: "none",
                          borderRadius: 8,
                          height: 40,
                          padding: "0 16px",
                          color: customTopicInput.trim()
                            ? isDark
                              ? "#1c1814"
                              : "#fff"
                            : T.textFaint,
                          cursor: customTopicInput.trim()
                            ? "pointer"
                            : "default",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Go
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomTopicInput("");
                        }}
                        style={{
                          background: "transparent",
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          height: 40,
                          width: 40,
                          cursor: "pointer",
                          color: T.textMuted,
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      {iconBtn(() => setShowCustomInput(true), "✎ Own topic")}
                      <button
                        onClick={regenerate}
                        disabled={loading}
                        style={{
                          background: T.accent,
                          border: "none",
                          borderRadius: 8,
                          height: 40,
                          padding: "0 18px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: 14,
                          color: isDark ? "#1c1814" : "#fff",
                          fontWeight: 700,
                          opacity: loading ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            animation: loading
                              ? "spin 1s linear infinite"
                              : "none",
                          }}
                        >
                          ↻
                        </span>
                        New topic
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isSharedLesson && (
                <div
                  style={{
                    background: T.successBg,
                    borderLeft: `3px solid ${T.successText}`,
                    borderRadius: "0 8px 8px 0",
                    padding: "12px 18px",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: T.successText,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    Shared lesson
                  </div>
                  <div style={{ fontSize: 13, color: T.textFaint }}>
                    You and your partner are reading the exact same story and
                    questions.
                  </div>
                </div>
              )}

              {/* Level switcher */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {Object.values(LEVELS).map((lvl) => {
                  const active = level === lvl.id;
                  const lc = isDark ? lvl.colorDark : lvl.color;
                  const lb = isDark ? lvl.colorBgDark : lvl.colorBg;
                  const lborder = isDark
                    ? lvl.colorBorderDark
                    : lvl.colorBorder;
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
                        padding: "14px 18px",
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
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: active ? lc : T.textMuted,
                          }}
                        >
                          {lvl.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: active ? lc : T.textFaint,
                            fontWeight: 500,
                          }}
                        >
                          {lvl.fullLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
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
                    padding: "8px 18px",
                    background: T.surfaceEl,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: lvlColor,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: T.textFaint,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Topic
                  </span>
                  <span
                    style={{ fontSize: 15, color: T.text, fontWeight: 600 }}
                  >
                    {displayTopic}
                  </span>
                  {activeTopic && !isSharedLesson && (
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: T.accentBg,
                        color: T.accentText,
                        border: `1px solid ${T.accentBorder}`,
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontWeight: 700,
                      }}
                    >
                      custom
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: T.textFaint }}>
                  {dateStr}
                </span>
              </div>
            </header>

            {/* LOADING */}
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
                  <div style={{ position: "relative", width: 48, height: 48 }}>
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
                      fontSize: 15,
                      color: T.textFaint,
                      fontStyle: "italic",
                    }}
                  >
                    Crafting your {LVL.label} lesson…
                  </span>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.06)",
                  borderLeft: "3px solid #ef4444",
                  borderRadius: "0 8px 8px 0",
                  padding: "18px 22px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{ color: "#fca5a5", fontSize: 15, marginBottom: 12 }}
                >
                  {error}
                </div>
                <button
                  onClick={fetchContent}
                  style={{
                    background: "transparent",
                    border: `1px solid ${T.accentBorder}`,
                    borderRadius: 6,
                    padding: "8px 20px",
                    color: T.accentText,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* CONTENT */}
            {content && !loading && (
              <div
                style={{
                  opacity: appear ? 1 : 0,
                  transform: appear ? "none" : "translateY(8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
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
                      fontSize: 13,
                      color: lvlColor,
                      fontWeight: 700,
                      background: lvlBg,
                      border: `1px solid ${lvlBorder}`,
                      borderRadius: 4,
                      padding: "3px 12px",
                    }}
                  >
                    {LVL.fullLabel}
                  </span>
                  <span style={{ fontSize: 13, color: T.textFaint }}>
                    {LVL.description}
                  </span>
                </div>

                {/* Tabs */}
                <div
                  style={{
                    display: "flex",
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
                        padding: "12px 22px",
                        fontSize: 16,
                        fontWeight: tab === t ? 700 : 400,
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

                {/* STORY */}
                {tab === "story" && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <div
                      style={{
                        background: lvlBg,
                        borderLeft: `3px solid ${lvlColor}`,
                        borderRadius: "0 6px 6px 0",
                        padding: "12px 18px",
                        marginBottom: 24,
                        fontSize: 14,
                        color: lvlColor,
                        lineHeight: 1.5,
                      }}
                    >
                      {level === "b1"
                        ? "Read carefully. Tap any underlined word to see its meaning and hear pronunciation."
                        : "Notice how ideas connect between sentences. Tap underlined words to look them up."}
                    </div>

                    <div
                      style={{
                        fontSize: "clamp(17px, 2.8vw, 20px)",
                        lineHeight: 2.1,
                        color: T.storyText,
                        marginBottom: 32,
                        fontWeight: 400,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <ClickableStory
                        text={content.story}
                        vocabulary={content.vocabulary}
                        highlighted={highlighted}
                        T={T}
                        onWordClick={(vocabItem) => {
                          setTooltipWord(vocabItem);
                          speakWord(vocabItem.word);
                        }}
                      />
                    </div>

                    {content.idioms?.length > 0 && (
                      <div style={{ marginBottom: 32 }}>
                        <div
                          style={{
                            fontSize: 11,
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
                            gap: 10,
                          }}
                        >
                          {content.idioms.map((id, i) => (
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
                                  fontSize: 16,
                                  color: T.idiomText,
                                  fontStyle: "italic",
                                  marginBottom: 4,
                                  fontWeight: 500,
                                }}
                              >
                                "{id.idiom}"
                              </div>
                              <div
                                style={{ fontSize: 14, color: T.idiomMuted }}
                              >
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
                          padding: "12px 24px",
                          color: T.textMuted,
                          cursor: "pointer",
                          fontSize: 15,
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
                          padding: "12px 24px",
                          color: isDark ? "#1c1814" : "#fff",
                          cursor: "pointer",
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        Answer questions →
                      </button>
                    </div>
                  </div>
                )}

                {/* VOCABULARY */}
                {tab === "vocabulary" && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <div
                      style={{
                        fontSize: 12,
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
                        gap: 12,
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
                            fontSize: 11,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: T.textFaint,
                            marginBottom: 14,
                            fontWeight: 600,
                          }}
                        >
                          Idioms & Fixed Phrases
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {content.idioms.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                background: T.idiomBg,
                                borderLeft: `2px solid ${T.idiomText}`,
                                borderRadius: "0 8px 8px 0",
                                padding: "14px 18px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  marginBottom: 6,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 16,
                                    color: T.idiomText,
                                    fontStyle: "italic",
                                    fontWeight: 500,
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
                                    width: 28,
                                    height: 28,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    color: T.speakText,
                                    flexShrink: 0,
                                  }}
                                >
                                  🔈
                                </button>
                              </div>
                              <div
                                style={{
                                  fontSize: 15,
                                  color: T.textMuted,
                                  marginBottom: item.used_in ? 4 : 0,
                                }}
                              >
                                {item.meaning}
                              </div>
                              {item.used_in && (
                                <div
                                  style={{
                                    fontSize: 13,
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
                          padding: "12px 24px",
                          color: isDark ? "#1c1814" : "#fff",
                          cursor: "pointer",
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        Answer questions →
                      </button>
                    </div>
                  </div>
                )}

                {/* QUESTIONS */}
                {tab === "questions" && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 14, color: T.textFaint }}>
                        Progress
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          color: T.accentText,
                          fontWeight: 700,
                        }}
                      >
                        {answeredCount} / {totalQ}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
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

                    <div style={{ marginBottom: 32 }}>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: T.accentText,
                          marginBottom: 4,
                          fontWeight: 700,
                        }}
                      >
                        Comprehension
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.textFaint,
                          marginBottom: 16,
                        }}
                      >
                        Based on the story
                      </div>
                      {content.questions?.map((q, i) =>
                        q.type === "comprehension" ? (
                          <QuestionCard
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

                    <div style={{ marginBottom: 32 }}>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: T.idiomText,
                          marginBottom: 4,
                          fontWeight: 700,
                        }}
                      >
                        Discussion
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.textFaint,
                          marginBottom: 16,
                        }}
                      >
                        Your thoughts & experience
                      </div>
                      {content.questions?.map((q, i) =>
                        q.type === "discussion" ? (
                          <QuestionCard
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
                          padding: "40px 24px",
                          marginTop: 16,
                        }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 14 }}>🎓</div>
                        <div
                          style={{
                            fontSize: 28,
                            color: lvlColor,
                            marginBottom: 8,
                            fontWeight: 800,
                          }}
                        >
                          Lesson complete
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: T.textFaint,
                            marginBottom: 28,
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
                              padding: "12px 24px",
                              color: isDark ? "#1c1814" : "#fff",
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 700,
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
                              padding: "12px 24px",
                              color: copied ? T.successText : T.textMuted,
                              cursor: "pointer",
                              fontSize: 15,
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
                              padding: "12px 24px",
                              color: lvlColor,
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 700,
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
                  fontSize: 12,
                  color: T.textFaintest,
                  letterSpacing: "0.15em",
                  fontWeight: 600,
                }}
              >
                WORD & WORLD
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: T.textFaintest,
                  letterSpacing: "0.1em",
                }}
              >
                {LVL.fullLabel.toUpperCase()} · {dateStr.toUpperCase()}
              </span>
            </footer>
          </div>
        </div>

        {/* WORD TOOLTIP — bottom sheet */}
        {tooltipWord && (
          <div data-tooltip-root>
            {/* backdrop */}
            <div
              onClick={() => setTooltipWord(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 999,
                background: "rgba(0,0,0,0.3)",
              }}
            />
            <WordTooltip
              word={tooltipWord}
              T={T}
              isDark={isDark}
              onClose={() => setTooltipWord(null)}
            />
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.12); border-radius: 2px; }
          body { margin: 0; }
          textarea, button, input { font-family: 'Inter', sans-serif !important; }
          textarea::placeholder, input::placeholder { color: ${T.textFaint}; }
        `}</style>
      </div>
    </>
  );
}
