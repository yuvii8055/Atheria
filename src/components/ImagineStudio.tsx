import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Clock,
  Trash2,
  Share2,
  Eye,
  Info,
} from 'lucide-react';
import { GeneratedImageItem, ImageResolution, ImageAspectRatio } from '../types.ts';

interface ImagineStudioProps {
  images: GeneratedImageItem[];
  onGenerateImage: (prompt: string, size: ImageResolution, ratio: ImageAspectRatio) => Promise<void>;
  isGenerating: boolean;
  onDeleteImage: (id: string) => void;
  onClearAllImages: () => void;
}

export const ImagineStudio: React.FC<ImagineStudioProps> = ({
  images,
  onGenerateImage,
  isGenerating,
  onDeleteImage,
  onClearAllImages,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<ImageResolution>('2K');
  const [selectedRatio, setSelectedRatio] = useState<ImageAspectRatio>('16:9');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<GeneratedImageItem | null>(null);

  const stylePresets = [
    { name: 'Astral Bioluminescence', suffix: ', ethereal bioluminescent flora, deep cosmic obsidian background, refractive crystals, cinematic volumetric lighting, 8k ultra-detailed' },
    { name: 'Architectural Brutalism', suffix: ', monolithic minimalist architecture, concrete and iridescent tinted glass, atmospheric fog, dusk golden hour raytracing' },
    { name: 'Cyberpunk Hyper-Neon', suffix: ', futuristic Tokyo megacity, holographic displays, rain-slicked chrome reflections, hyper-detailed cyberpunk aesthetic' },
    { name: 'Quantum Surrealism', suffix: ', fluid iridescent liquid metals bending space-time, surreal floating geometry, octane render, chromatic aberration' },
  ];

  const resolutionOptions: { size: ImageResolution; label: string; desc: string }[] = [
    { size: '1K', label: '1K Standard', desc: 'Optimal speed & balanced detail' },
    { size: '2K', label: '2K High-Fidelity', desc: 'Enhanced textures & crisp clarity' },
    { size: '4K', label: '4K Ultra-Synthesis', desc: 'Maximum resolution & studio fidelity' },
  ];

  const ratioOptions: { ratio: ImageAspectRatio; label: string; iconBox: string }[] = [
    { ratio: '1:1', label: 'Square (1:1)', iconBox: 'w-4 h-4' },
    { ratio: '16:9', label: 'Landscape (16:9)', iconBox: 'w-6 h-3.5' },
    { ratio: '9:16', label: 'Portrait Mobile (9:16)', iconBox: 'w-3.5 h-6' },
    { ratio: '4:3', label: 'Classic (4:3)', iconBox: 'w-5 h-4' },
    { ratio: '3:4', label: 'Editorial (3:4)', iconBox: 'w-4 h-5' },
  ];

  const handleApplyPreset = (presetSuffix: string) => {
    setPrompt((prev) => {
      const clean = prev.trim();
      if (!clean) return presetSuffix.replace(/^,\s*/, '');
      return `${clean}${presetSuffix}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateImage(prompt.trim(), selectedSize, selectedRatio);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (img: GeneratedImageItem) => {
    const link = document.createElement('a');
    link.href = img.imageUrl;
    link.download = `aetheria_${img.imageSize}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-6xl w-full mx-auto space-y-8">
      {/* Studio Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 glass-panel-elevated border border-white/15 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                Model: gemini-3-pro-image-preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-white/5 text-slate-400 border border-white/10">
                Resolution: 1K • 2K • 4K
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Gemini 3 Pro Imagine Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Synthesize high-fidelity, studio-grade visual concepts with native 4K resolution tuning, cinematic lighting, and custom aspect ratios.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/20 text-fuchsia-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">4K Synthesis Engine</div>
              <div className="text-[11px] text-slate-400">Direct server-side Google GenAI pipeline</div>
            </div>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Prompt Input Box */}
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene in evocative visual detail (e.g., 'An ethereal celestial pavilion surrounded by floating rings of liquid amber, deep indigo void, raytraced volumetric lighting')..."
              disabled={isGenerating}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl glass-input text-slate-100 placeholder-slate-500 border border-white/15 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 resize-none leading-relaxed"
            />
          </div>

          {/* Quick Style Sparks */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-mono-code text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-fuchsia-400" />
              <span>Aesthetics:</span>
            </span>
            {stylePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.suffix)}
                data-cursor="pointer"
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-400/40 text-[11px] text-slate-300 hover:text-white transition-all shrink-0"
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {/* Controls Bar: Resolution (1K, 2K, 4K) & Aspect Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/50 border border-white/10">
            {/* Resolution Selector (Mandatory Affordance) */}
            <div>
              <label className="block text-xs font-mono-code uppercase text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Image Size Resolution</span>
                </span>
                <span className="text-[10px] text-slate-400">Target Output Size</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {resolutionOptions.map((opt) => {
                  const isSelected = selectedSize === opt.size;
                  return (
                    <button
                      key={opt.size}
                      type="button"
                      onClick={() => setSelectedSize(opt.size)}
                      data-cursor="pointer"
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-xs font-mono-code">{opt.size}</div>
                      <div className="text-[10px] truncate opacity-80 mt-0.5">{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-mono-code uppercase text-slate-300 mb-2 flex items-center justify-between">
                <span>Aspect Ratio</span>
                <span className="text-[10px] text-slate-400">Canvas Dimensions</span>
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {ratioOptions.map((opt) => {
                  const isSelected = selectedRatio === opt.ratio;
                  return (
                    <button
                      key={opt.ratio}
                      type="button"
                      onClick={() => setSelectedRatio(opt.ratio)}
                      data-cursor="pointer"
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                      title={opt.label}
                    >
                      <div className={`border border-current rounded-sm ${opt.iconBox} mb-1`} />
                      <span className="text-[10px] font-mono-code">{opt.ratio}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              data-cursor="action"
              data-cursor-text="Synthesize"
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-xs transition-all duration-200 ${
                prompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-fuchsia-300" />
                  <span>Synthesizing {selectedSize} Image with Gemini 3 Pro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-fuchsia-300" />
                  <span>Synthesize {selectedSize} Masterpiece</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generation Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-white">
              Synthesized Gallery
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono-code bg-white/5 text-slate-400 border border-white/10">
              {images.length} creations
            </span>
          </div>

          {images.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all gallery images?')) {
                  onClearAllImages();
                }
              }}
              data-cursor="pointer"
              className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Gallery</span>
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">
              No Synthesized Imagery Yet
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Choose your resolution (1K, 2K, or 4K), enter a prompt above, and let Gemini 3 Pro generate visual renders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-fuchsia-400/40 shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image Container with hover zoom */}
                <div
                  className="relative aspect-square overflow-hidden bg-black/60 cursor-pointer"
                  onClick={() => setActiveLightboxImage(img)}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Hover Overlay with Quick Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxImage(img);
                      }}
                      data-cursor="pointer"
                      className="p-2.5 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-transform hover:scale-110"
                      title="View High-Res Lightbox"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img);
                      }}
                      data-cursor="pointer"
                      className="p-2.5 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-transform hover:scale-110"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(img.id);
                      }}
                      data-cursor="pointer"
                      className="p-2.5 rounded-xl bg-black/70 hover:bg-black text-rose-400 border border-white/20 transition-transform hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Resolution & Ratio Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-code font-bold bg-black/70 text-fuchsia-300 border border-fuchsia-400/40 backdrop-blur-sm">
                      {img.imageSize}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono-code bg-black/70 text-slate-300 border border-white/20 backdrop-blur-sm">
                      {img.aspectRatio}
                    </span>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-3.5 flex flex-col justify-between flex-1 bg-black/40 border-t border-white/5 space-y-2">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    "{img.prompt}"
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="font-mono-code text-[10px]">
                      {img.model.replace('gemini-', '')}
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(img.id, img.prompt)}
                      data-cursor="pointer"
                      className="flex items-center gap-1 hover:text-white transition-colors"
                      title="Copy prompt"
                    >
                      {copiedId === img.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] glass-panel-elevated rounded-3xl overflow-hidden border border-white/20 p-4 sm:p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                  {activeLightboxImage.imageSize} UHD
                </span>
                <span className="text-xs font-mono-code text-slate-400">
                  Ratio: {activeLightboxImage.aspectRatio}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activeLightboxImage)}
                  data-cursor="pointer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </button>
                <button
                  onClick={() => setActiveLightboxImage(null)}
                  data-cursor="pointer"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            {/* Lightbox Image Preview */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-black/60 flex items-center justify-center min-h-[350px]">
              <img
                src={activeLightboxImage.imageUrl}
                alt={activeLightboxImage.prompt}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Prompt Description */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[11px] font-mono-code uppercase text-slate-400 mb-1">
                Generation Prompt
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {activeLightboxImage.prompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
