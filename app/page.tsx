'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // 'role' aur 'content' hata kar sirf 'text' pass karein
    sendMessage({ text: input }); 
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nexus AI</h1>
        <p className="text-sm text-gray-500">Streaming UI with Vercel AI SDK</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 p-4 border rounded-xl bg-gray-50 shadow-sm">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-20">Start a conversation with Nexus AI...</p>
        )}
        
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`p-4 rounded-xl max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-black text-white ml-auto rounded-tr-none' 
                : 'bg-white border text-gray-800 mr-auto rounded-tl-none shadow-sm'
            }`}
          >
            <strong className="block text-xs opacity-60 mb-1">
              {m.role === 'user' ? 'You' : 'Nexus AI'}
            </strong>
            {/* m.content ko is block se replace karein */}
  {m.parts.map((part, index) => (
    part.type === 'text' ? <span key={index}>{part.text}</span> : null
  ))}
          </div>
        ))}
        {isLoading && <div className="text-sm text-gray-500 animate-pulse ml-2">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}