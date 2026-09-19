'use client';

import WeatherCard from './WeatherCard';
import { MessageRole, ToolPartType, WeatherOutput, WeatherInput } from './types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MessagePart {
  type: string;
  text?: string;
  toolCallId?: string;
  state?: string;
  output?: unknown;
  input?: unknown;
}

interface Message {
  id: string;
  role: string;
  parts: MessagePart[];
}

interface MessageBubbleProps {
  message: Message;
}

// ─── Tool Part Renderer ────────────────────────────────────────────────────────

function renderPart(part: MessagePart, index: number) {
  switch (part.type as ToolPartType) {
    case ToolPartType.Text:
      return (
        <span key={index} className="leading-relaxed whitespace-pre-wrap break-words">
          {part.text}
        </span>
      );

    case ToolPartType.GetWeather:
      return (
        <WeatherCard
          key={part.toolCallId ?? index}
          toolCallId={part.toolCallId ?? String(index)}
          state={part.state ?? ''}
          output={part.output as WeatherOutput | undefined}
          input={part.input as WeatherInput | undefined}
        />
      );

    default:
      return null;
  }
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === MessageRole.User;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          flex flex-col gap-1 p-4 rounded-2xl max-w-[80%] min-w-0
          ${isUser
            ? 'bg-zinc-900 text-white rounded-tr-sm shadow-md'
            : 'bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm shadow-sm'
          }
        `}
      >
        {/* Role label */}
        <span
          className={`text-[11px] font-semibold tracking-widest uppercase mb-1 ${
            isUser ? 'text-zinc-400' : 'text-indigo-400'
          }`}
        >
          {isUser ? 'You' : 'Nexus AI'}
        </span>

        {/* Parts */}
        <div className="space-y-1">
          {message.parts.map((part, i) => renderPart(part, i))}
        </div>
      </div>
    </div>
  );
}
