import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Download,
  BrainCircuit,
  Sparkles,
  Zap,
  Atom,
  Sliders,
} from 'lucide-react';
import { ConversationThread, ChatRolePersona } from '../types.ts';
import { SYSTEM_PERSONAS } from '../utils/personas.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ConversationThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewThread: (roleId?: string) => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, newTitle: string) => void;
  activePersona: ChatRolePersona;
  onSelectPersona: (persona: ChatRolePersona) => void;
  onOpenPersonaModal: () => void;
  onClearAllThreads: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onRenameThread,
  activePersona,
  onSelectPersona,
  onOpenPersonaModal,
  onClearAllThreads,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (thread: ConversationThread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameThread(id, editTitle.trim());
    }
    setEditingThreadId(null);
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'BrainCircuit':
        return <BrainCircuit className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Atom':
        return <Atom className="w-3.5 h-3.5" />;
      default:
        return <BrainCircuit className="w-3.5 h-3.5" />;
    }
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(threads, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `aetheria_conversations_${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 md:w-80 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        {/* Top: New Session Button & Close */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code uppercase tracking-wider text-slate-400">
              Workspace
            </span>
            <button
              onClick={onClose}
              data-cursor="pointer"
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNewThread()}
            data-cursor="action"
            data-cursor-text="New"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:via-indigo-500/30 hover:to-purple-500/30 border border-cyan-400/40 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all group"
          >
            <Plus className="w-4 h-4 text-cyan-300 group-hover:rotate-90 transition-transform" />
            <span>New Chat Thread</span>
          </button>
        </div>

        {/* Roles Selector Section */}
        <div className="px-4 py-3 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono-code text-slate-400 uppercase tracking-wider">
              Active Role Persona
            </span>
            <button
              onClick={onOpenPersonaModal}
              data-cursor="pointer"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Customize</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {SYSTEM_PERSONAS.map((persona) => {
              const isSelected = activePersona.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelectPersona(persona)}
                  data-cursor="pointer"
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-white/10 border border-cyan-400/40 text-cyan-200'
                      : 'bg-black/20 hover:bg-white/5 border border-white/5 text-slate-300'
                  }`}
                >
                  <span className={`p-1 rounded bg-gradient-to-r ${persona.color} text-white`}>
                    {getPersonaIcon(persona.icon)}
                  </span>
                  <span className="truncate text-[11px] font-medium leading-tight">
                    {persona.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Threads List Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dialogues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-black/30 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        {/* Thread History Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No dialogues found. Start a new thread!
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              const isEditing = editingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread.id)}
                  data-cursor="pointer"
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                      : 'border-transparent hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(thread.id, e)}
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full px-1.5 py-0.5 rounded bg-black/70 border border-cyan-400 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingThreadId(null)}
                          className="p-1 text-slate-400 hover:text-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{thread.title || 'Untitled Thread'}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => startEditing(thread, e)}
                        className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handleExportAll}
            data-cursor="pointer"
            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
            title="Export conversation history"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          {threads.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all conversation dialogues?')) {
                  onClearAllThreads();
                }
              }}
              data-cursor="pointer"
              className="flex items-center gap-1 text-rose-400/80 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
