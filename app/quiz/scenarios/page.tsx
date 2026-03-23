"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { scenarioQuestions, type ScenarioQuestion } from "@/lib/questions-scenarios";

export default function ScenariosQuizPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    new Array(scenarioQuestions.length).fill(null)
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const q = scenarioQuestions[current];
  const progress = ((current + 1) / scenarioQuestions.length) * 100;
  const hasAnswered = answers[current] !== null;
  const isCorrect = hasAnswered && answers[current] === q.correct;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const selectAnswer = (letter: "a" | "b" | "c" | "d") => {
    if (hasAnswered) return;
    const newAnswers = [...answers];
    newAnswers[current] = letter;
    setAnswers(newAnswers);
    setShowExplanation(true);

    // Silent question attempts tracking
    supabase.from("question_attempts").insert({
      user_id: user?.id ?? null,
      question_id: q.id,
      cert: "scenarios",
      was_correct: letter === q.correct,
      selected_answer: letter,
    }).then(() => {});
  };

  const handleNext = () => {
    if (current < scenarioQuestions.length - 1) {
      setCurrent(current + 1);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setShowExplanation(answers[current - 1] !== null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-teal font-mono">Loading...</div>
      </div>
    );
  }

  if (quizComplete) {
    const correct = answers.filter(
      (a, i) => a === scenarioQuestions[i].correct
    ).length;
    const percentage = Math.round((correct / scenarioQuestions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-2 to-navy">
        {/* Header */}
        <header className="bg-navy/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-teal-3 hover:text-white transition">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="font-serif text-3xl text-navy mb-2">
              Scenarios Complete!
            </h1>
            <p className="text-text-3 mb-6">
              You answered {correct} of {scenarioQuestions.length} scenarios correctly.
            </p>

            <div className="text-5xl font-serif text-teal mb-2">{percentage}%</div>
            <div className="text-sm text-text-3 mb-8">Overall Score</div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-cream-2 text-text rounded-lg font-mono hover:bg-cream transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  setCurrent(0);
                  setAnswers(new Array(scenarioQuestions.length).fill(null));
                  setShowExplanation(false);
                  setQuizComplete(false);
                }}
                className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-2 to-navy">
      {/* Header */}
      <header className="bg-navy/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-teal-3 hover:text-white transition">
            ← Exit
          </Link>
          <div className="text-amber font-mono text-sm">
            🧠 SITUATIONAL JUDGMENT
          </div>
          <div className="text-teal-3 font-mono text-sm">
            {current + 1} / {scenarioQuestions.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-navy-2 px-6 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="w-full h-1 bg-navy-3 rounded overflow-hidden">
            <div
              className="h-full bg-amber transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Domain & Type badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-teal/20 text-teal rounded-full text-xs font-mono">
            {q.domain}
          </span>
          <span className="px-3 py-1 bg-amber/20 text-amber rounded-full text-xs font-mono uppercase">
            {q.type}
          </span>
          <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-xs font-mono">
            {q.difficulty}
          </span>
        </div>

        {/* Context block (if exists) */}
        {q.context && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            color: "rgba(255,255,255,0.72)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}>
            <span style={{ display: "block", color: "#E8A020", fontSize: "0.68rem", fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", marginBottom: "0.5rem", fontStyle: "normal" }}>
              SCENARIO
            </span>
            {q.context}
          </div>
        )}

        {/* Question text */}
        <div className="font-serif text-xl text-white mb-6 leading-relaxed">
          {q.question}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {(["a", "b", "c", "d"] as const).map((letter) => {
            const opt = q.options[letter];
            let optionClass =
              "w-full text-left px-4 py-3 rounded-lg border-2 transition font-mono text-sm";

            if (showExplanation) {
              if (letter === q.correct) {
                optionClass += " border-correct bg-correct/20 text-correct";
              } else if (letter === answers[current] && letter !== q.correct) {
                optionClass += " border-wrong bg-wrong/20 text-wrong";
              } else {
                optionClass += " border-white/10 text-white/40";
              }
            } else {
              if (answers[current] === letter) {
                optionClass += " border-amber bg-amber/10 text-white";
              } else {
                optionClass += " border-white/20 hover:border-amber text-white/80";
              }
            }

            return (
              <button
                key={letter}
                onClick={() => selectAnswer(letter)}
                disabled={showExplanation}
                className={optionClass}
              >
                <span className="inline-block w-6 h-6 rounded-full bg-white/10 text-center text-xs leading-6 mr-3 uppercase">
                  {letter}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              isCorrect ? "bg-correct/20 border border-correct" : "bg-wrong/20 border border-wrong"
            }`}
          >
            <div className="font-mono text-sm font-bold mb-2 text-white">
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </div>
            <div className="text-sm leading-relaxed text-white/80 mb-4">{q.explanation}</div>

            {/* Real World Note */}
            {q.realWorldNote && (
              <div style={{
                marginTop: "1rem",
                background: "rgba(232,160,32,0.06)",
                border: "1px solid rgba(232,160,32,0.2)",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
              }}>
                <p style={{ color: "#E8A020", fontSize: "0.68rem", fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                  IN PRACTICE
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", lineHeight: 1.65, fontStyle: "italic" }}>
                  {q.realWorldNote}
                </p>
              </div>
            )}

            {/* Standard Reference */}
            {q.standardRef && (
              <div className="mt-3 text-xs text-white/40 font-mono">
                📖 {q.standardRef}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-mono disabled:opacity-30 hover:bg-white/20 transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!showExplanation}
            className="px-6 py-3 bg-amber text-navy rounded-lg font-mono hover:bg-amber/90 disabled:opacity-50 transition"
          >
            {current === scenarioQuestions.length - 1 ? "Finish" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
