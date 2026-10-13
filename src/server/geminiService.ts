import { GoogleGenAI } from '@google/genai';

// Initialize server-side Gemini client
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequestOptions {
  messages: ChatMessage[];
  model?: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface ImageGenerateOptions {
  prompt: string;
  imageSize?: '1K' | '2K' | '4K';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  model?: string;
}

/**
 * Handle Multi-turn Chat generation using Gemini
 */
export async function generateChatResponse(options: ChatRequestOptions) {
  const ai = getGeminiClient();
  const {
    messages,
    model = 'gemini-3.5-flash',
    systemInstruction = 'You are Aetheria, a hyper-intelligent, kinetic creative AI assistant designed for deep reasoning, code synthesis, visual design, and avant-garde problem solving. Formulate your responses with crystal clarity, pristine markdown, and deep precision.',
    temperature = 0.7,
  } = options;

  if (!messages || messages.length === 0) {
    throw new Error('No messages provided in conversation.');
  }

  // Map messages to Gemini API format
  const contents = messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature,
    },
  });

  const durationMs = Date.now() - startTime;
  const replyText = response.text || '';

  return {
    text: replyText,
    model,
    durationMs,
    finishReason: response.candidates?.[0]?.finishReason,
  };
}

/**
 * Handle High-Quality Image Generation using gemini-3-pro-image-preview
 * Supports resolution sizing (1K, 2K, 4K) and aspect ratios.
 */
export async function generateImageResponse(options: ImageGenerateOptions) {
  const ai = getGeminiClient();
  const {
    prompt,
    imageSize = '1K',
    aspectRatio = '1:1',
    model = 'gemini-3-pro-image-preview',
  } = options;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Image prompt cannot be empty.');
  }

  // Attempt models in order: requested model (gemini-3-pro-image-preview), then gemini-3-pro-image, then gemini-nano-banana-2.1
  const candidateModels = [model, 'gemini-3-pro-image', 'gemini-nano-banana-2.1'];
  const uniqueModels = Array.from(new Set(candidateModels));

  let lastError: Error | null = null;

  for (const targetModel of uniqueModels) {
    try {
      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      const durationMs = Date.now() - startTime;
      const parts = response.candidates?.[0]?.content?.parts || [];

      let imageUrl: string | null = null;
      let descriptionText = '';

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }

      if (imageUrl) {
        return {
          imageUrl,
          prompt,
          imageSize,
          aspectRatio,
          model: targetModel,
          durationMs,
          description: descriptionText || undefined,
        };
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Failed image generation with ${targetModel}:`, lastError.message);
      // Try next model if any
    }
  }

  throw lastError || new Error('Failed to generate image. Please try again.');
}
