/*
 * @Author: 张浩 386708307@qq.com
 * @Date: 2026-02-20 21:52:41
 * @LastEditors: 张浩 386708307@qq.com
 * @LastEditTime: 2026-02-20 22:05:53
 * @FilePath: /xwzx-news-next/src/lib/ai.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ChatMessage } from "@/types";

const AI_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const AI_MODEL = "qwen3-max-preview";
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || "sk-9c4d89982a6a4bd3b7494d94751fe81c";

export interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface StreamChatCallbacks {
  onContent: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const aiApi = {
  chat: async (messages: ChatMessage[], callbacks: StreamChatCallbacks): Promise<void> => {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
          'X-DashScope-SSE': 'enable'
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: formattedMessages,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              // 适配阿里云DashScope的返回格式
              const content = json.choices?.[0]?.delta?.content ||
                             json.output?.text ||
                             json.choices?.[0]?.message?.content || '';
              if (content) {
                aiResponse += content;
                callbacks.onContent(aiResponse);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (error) {
      console.error('AI Chat Error:', error);
      callbacks.onError(error as Error);
      // 不要再抛出错误，因为已经在callbacks.onError中处理了
    }
  },
};
