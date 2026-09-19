'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { ChatStatus } from './components/types';
import ChatHeader from './components/ChatHeader';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';


function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-3xl shadow-inner">
        🌤️
      </div>
      <p className="text-zinc-400 text-sm font-medium text-center max-w-xs">
        Ask about the weather in any city and Nexus AI will fetch it for you.
      </p>
    </div>
  );
}

// ─── Thinking Indicator ────────────────────────────────────────────────────────

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 bg-white border border-zinc-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
        <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400">
          Nexus AI
        </span>
        <div className="flex gap-1 ml-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isLoading =
    status === ChatStatus.Streaming || status === ChatStatus.Submitted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-zinc-200 bg-white">
        {/* Header */}
        <ChatHeader />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-[420px] max-h-[60vh] p-5 space-y-4 bg-zinc-50">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} message={m as never} />
            ))
          )}
          {isLoading && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </main>
  );
}