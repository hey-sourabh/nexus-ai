'use client';

import { useState } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        alert(`${file.name} uploaded and processed successfully! Now you can ask questions about it.`);
      } else {
        alert("Failed to upload PDF.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-3 p-4 bg-white border-t border-zinc-100 rounded-b-2xl items-center"
    >
      <label className={`cursor-pointer flex items-center justify-center px-4 py-3 rounded-xl transition-all border ${isUploading || disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}>
        {isUploading ? '...' : '📄'}
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={handleFileUpload} 
          disabled={isUploading || disabled}
        />
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask about the weather in any city…"
        disabled={disabled}
        className="
          flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm
          rounded-xl px-4 py-3 placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-50 transition-all
        "
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="
          bg-indigo-600 hover:bg-indigo-700 active:scale-95
          text-white text-sm font-semibold px-6 py-3 rounded-xl
          disabled:opacity-40 transition-all duration-150 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-400
        "
      >
        Send
      </button>
    </form>
  );
}
