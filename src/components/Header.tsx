import React from 'react';
import { Sparkles, Image as ImageIcon, MessageSquare, Sliders, Menu, ShieldCheck } from 'lucide-react';
import { GeminiChatModel, ChatRolePersona } from '../types.ts';
import { MODEL_DETAILS } from '../utils/personas.ts';

interface HeaderProps {
  activeTab: 'chat' | 'imagine';
  setActiveTab: (tab: 'chat' | 'imagine') => void;
  selectedModel: GeminiChatModel;
  setSelectedModel: (model: GeminiChatModel) => void;
  activePersona: ChatRolePersona;
  onOpenPersonaModal: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  totalImagesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  activePersona,
  onOpenPersonaModal,
  onToggleSidebar,
  totalImagesCount,
}) => {
  const currentModelMeta = MODEL_DETAILS[selectedModel];

  return (
    <header className="sticky top-0 z-30 w-full px-4 lg:px-6 py-3 border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            data-cursor="pointer"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Conversations History"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base tracking-wider bg-gradient-to-r from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                  AETHERIA
                </span>
                <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Gemini 3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher (Chat vs 4K Imagine Studio) */}
        <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('chat')}
            data-cursor="pointer"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('imagine')}
            data-cursor="pointer"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === 'imagine'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-fuchsia-200 border border-fuchsia-400/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Imagine 4K Studio</span>
            {totalImagesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-fuchsia-500/20 text-fuchsia-300">
                {totalImagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Active Persona & Model Selector Dropdown/Pill */}
        <div className="flex items-center gap-2">
          {/* Persona selector button */}
          <button
            onClick={onOpenPersonaModal}
            data-cursor="pointer"
            data-cursor-text="Role"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors"
            title="Configure System Persona Instructions"
          >
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activePersona.color}`} />
            <span className="max-w-[120px] truncate">{activePersona.name}</span>
            <Sliders className="w-3 h-3 text-slate-400" />
          </button>

          {/* Model Switcher Pill */}
          <div className="relative group">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiChatModel)}
              data-cursor="pointer"
              aria-label="Select Gemini Chat Model"
              className="appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium bg-black/40 hover:bg-black/60 border border-white/15 hover:border-cyan-400/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (General Balanced)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra-Fast)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                selectedModel === 'gemini-3.1-pro-preview' ? 'bg-purple-400' :
                selectedModel === 'gemini-3.5-flash' ? 'bg-cyan-400' : 'bg-emerald-400'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
