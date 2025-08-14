// src/lib/postChat.ts
import { request } from "./api";

export type ChatHistoryItem = { role: "user" | "assistant" | "tool" | "system"; content: string };

export type ChatResponse = {
  character_information: {
    background: string;
    notable_works: string;
    occupation: string;
    first_appearance: string;
    era: string;
  };
  system_role_used: "character" | "narrator";
  assistant_text: string;
};

export async function postChat(params: {
  character_name: string;
  role: string;
  user_message: string;
  history: ChatHistoryItem[];
  character_information?: {
    background: string;
    notable_works: string | string[] | null;
    occupation: string;
    first_appearance: string | null;
    era: string;
  };
}) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
