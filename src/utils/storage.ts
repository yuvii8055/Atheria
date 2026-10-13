import { ConversationThread, GeneratedImageItem } from '../types.ts';

const CHATS_KEY = 'aetheria_conversations_v1';
const ACTIVE_THREAD_KEY = 'aetheria_active_thread_v1';
const IMAGES_KEY = 'aetheria_generated_images_v1';

export function loadStoredThreads(): ConversationThread[] {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved conversations', e);
    return [];
  }
}

export function saveStoredThreads(threads: ConversationThread[]) {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error('Failed to save conversations', e);
  }
}

export function loadActiveThreadId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_THREAD_KEY);
  } catch {
    return null;
  }
}

export function saveActiveThreadId(id: string) {
  try {
    localStorage.setItem(ACTIVE_THREAD_KEY, id);
  } catch {}
}

export function loadStoredImages(): GeneratedImageItem[] {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredImages(images: GeneratedImageItem[]) {
  try {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch {}
}
