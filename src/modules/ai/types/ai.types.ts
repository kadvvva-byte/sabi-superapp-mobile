export type AiRole = "system" | "user" | "assistant" | "tool";

export type AiMessage = {
  id: string;
  role: AiRole;
  content: string;
  createdAt: string;
};

export type AiSession = {
  id: string;
  title: string;
  type: "assistant" | "wallet_assistant" | "support_assistant";
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
};