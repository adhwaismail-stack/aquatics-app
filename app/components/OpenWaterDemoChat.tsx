"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  placeholder?: string;
  suggestedQuestions: string[];
};

export default function OpenWaterDemoChat(props: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim() || loading || limitReached) return;
    setError(null);
    setMessages(function (prev) { return prev.concat([{ role: "user", content: question }]); });
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, discipline: "open-water" }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.answer) {
        setMessages(function (prev) { return prev.concat([{ role: "assistant", content: data.answer }]); });
      }

      if (typeof data.questionsRemaining === "number") {
        setQuestionsRemaining(data.questionsRemaining);
      }

      if (data.limitReached) {
        setLimitReached(true);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="max-w-2xl">
      {messages.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 space-y-5 max-h-96 overflow-y-auto">
          {messages.map(function (msg, i) {
            return (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-cite text-xs bg-aqua-pool text-white">
                  {msg.role === "user" ? "U" : "AR"}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-aqua-paper/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-aqua-pool text-white flex items-center justify-center font-cite text-xs">AR</div>
              <div className="flex-1 pt-2 text-aqua-paper/50 text-sm">Thinking...</div>
            </div>
          )}
        </div>
      )}

      {limitReached ? (
        <div className="bg-white/5 border border-aqua-pool/30 rounded-lg p-8 text-center">
          <div className="font-cite text-xs tracking-widest text-aqua-pool mb-3">FREE TRIAL USED</div>
          <h3 className="font-display text-2xl mb-3">Sign up to keep asking.</h3>
          <p className="text-aqua-paper/70 text-sm mb-6 max-w-sm mx-auto">
            Free plan includes 5 questions per month. Pro plan unlocks unlimited questions across all 8 disciplines.
          </p>
          <a href="/signup" className="inline-block px-6 py-3 rounded-full bg-aqua-pool text-white font-medium text-sm hover:bg-aqua-pool-deep">
            Sign up free
          </a>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={function (e) { setInput(e.target.value); }}
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-aqua-paper outline-none focus:border-aqua-pool disabled:opacity-50"
                placeholder={props.placeholder || "Ask anything about Open Water Swimming rules..."}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 h-11 rounded-full bg-aqua-pool text-white flex items-center justify-center disabled:opacity-30 hover:bg-aqua-pool-deep font-medium text-sm"
              >
                Send
              </button>
            </div>
            {error && <p className="text-aqua-flag text-xs mt-3 font-cite">{error}</p>}
          </form>

          {messages.length === 0 && (
            <div className="mt-6">
              <div className="font-cite text-xs text-aqua-paper/50 tracking-widest uppercase mb-3">Try one of these</div>
              <div className="flex flex-wrap gap-2">
                {props.suggestedQuestions.map(function (q, i) {
                  return (
                    <button
                      key={i}
                      onClick={function () { ask(q); }}
                      disabled={loading}
                      className="border border-white/20 text-aqua-paper/85 px-4 py-2 rounded-full text-sm hover:border-aqua-pool disabled:opacity-50"
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {questionsRemaining !== null && (
            <div className="mt-5 font-cite text-xs text-aqua-paper/50 tracking-widest">
              {questionsRemaining} FREE QUESTION{questionsRemaining === 1 ? "" : "S"} REMAINING
            </div>
          )}
        </>
      )}
    </div>
  );
}