import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [mode, setMode] = useState("text");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message && !file) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message || file?.name },
    ]);

    setLoading(true);

    try {
      let url = `${API}/${mode}`;
      let options = { method: "POST" };

      if (mode === "text") {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({ prompt: message });
      } else {
        const fd = new FormData();
        fd.append("file", file);
        options.body = fd;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      const reply =
        mode === "text"
          ? data.output
          : mode === "image"
          ? data.description
          : data.transcript;

      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
      setMessage("");
      setFile(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Something went wrong, try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
      <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_60px_rgba(99,102,241,0.25)] flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🤖 Multi-Modal GenAI Agent
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Text · Image · Audio powered by Hugging Face
          </p>
        </header>

        {/* CHAT AREA */}
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-300">
              <p className="text-2xl mb-2">✨ Start a conversation</p>
              <p>Ask anything or upload image / audio</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xl px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "ml-auto bg-gradient-to-r from-indigo-500 to-blue-600"
                  : "mr-auto bg-white/20"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-300">AI soch raha hai… 🤔</div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="p-5 border-t border-white/10 bg-black/30">
          {/* MODE SWITCH */}
          <div className="flex gap-2 mb-4">
            {["text", "image", "audio"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  mode === m
                    ? "bg-indigo-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex gap-3 items-center">
            {mode === "text" ? (
              <input
                className="flex-1 bg-white/10 rounded-xl px-4 py-3 outline-none placeholder-gray-300"
                placeholder="Message your AI..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            ) : (
              <input
                type="file"
                className="flex-1 text-sm text-gray-300"
                onChange={(e) => setFile(e.target.files[0])}
              />
            )}

            <button
              onClick={send}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
