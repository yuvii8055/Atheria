export type GeminiChatModel =
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite';

export type GeminiImageModel = 'gemini-3-pro-image-preview';

export type ImageResolution = '1K' | '2K' | '4K';

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: GeminiChatModel;
  durationMs?: number;
  imageAttachment?: {
    url: string;
    resolution?: ImageResolution;
    aspectRatio?: ImageAspectRatio;
  };
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  roleId: string;
  model: GeminiChatModel;
}

export interface ChatRolePersona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  systemInstruction: string;
  recommendedModel: GeminiChatModel;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  imageSize: ImageResolution;
  aspectRatio: ImageAspectRatio;
  model: string;
  createdAt: number;
  durationMs?: number;
}
