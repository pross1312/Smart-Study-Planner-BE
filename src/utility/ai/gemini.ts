import {AIModel, ChatPart} from "./aiModel";
import {Role} from "../../model/ai.model"
import {debugLog} from "../../log/logger";
import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from "@google/generative-ai";

const useMarkDown = false;

class _GeminiModel implements AIModel {
    model: GenerativeModel;
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async sendPrompt(prompt: string): Promise<any> {
        try {
            const response: GenerateContentResult = await this.model.generateContent(prompt);
            return response;
        } catch (err) {
            throw err;
        }
    }

    async sendChat(_chatHistory: Array<ChatPart>): Promise<ChatPart> {
        if (!useMarkDown) {
            _chatHistory.push({
                role: Role.User,
                content: "Response with plain text format",
            });
        }
        debugLog(JSON.stringify(_chatHistory, null, 2));
        const chatHistory = _chatHistory.slice(0, _chatHistory.length).map(x => { return {
            role: x.role,
            parts: [{ text: x.content }]
        }});
        const chat = this.model.startChat({
            history: chatHistory,
        });
        let result = await chat.sendMessage(_chatHistory[_chatHistory.length-1].content);
        debugLog(debugLog(JSON.stringify(result, null, 2)));
        return {
            role: Role.Model,
            content: result?.response?.text()?.trim()
        };
    }
}

export const GeminiModel = new _GeminiModel();
