"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";

interface Message { role: "bot" | "user"; text: string; }

const RESPONSES: { keywords: string[]; reply: string }[] = [
  { keywords: ["property","listing","rent","sale","flat","room","house","shop","land"], reply: "Browse properties at /properties 🏠\n\nTo list your property, subscribe at /pricing." },
  { keywords: ["job","naukri","work","employment","vacancy"], reply: "Browse local jobs at /jobs 💼\n\nTo post a job, get a subscription at /pricing." },
  { keywords: ["price","cost","subscription","plan","fee","charge"], reply: "Plans start at ₹99/month! 💳\n\nSee all plans at /pricing." },
  { keywords: ["contact","help","support","problem","issue"], reply: "We're here to help! 🙏\n📧 yourmithila.official@gmail.com\n📱 WhatsApp: +91 70336 69971" },
  { keywords: ["register","account","signup","sign up","create"], reply: "Create your free account at /auth/register 🎉" },
  { keywords: ["otp","verify","verification","code"], reply: "Check your email for the 6-digit OTP. It expires in 10 minutes. ⏱️" },
  { keywords: ["login","sign in","password"], reply: "Login at /auth/login using your email or phone number. 🔐" },
  { keywords: ["madhubani","darbhanga","sitamarhi","mithila","bihar","area","region"], reply: "We cover the entire Mithila Region — Madhubani, Darbhanga, Sitamarhi, Muzaffarpur and surrounding areas! 📍" },
];

const QUICK_REPLIES = ["Find Property 🏠", "Find Job 💼", "Contact Support 📞"];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const { keywords, reply } of RESPONSES) {
    if (keywords.some(k => lower.includes(k))) return reply;
  }
  return "I'm here to help! 😊\n\nWhatsApp us at +91 70336 69971 or visit /faq for common questions.";
}

export function Chatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! 👋 Welcome to Your Mithila!\n\nHow can I help you today?" }
  ]);
  const [input,    setInput]    = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Listen for toggle events dispatched by the Navbar button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ open: boolean }>).detail;
      setOpen(detail.open);
    };
    window.addEventListener("ym-chat-toggle", handler);
    return () => window.removeEventListener("ym-chat-toggle", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setMessages(prev => [
      ...prev,
      { role: "user", text: msg },
      { role: "bot",  text: getBotReply(msg) },
    ]);
    setInput("");
  }

  if (!open) return null;

  return (
    /* Chat panel — fixed bottom-right, above mobile bottom nav */
    <div
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      style={{ height: "460px", background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ background: "#312E81" }}>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Your Mithila Assistant</p>
          <p className="text-indigo-200 text-xs">Online • How can I help?</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto text-white/70 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                m.role === "user" ? "text-white rounded-br-sm" : "rounded-bl-sm"
              }`}
              style={
                m.role === "user"
                  ? { background: "#312E81" }
                  : { background: "var(--surface-alt)", color: "var(--text-primary)" }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
        {QUICK_REPLIES.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs px-2.5 py-1 rounded-full border transition-colors"
            style={{ background: "var(--primary-light)", color: "var(--primary)", borderColor: "var(--border)" }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 text-xs rounded-xl px-3 py-2 outline-none"
          style={{ border: "1px solid var(--border)", background: "var(--surface-alt)", color: "var(--text-primary)" }}
        />
        <button
          onClick={() => send()}
          className="w-8 h-8 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          style={{ background: "#312E81" }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
