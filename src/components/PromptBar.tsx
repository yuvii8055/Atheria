import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, Image as ImageIcon, CornerDownLeft, Zap, BrainCircuit, Globe } from 'lucide-react';
import { GeminiChatModel, ChatRolePersona } from '../types.ts';
import { MODEL_DETAILS } from '../utils/personas.ts';

interface PromptBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedModel: GeminiChatModel;
  setSelectedModel: (model: GeminiChatModel) => void;
  activePersona: ChatRolePersona;
  onSwitchToImagine: () => void;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  onSendMessage,
  isLoading,
  selectedModel,
  setSelectedModel,
  activePersona,
  onSwitchToImagine,
}) => {
  const [promptText, setPromptText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [promptText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() || isLoading) return;

    onSendMessage(promptText.trim());
    setPromptText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const models: GeminiChatModel[] = [
    'gemini-3.1-pro-preview',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
  ];

  return (
    <div className="sticky bottom-0 z-20 w-full px-4 pb-4 pt-2">
      <div className="max-w-4xl mx-auto">
        {/* Outer Glow Glass Container */}
        <div className="relative rounded-2xl glass-panel-elevated border border-white/15 p-2 sm:p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] focus-within:border-cyan-400/50 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
          {/* Main Textarea Input */}
          <div className="flex items-start gap-2">
            <textarea
              ref={textareaRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activePersona.name} anything, or draft complex queries... (Shift+Enter for newline)`}
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-2 py-1.5 focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-[180px]"
            />

            {/* Kinetic Submit Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={!promptText.trim() || isLoading}
              data-cursor="action"
              data-cursor-text="Send"
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                promptText.trim() && !isLoading
                  ? 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar: Model Selector Pills & Mode Quick Action */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-[11px] font-mono-code text-slate-400 mr-1 hidden sm:inline">
                Model:
              </span>
              {models.map((m) => {
                const meta = MODEL_DETAILS[m];
                const isSelected = selectedModel === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    data-cursor="pointer"
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? `${meta.badgeColor} shadow-[0_0_10px_rgba(6,182,212,0.15)]`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        m === 'gemini-3.1-pro-preview'
                          ? 'bg-purple-400'
                          : m === 'gemini-3.5-flash'
                          ? 'bg-cyan-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span>{meta.name}</span>
                    <span className="text-[10px] opacity-75 hidden md:inline">({meta.tag})</span>
                  </button>
                );
              })}
            </div>

            {/* Imagine Studio Switcher Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onSwitchToImagine}
                data-cursor="pointer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 text-[11px] font-medium transition-colors"
                title="Switch to 4K Image Studio"
              >
                <ImageIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Imagine Studio (4K)</span>
                <span className="sm:hidden">Imagine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
