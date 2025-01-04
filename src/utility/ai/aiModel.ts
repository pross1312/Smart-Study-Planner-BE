import {Role} from "../../model/ai.model"
export interface ChatPart {
    role: Role,
    content: string
}

export interface AIModel {
    sendPrompt(prompt: string): Promise<string>;
    sendChat(_chatHistory: Array<ChatPart>): Promise<ChatPart>;
}
