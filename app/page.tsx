"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Turn = {
  role: "user" | "model";
  text: string;
  ts: number;
};



function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function NovelAI() {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const sidebarImageSrc = "/to-all-the-boys.webp";

  const fillFromImage = () => {
    setMessage(`lets talk about "To All The Boys I've Loved Before"`);
    setSidebarOpen(false);
  };

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, loading]);

  const historyForApi = useMemo(
    () =>
      turns.slice(-12).map((t) => ({
        role: t.role,
        text: t.text,
      })),
    [turns]
  );

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;

    setLoading(true);
    setError("");

    const now = Date.now();
    setTurns((prev) => [...prev, { role: "user", text: clean, ts: now }]);
    setMessage("");

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: historyForApi,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "The archive failed to respond.");
        setLoading(false);
        return;
      }

      setTurns((prev) => [
        ...prev,
        { role: "model", text: String(data.text ?? ""), ts: Date.now() },
      ]);
      setLoading(false);
    } catch {
      setError("The archive failed to respond.");
      setLoading(false);
    }
  };


  const Sidebar = () => (
    <aside className="h-full rounded-2xl border border-zinc-200 bg-white/85 backdrop-blur p-6 shadow-[0_20px_80px_rgba(0,0,0,0.10)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-amber-600 font-serif text-3xl tracking-wide">
            LIBRIS
          </div>
          <div className="text-sm text-zinc-600 mt-1">
            Literary companion • analysis • theories • vibes
          </div>
        </div>
        <div className="text-xs text-zinc-500 border border-zinc-200 rounded-full px-3 py-1 bg-white">
          beta
        </div>
      </div>

      {/* Clickable image card */}
      <button
        type="button"
        onClick={fillFromImage}
        className="mt-6 w-full text-left rounded-2xl overflow-hidden border border-zinc-200 bg-white hover:shadow-md transition"
      >
        <div className="relative">
          <img
            src={sidebarImageSrc}
            alt="Featured book"
            className="w-full h-90 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-white text-sm font-semibold">
              Tap to start a chat
            </div>
            <div className="text-white/90 text-xs mt-0.5">
              To All the Boys I’ve Loved Before
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="text-sm text-zinc-800 font-medium">
            Start with this prompt
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            Auto-fills your message box with a discussion starter.
          </div>
        </div>
      </button>

      <div className="mt-6 space-y-3">
        <div className="text-xs uppercase tracking-wider text-zinc-500">
          Quick starts
        </div>



        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-zinc-800">
          <div className="font-medium text-amber-800">Tip</div>
          <div className="text-zinc-700 mt-1">
            Ask for interpretations, motivations, and “what-if” scenarios.
            Libris avoids direct book quotes.
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          {/* Hamburger only on mobile */}
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="text-xl leading-none">☰</span>
          </button>

          <div className="flex-1">
            <div className="text-sm text-zinc-700">The Archive</div>
            <div className="text-xs text-zinc-500">
              Discuss novels, characters, themes.
            </div>
          </div>

          <button
            onClick={() => setTurns([])}
            className="text-xs text-zinc-600 hover:text-zinc-900 transition border border-zinc-200 rounded-xl px-3 py-2 bg-white"
          >
            Clear chat
          </button>
        </div>
      </div>

   
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close overlay"
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] p-4">
            <div className="h-full">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-zinc-600">Menu</div>
                <button
                  className="h-10 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition"
                  onClick={() => setSidebarOpen(false)}
                >
                  Close
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      
          <div className="hidden lg:block">
            <Sidebar />
          </div>

   
          <section className="rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur shadow-[0_20px_80px_rgba(0,0,0,0.10)] overflow-hidden">
        
            <div
              ref={listRef}
              className="px-5 sm:px-6 py-5 h-[62vh] lg:h-[70vh] overflow-y-auto"
            >
              {turns.length === 0 ? (
                <div className="max-w-xl mt-10">
                  <div className="text-2xl font-serif text-amber-700">
                    Enter a title, a character, or a feeling.
                  </div>
                  <div className="text-zinc-600 mt-2">
                    Example: “Why do morally grey characters feel comforting?”
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {turns.map((t, idx) => {
                    const isUser = t.role === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[90%] sm:max-w-[80%]">
                          <div
                            className={[
                              "rounded-2xl px-4 py-3 text-[15px] leading-relaxed border",
                              isUser
                                ? "bg-amber-50 border-amber-200 text-zinc-900"
                                : "bg-white border-zinc-200 text-zinc-900",
                            ].join(" ")}
                          >
                            <p className="whitespace-pre-wrap">{t.text}</p>
                          </div>
                          <div
                            className={`mt-1 text-[11px] text-zinc-500 ${
                              isUser ? "text-right" : "text-left"
                            }`}
                          >
                            {formatTime(t.ts)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] sm:max-w-[80%]">
                        <div className="rounded-2xl px-4 py-3 border border-zinc-200 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-400 animate-pulse" />
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:150ms]" />
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:300ms]" />
                            <span className="text-sm text-zinc-600 ml-2">
                              Consulting the Archive…
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer input */}
            <div className="border-t border-zinc-200 p-4 sm:p-5">
              {error && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex-1 flex">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Ask Libris… (Shift+Enter for new line)'
                    className="w-full h-12 max-h-40 bg-white text-zinc-900 border border-zinc-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(message);
                      }
                    }}
                  />
                  
                </div>

                <button
                  onClick={() => send(message)}
                  disabled={loading || !message.trim()}
                  className="h-12 px-5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-zinc-300 disabled:text-zinc-600 transition"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                    Try: “Analyse this character’s arc”, “Explain symbolism”, “What if…”
                  </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
