'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { aiApi } from '@/lib/ai';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import TabBar from '@/components/TabBar';
import type { ChatMessage } from '@/types';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

function MessageContent({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const renderContent = async () => {
      try {
        const rendered = await marked(content);
        setHtml(DOMPurify.sanitize(rendered));
      } catch (error) {
        console.error('Markdown render error:', error);
        setHtml(DOMPurify.sanitize(content));
      }
    };
    renderContent();
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function AIChatPage() {
  const t = useTranslations();
  const { messages, addMessage, clearMessages, updateMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 调试信息
  const debugInfo = {
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
    apiKeyConfigured: !!process.env.NEXT_PUBLIC_AI_API_KEY,
  };

  console.log('AIChatPage render - Debug info:', debugInfo);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    // 添加一个空的AI消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(assistantMessage);

    try {
      await aiApi.chat([...messages, userMessage], {
        onContent: (content) => {
          // 实时更新AI消息内容
          updateMessage(assistantMessageId, content);
        },
        onComplete: () => {
          // 流式传输完成
        },
        onError: (error) => {
          console.error('Chat error in callback:', error);
          updateMessage(
            assistantMessageId,
            `发生错误: ${error.message || t('errors.unknown')}`
          );
        },
      });
    } catch (error) {
      // 这个catch块理论上不应该执行，因为错误已经在callbacks.onError中处理了
      console.error('Unexpected chat error:', error);
      updateMessage(
        assistantMessageId,
        `未预期的错误: ${error instanceof Error ? error.message : t('errors.unknown')}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('确定要清空聊天记录吗？')) {
      clearMessages();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('nav.aichat')}</h1>
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-danger transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">你好！我是 AI 助手</p>
              <p className="text-sm">有什么可以帮助您的吗？</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : msg.content === '' ? (
                  // 打字指示器
                  <div className="flex items-center space-x-1 py-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : (
                  <MessageContent content={msg.content} />
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('aichat.placeholder')}
            rows={1}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:border-primary"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
