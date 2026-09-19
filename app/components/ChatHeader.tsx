'use client';

export default function ChatHeader() {
  return (
    <header className="flex items-center gap-3 px-6 py-4 bg-white border-b border-zinc-100 rounded-t-2xl">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a5 5 0 0 1 5 5c0 4-5 11-5 11S7 11 7 7a5 5 0 0 1 5-5z" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* Title block */}
      <div>
        <h1 className="text-base font-bold text-zinc-900 leading-tight">Nexus AI</h1>
        <p className="text-xs text-zinc-400">Generative UI · Tool Calling</p>
      </div>

      {/* Status indicator */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-zinc-400 font-medium">Online</span>
      </div>
    </header>
  );
}
