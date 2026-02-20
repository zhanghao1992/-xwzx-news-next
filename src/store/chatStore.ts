import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  updateMessage: (id: string, content: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是AI助手，有什么可以帮助你的吗？',
          timestamp: Date.now(),
        },
      ],

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () => set({ messages: [] }),

      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        })),
    }),
    {
      name: 'chat-storage',
    }
  )
);
