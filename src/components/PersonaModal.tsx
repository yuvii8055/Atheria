import React, { useState } from 'react';
import { X, Sparkles, BrainCircuit, Check, Sliders, ShieldCheck } from 'lucide-react';
import { ChatRolePersona, GeminiChatModel } from '../types.ts';
import { SYSTEM_PERSONAS } from '../utils/personas.ts';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: ChatRolePersona;
  onSavePersona: (persona: ChatRolePersona) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  selectedModel: GeminiChatModel;
  setSelectedModel: (model: GeminiChatModel) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSavePersona,
  temperature,
  setTemperature,
  selectedModel,
  setSelectedModel,
}) => {
  const [currentId, setCurrentId] = useState(activePersona.id);
  const [name, setName] = useState(activePersona.name);
  const [title, setTitle] = useState(activePersona.title);
  const [systemInstruction, setSystemInstruction] = useState(activePersona.systemInstruction);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ChatRolePersona) => {
    setCurrentId(preset.id);
    setName(preset.name);
    setTitle(preset.title);
    setSystemInstruction(preset.systemInstruction);
    setSelectedModel(preset.recommendedModel);
  };

  const handleSave = () => {
    onSavePersona({
      ...activePersona,
      id: currentId,
      name,
      title,
      systemInstruction,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl p-6 border border-white/15 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Gemini System Persona & Cognitive Roles
              </h3>
              <p className="text-xs text-slate-400">
                Configure the core system instructions and model reasoning profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-cursor="pointer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mb-4">
          <label className="block text-xs font-mono-code uppercase text-slate-400 mb-2">
            Preset Archetypes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SYSTEM_PERSONAS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                data-cursor="pointer"
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  currentId === preset.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-black/30 border-white/10 hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="font-semibold truncate">{preset.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* System Instruction Editor */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-mono-code uppercase text-slate-400 mb-1">
              Persona Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-200 border border-white/10 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code uppercase text-slate-400 mb-1 flex items-center justify-between">
              <span>System Instruction (Core Directives)</span>
              <span className="text-[10px] text-cyan-400">Guides model persona across all turns</span>
            </label>
            <textarea
              rows={5}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-mono-code rounded-xl glass-input text-slate-200 border border-white/10 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Temperature & Model Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-black/40 border border-white/10 mb-5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300">Cognitive Temperature</span>
              <span className="font-mono-code text-cyan-300">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Precise & Deterministic</span>
              <span>Creative & Divergent</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Recommended Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiChatModel)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/60 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Complex Reasoning)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (General Purpose)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast Speed)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            data-cursor="pointer"
            className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            data-cursor="action"
            data-cursor-text="Save"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Persona Directives</span>
          </button>
        </div>
      </div>
    </div>
  );
};
