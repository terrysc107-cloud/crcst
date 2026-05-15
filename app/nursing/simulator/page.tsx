"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NursingNav from "@/components/nursing/NursingNav";
import { Send, ArrowLeft, RotateCcw, Activity } from "lucide-react";

const ROSE = "#E02B4B";
const ROSE_2 = "#f06074";
const ROSE_GLOW = "rgba(224,43,75,0.25)";

const VITALS = [
  { label: "HR", value: "114" },
  { label: "BP", value: "88/52" },
  { label: "SpO₂", value: "92%" },
  { label: "LOC", value: "A&Ox1" },
  { label: "UO", value: "120/8h" },
];

const INITIAL_MESSAGE =
  "You've entered Room 412B. Mrs. Maria Gonzalez (68F, POD #2 — right hip replacement) is flushed and diaphoretic. She responds to your voice but can only state her name. Her family is at the doorway: \"She seems confused — not like herself.\" Current vitals: HR 114, BP 88/52, T 38.9°C, RR 24, SpO₂ 92% RA, UO 120 mL/8hrs. What is your first nursing action?";

type Message = {
  role: "user" | "sim";
  content: string;
};

export default function SimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "sim", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setIsLoading(true);

    try {
      const apiMessages = updated.map((m) => ({
        role: m.role === "sim" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/nursing/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "sim", content: data.response || "No response from simulation." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "sim", content: "The simulation encountered a connection error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleReset = () => {
    setMessages([{ role: "sim", content: INITIAL_MESSAGE }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="bg-navy text-white" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <NursingNav />

      {/* Fixed header bar */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b border-white/8 flex items-center justify-between"
        style={{ paddingTop: "4.5rem", background: "rgba(13,27,42,0.98)" }}
      >
        <Link
          href="/nursing/cases"
          className="flex items-center gap-1.5 text-white/40 text-sm font-mono hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Cases</span>
        </Link>

        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 flex-shrink-0" style={{ color: ROSE }} />
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Maria Gonzalez</p>
            <p className="text-white/35 text-[0.65rem] font-mono">68F · POD #2 · Med-Surg 412B</p>
          </div>
          <div className="hidden sm:flex gap-1.5 ml-2">
            {VITALS.map((v) => (
              <div
                key={v.label}
                className="text-center px-2 py-1 rounded-lg"
                style={{ background: "rgba(224,43,75,0.10)" }}
              >
                <p className="font-mono text-[0.5rem] text-white/40 uppercase">{v.label}</p>
                <p className="font-mono text-[0.7rem] font-bold" style={{ color: ROSE_2 }}>
                  {v.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-white/35 text-xs font-mono hover:text-white/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "sim" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-mono text-[0.58rem] font-bold"
                  style={{
                    background: "rgba(224,43,75,0.15)",
                    border: "1px solid rgba(224,43,75,0.30)",
                    color: ROSE_2,
                  }}
                >
                  SIM
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "sim" ? "border border-white/8 bg-white/[0.04] text-white/75" : "text-white"
                }`}
                style={msg.role === "user" ? { background: "rgba(224,43,75,0.20)" } : undefined}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-mono text-[0.58rem] font-bold bg-white/10 text-white/60">
                  RN
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[0.58rem] font-bold"
                style={{
                  background: "rgba(224,43,75,0.15)",
                  border: "1px solid rgba(224,43,75,0.30)",
                  color: ROSE_2,
                }}
              >
                SIM
              </div>
              <div className="rounded-xl px-4 py-3 border border-white/8 bg-white/[0.04]">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"
                      style={{ animationDelay: `${i * 180}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type your nursing action… e.g., 'I apply 2L O₂ via nasal cannula and call rapid response.'"
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-rose/40 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  input.trim() && !isLoading
                    ? `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`
                    : "rgba(255,255,255,0.08)",
                boxShadow: input.trim() && !isLoading ? `0 4px 12px ${ROSE_GLOW}` : undefined,
              }}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-white/20 text-[0.65rem] font-mono mt-2 text-center">
            AI simulation · Educational use only · Not a substitute for clinical training
          </p>
        </div>
      </div>
    </div>
  );
}
