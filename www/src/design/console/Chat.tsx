/* Personas chat — pick Abi / Abbey / Aviva and send a message.
   Replies are canned but written in each persona's documented voice.
   Abi (cyan) routes & moderates; Abbey (emerald) scaffolds with metaphor;
   Aviva (violet) is blunt and dense. */
import { useEffect, useRef, useState } from "react";
import { IFlow, ISend, ISpark, IZap, type IconComponent } from "./Icons.tsx";

type PersonaName = "Abi" | "Abbey" | "Aviva";

interface Persona {
  color: string;
  hex: string;
  role: string;
  Icon: IconComponent;
}

const PEOPLE: Record<PersonaName, Persona> = {
  Abi: { color: "var(--persona-abi)", hex: "#22d3ee", role: "Adaptive Moderator", Icon: IFlow },
  Abbey: { color: "var(--persona-abbey)", hex: "#34d399", role: "Empathic Polymath", Icon: ISpark },
  Aviva: { color: "var(--persona-aviva)", hex: "#a855f7", role: "Unfiltered Expert", Icon: IZap },
};

const PERSONA_NAMES: PersonaName[] = ["Abi", "Abbey", "Aviva"];

const REPLIES: Record<PersonaName, string[]> = {
  Abi: [
    "Routing this to Abbey — it reads as a learning question with a little frustration.",
    "Got it. I'll keep the answer balanced and hand off if it gets specialized.",
    "Classifying intent: setup + best-practice. Here's the neutral version first.",
  ],
  Abbey: [
    "Think of a vector database as a library that files books by meaning, not title. WDBX builds that index with HNSW, then chains every write so the history can't be quietly rewritten.",
    "Totally reasonable to find this fuzzy at first. Start with the picture: similar things sit close together in space; search just walks toward the nearest neighbors.",
    "Here's the gentle version, then the precise one — tell me where to stop.",
  ],
  Aviva: [
    "Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done.",
    "Don't shard below 10M vectors — overhead outweighs parallelism. Re-evaluate at 50M.",
    "Chain the writes with SHA-256, verify on read, reject on mismatch. No exceptions.",
  ],
};

interface AvatarProps {
  who: PersonaName;
  size?: number;
}

function Avatar({ who, size = 30 }: AvatarProps) {
  const p = PEOPLE[who];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#06121a",
        fontWeight: 700,
        background: p.color,
        boxShadow: `0 0 16px -2px ${p.hex}`,
      }}
    >
      <p.Icon s={size * 0.5} />
    </div>
  );
}

type Message = { from: "user"; text: string } | { from: "bot"; who: PersonaName; text: string };

function Bubble({ msg }: { msg: Message }) {
  if (msg.from === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            maxWidth: "78%",
            background: "var(--action)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "16px 16px 4px 16px",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  const p = PEOPLE[msg.who];
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Avatar who={msg.who} />
      <div style={{ maxWidth: "78%" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: p.color }}>{msg.who}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>{p.role}</span>
        </div>
        <div
          style={{
            background: "var(--surface-3)",
            border: `1px solid ${p.hex}33`,
            color: "var(--text)",
            padding: "10px 14px",
            borderRadius: "4px 16px 16px 16px",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const [who, setWho] = useState<PersonaName>("Abi");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([
    { from: "bot", who: "Abi", text: "Ask anything. I'll answer or route you to Abbey or Aviva." },
  ]);
  const idx = useRef<Record<PersonaName, number>>({ Abi: 0, Abbey: 0, Aviva: 0 });
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const s = scroller.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const pool = REPLIES[who];
    const reply = pool[idx.current[who] % pool.length] ?? "";
    idx.current[who]++;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setText("");
    setTimeout(() => setMsgs((m) => [...m, { from: "bot", who, text: reply }]), 380);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* persona switch */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {PERSONA_NAMES.map((k) => {
          const p = PEOPLE[k];
          const on = k === who;
          return (
            <button
              key={k}
              onClick={() => setWho(k)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: "var(--radius-pill)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                color: on ? p.color : "var(--text-dim)",
                background: on ? `${p.hex}1f` : "transparent",
                border: `1px solid ${on ? p.hex + "55" : "var(--hair)"}`,
                transition: "all var(--dur-fast) var(--ease-out)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: on ? `0 0 8px ${p.hex}` : "none",
                }}
              />
              {k}
            </button>
          );
        })}
      </div>
      {/* transcript */}
      <div
        ref={scroller}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingRight: 4,
          minHeight: 0,
        }}
      >
        {msgs.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
      </div>
      {/* composer */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: "var(--surface-1)",
          border: "1px solid var(--hair)",
          borderRadius: "var(--radius-lg)",
          padding: "8px 8px 8px 16px",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={`Message ${who}…`}
          style={{
            flex: 1,
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--text)",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
          }}
        />
        <button
          onClick={send}
          aria-label="Send"
          style={{
            width: 38,
            height: 38,
            borderRadius: "var(--radius-md)",
            border: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background: "linear-gradient(180deg,#3b82f6,#2563eb)",
            boxShadow: "0 6px 16px -6px rgba(59,130,246,0.8)",
          }}
        >
          <ISend s={17} />
        </button>
      </div>
    </div>
  );
}
