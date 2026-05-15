import { AiMessage, AiSession } from "../types/ai.types";

export const aiApi = {
  async getHistory(): Promise<AiSession[]> {
    return [];
  },

  async sendMessage(message: string): Promise<AiMessage> {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Mock response for: ${message}`,
      createdAt: new Date().toISOString(),
    };
  },
};