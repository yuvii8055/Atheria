import React, { useState, useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor.tsx';
import { FluidCanvas } from './components/FluidCanvas.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatView } from './components/ChatView.tsx';
import { PromptBar } from './components/PromptBar.tsx';
import { ImagineStudio } from './components/ImagineStudio.tsx';
import { PersonaModal } from './components/PersonaModal.tsx';
import {
  ConversationThread,
  ChatMessage,
  ChatRolePersona,
  GeminiChatModel,
  GeneratedImageItem,
  ImageResolution,
  ImageAspectRatio,
} from './types.ts';
import { SYSTEM_PERSONAS } from './utils/personas.ts';
import {
  loadStoredThreads,
  saveStoredThreads,
  loadActiveThreadId,
  saveActiveThreadId,
  loadStoredImages,
  saveStoredImages,
} from './utils/storage.ts';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'chat' | 'imagine'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Model & Persona State
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('gemini-3.5-flash');
  const [activePersona, setActivePersona] = useState<ChatRolePersona>(SYSTEM_PERSONAS[0]);
  const [temperature, setTemperature] = useState<number>(0.7);

  // Conversations State
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    const stored = loadStoredThreads();
    if (stored.length > 0) return stored;
    // Create initial thread
    const initialThread: ConversationThread = {
      id: `thread_${Date.now()}`,
      title: 'New Dialogue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      roleId: SYSTEM_PERSONAS[0].id,
      model: 'gemini-3.5-flash',
    };
    return [initialThread];
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    const savedId = loadActiveThreadId();
    const all = loadStoredThreads();
    if (savedId && all.some((t) => t.id === savedId)) return savedId;
    return all.length > 0 ? all[0].id : null;
  });

  // Generated Images State
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>(() => loadStoredImages());
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Sync active thread ID if none selected
  useEffect(() => {
    if ((!activeThreadId || !threads.some((t) => t.id === activeThreadId)) && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredThreads(threads);
  }, [threads]);

  useEffect(() => {
    if (activeThreadId) saveActiveThreadId(activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    saveStoredImages(generatedImages);
  }, [generatedImages]);

  // Current active thread
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Create New Conversation Thread
  const handleNewThread = (roleId?: string) => {
    const targetPersona = roleId ? SYSTEM_PERSONAS.find((p) => p.id === roleId) || activePersona : activePersona;
    const newThread: ConversationThread = {
      id: `thread_${Date.now()}`,
      title: 'New Dialogue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      roleId: targetPersona.id,
      model: targetPersona.recommendedModel,
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setSelectedModel(targetPersona.recommendedModel);
    setActivePersona(targetPersona);
    setIsSidebarOpen(false);
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        const fallback: ConversationThread = {
          id: `thread_${Date.now()}`,
          title: 'New Dialogue',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          roleId: activePersona.id,
          model: selectedModel,
        };
        setActiveThreadId(fallback.id);
        return [fallback];
      }
      if (activeThreadId === id) {
        setActiveThreadId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameThread = (id: string, newTitle: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle, updatedAt: Date.now() } : t))
    );
  };

  const handleClearAllThreads = () => {
    const fresh: ConversationThread = {
      id: `thread_${Date.now()}`,
      title: 'New Dialogue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      roleId: activePersona.id,
      model: selectedModel,
    };
    setThreads([fresh]);
    setActiveThreadId(fresh.id);
  };

  // Multi-Turn Chat Messaging Handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoadingChat) return;

    // Check for inline imagine trigger: e.g. /imagine <prompt>
    if (text.startsWith('/imagine ')) {
      const imagePrompt = text.replace('/imagine ', '').trim();
      setActiveTab('imagine');
      handleGenerateImage(imagePrompt, '2K', '16:9');
      return;
    }

    if (!activeThread) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Update conversation state with user message
    const updatedMessages = [...activeThread.messages, userMessage];
    const isFirstMessage = activeThread.messages.length === 0;
    const threadTitle = isFirstMessage ? text.slice(0, 32) + (text.length > 32 ? '...' : '') : activeThread.title;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              title: threadTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : t
      )
    );

    setIsLoadingChat(true);

    try {
      // Prepare conversation payload for Gemini server
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          systemInstruction: activePersona.systemInstruction,
          temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server returned an error generating response.');
      }

      const modelMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: data.text || 'No response content returned.',
        timestamp: Date.now(),
        modelUsed: data.model || selectedModel,
        durationMs: data.durationMs,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? {
                ...t,
                messages: [...t.messages, modelMessage],
                updatedAt: Date.now(),
              }
            : t
        )
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      showToast(err.message || 'Failed to receive response from Gemini.', 'error');
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Image Generation Handler with gemini-3-pro-image-preview
  const handleGenerateImage = async (
    prompt: string,
    size: ImageResolution,
    ratio: ImageAspectRatio
  ) => {
    if (!prompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize: size,
          aspectRatio: ratio,
          model: 'gemini-3-pro-image-preview',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to synthesize image.');
      }

      if (!data.imageUrl) {
        throw new Error('No image was returned by Gemini.');
      }

      const newItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt,
        imageUrl: data.imageUrl,
        imageSize: size,
        aspectRatio: ratio,
        model: data.model || 'gemini-3-pro-image-preview',
        createdAt: Date.now(),
        durationMs: data.durationMs,
      };

      setGeneratedImages((prev) => [newItem, ...prev]);
      showToast(`Successfully synthesized ${size} artwork with Gemini 3 Pro!`, 'success');
    } catch (err: any) {
      console.error('Image synthesis error:', err);
      showToast(err.message || 'Image generation failed. Please try again.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAllImages = () => {
    setGeneratedImages([]);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070c] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Interactive Spring Cursor */}
      <CustomCursor />

      {/* 60fps Dynamic Fluid Mesh Canvas */}
      <FluidCanvas />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel-elevated border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs text-white max-w-sm">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-white ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Glass Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        activePersona={activePersona}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        totalImagesCount={generatedImages.length}
      />

      {/* Workspace Body */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Multi-thread Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={(id) => {
            setActiveThreadId(id);
            setIsSidebarOpen(false);
          }}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
          onRenameThread={handleRenameThread}
          activePersona={activePersona}
          onSelectPersona={(persona) => {
            setActivePersona(persona);
            setSelectedModel(persona.recommendedModel);
          }}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          onClearAllThreads={handleClearAllThreads}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'chat' ? (
            <>
              <ChatView
                messages={activeThread?.messages || []}
                isLoading={isLoadingChat}
                activePersona={activePersona}
                selectedModel={selectedModel}
                onSendPrompt={handleSendMessage}
                onOpenImageModal={(url) => setLightboxImageUrl(url)}
              />

              <PromptBar
                onSendMessage={handleSendMessage}
                isLoading={isLoadingChat}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                activePersona={activePersona}
                onSwitchToImagine={() => setActiveTab('imagine')}
              />
            </>
          ) : (
            <ImagineStudio
              images={generatedImages}
              onGenerateImage={handleGenerateImage}
              isGenerating={isGeneratingImage}
              onDeleteImage={handleDeleteImage}
              onClearAllImages={handleClearAllImages}
            />
          )}
        </main>
      </div>

      {/* Persona Customization Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activePersona={activePersona}
        onSavePersona={(updated) => setActivePersona(updated)}
        temperature={temperature}
        setTemperature={setTemperature}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Inline Image Lightbox Modal if triggered from chat */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full glass-panel-elevated rounded-2xl p-4 overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setLightboxImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <img
              src={lightboxImageUrl}
              alt="Enlarged visual"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
