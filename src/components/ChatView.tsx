import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Bot,
  User,
  Clock,
  Code2,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Flame,
  Cpu,
} from 'lucide-react';
import { ChatMessage, ChatRolePersona, GeminiChatModel } from '../types.ts';
import { MODEL_DETAILS } from '../utils/personas.ts';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activePersona: ChatRolePersona;
  selectedModel: GeminiChatModel;
  onSendPrompt: (prompt: string) => void;
  onOpenImageModal?: (imageUrl: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  activePersona,
  selectedModel,
  onSendPrompt,
  onOpenImageModal,
}) => {
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterSparks = [
    {
      title: 'Distributed System Architecture',
      prompt: 'Design a resilient event-driven CQRS microservices architecture with Kafka, Redis, and event sourcing. Diagram the flow and state management.',
      model: 'gemini-3.1-pro-preview',
      tag: 'Complex Reasoning',
    },
    {
      title: 'Avant-Garde Sci-Fi Scene',
      prompt: 'Write a gripping cyber-noir vignette about an AI restorer who discovers an encrypted memory shard inside an orbital megastructure.',
      model: 'gemini-3.5-flash',
      tag: 'Creative Writing',
    },
    {
      title: 'High-Performance Matrix Ops',
      prompt: 'Write an optimized TypeScript implementation of a SIMD-friendly 4x4 matrix multiplication with unit tests and benchmark tips.',
      model: 'gemini-3.1-flash-lite',
      tag: 'Instant Code',
    },
    {
      title: 'Quantum Decoherence Mechanics',
      prompt: 'Explain environmental quantum decoherence and pointer states intuitively, contrasting them with the Copenhagen collapse postulate.',
      model: 'gemini-3.1-pro-preview',
      tag: 'Deep Science',
    },
  ];

  // Helper to render markdown-like content cleanly
  const renderMessageContent = (content: string) => {
    // Split into code blocks and normal paragraphs
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      // Preceding text
      if (matchIndex > lastIndex) {
        const textSegment = content.substring(lastIndex, matchIndex);
        parts.push(renderFormattedText(textSegment, `text-${lastIndex}`));
      }

      const lang = match[1] || 'code';
      const code = match[2];
      const blockId = `code-${matchIndex}`;

      parts.push(
        <div key={blockId} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-xl">
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 text-[11px] font-mono-code text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Code2 className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </span>
            <button
              onClick={() => handleCopy(blockId, code)}
              data-cursor="pointer"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedId === blockId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 text-xs font-mono-code text-cyan-100 overflow-x-auto leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderFormattedText(content.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  };

  const renderFormattedText = (text: string, keyPrefix: string) => {
    const lines = text.split('\n');
    return (
      <div key={keyPrefix} className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;

          // Header line
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-display font-bold text-sm text-cyan-200 mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-display font-bold text-base text-white mt-3 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-display font-extrabold text-lg text-white mt-4 mb-2">
                {line.replace('# ', '')}
              </h2>
            );
          }

          // Bullet list
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <span>{renderInlineStyles(line.trim().substring(2))}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-mono-code text-cyan-400 text-xs shrink-0">{numMatch[1]}.</span>
                <span>{renderInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineStyles(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineStyles = (str: string) => {
    // Handle inline bold and code
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-200 font-mono-code text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto">
      {/* Empty conversation welcome state */}
      {messages.length === 0 ? (
        <div className="my-auto py-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[2px] shadow-[0_0_40px_rgba(6,182,212,0.35)] animate-pulse-glow">
              <div className="w-full h-full bg-[#07090e] rounded-[22px] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-300" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-bold uppercase tracking-wider">
              Gemini 3
            </div>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-2 tracking-tight">
            How can Aetheria amplify your mind today?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
            Multi-turn cognitive dialogues powered by Google Gemini. Switch between deep reasoning, general intelligence, or ultra-fast synthesis anytime.
          </p>

          {/* Active Persona Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyan-400/30 text-xs text-cyan-200 mb-8 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activePersona.color}`} />
            <span>Active Persona:</span>
            <span className="font-semibold text-white">{activePersona.name}</span>
            <span className="text-slate-400">({activePersona.title})</span>
          </div>

          {/* Starter Sparks Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {starterSparks.map((spark, idx) => (
              <button
                key={idx}
                onClick={() => onSendPrompt(spark.prompt)}
                data-cursor="action"
                data-cursor-text="Spark"
                className="group relative p-4 rounded-2xl glass-panel text-left border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.07] transition-all duration-200 overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors">
                    {spark.title}
                  </span>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                    {spark.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {spark.prompt}
                </p>
                <div className="mt-2 flex items-center text-[11px] text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Activate prompt</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation Message Thread */
        <div className="space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const modelMeta = message.modelUsed ? MODEL_DETAILS[message.modelUsed] : null;

            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1.5px] shadow-[0_0_12px_rgba(6,182,212,0.3)] mt-1">
                    <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                {/* Message Body Container */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-500/15 via-blue-600/15 to-indigo-600/15 border border-cyan-400/30 text-white shadow-[0_4px_20px_rgba(6,182,212,0.12)] ml-auto'
                      : 'glass-panel border border-white/10 text-slate-100 shadow-xl'
                  }`}
                >
                  {/* Assistant Meta Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-white">
                          Aetheria
                        </span>
                        {modelMeta && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code border ${modelMeta.badgeColor}`}
                          >
                            {modelMeta.name}
                          </span>
                        )}
                        {message.durationMs && (
                          <span className="flex items-center gap-1 text-[10px] font-mono-code text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{message.durationMs}ms</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        data-cursor="pointer"
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="break-words">
                    {renderMessageContent(message.content)}
                  </div>

                  {/* Render Image Attachment if any */}
                  {message.imageAttachment && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-white/15 bg-black/50 group relative">
                      <img
                        src={message.imageAttachment.url}
                        alt="Synthesized visual"
                        className="w-full max-h-96 object-contain cursor-pointer hover:scale-[1.01] transition-transform"
                        onClick={() => onOpenImageModal?.(message.imageAttachment!.url)}
                      />
                      <div className="p-2 flex items-center justify-between bg-black/70 text-[11px] font-mono-code text-slate-300">
                        <span>Resolution: {message.imageAttachment.resolution || '1K'}</span>
                        <button
                          onClick={() => onOpenImageModal?.(message.imageAttachment!.url)}
                          className="flex items-center gap-1 text-cyan-300 hover:underline"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Expand</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading / Thinking Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in duration-200">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                </div>
              </div>
              <div className="glass-panel border border-cyan-400/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <div className="text-xs font-mono-code text-cyan-300">
                  <span>{MODEL_DETAILS[selectedModel]?.name || 'Gemini'} is synthesising response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>
      )}
    </div>
  );
};
