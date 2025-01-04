import {AIModel, ChatPart} from "./aiModel";
import {Role} from "../../model/ai.model"
import {debugLog} from "../../log/logger";

const apiKey = process.env.GPT_KEY;

const useMarkDown = false;

class _GPTModel implements AIModel {
    async sendPrompt(prompt: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // or "gpt-3.5-turbo"
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                })
            }).then(async response => {
                const data = await response.json();
                debugLog(JSON.stringify(data, null, 2));
                if (response.status === 200) {
                    if (data.choices.length != 1) {
                        reject(new Error("Expected choices length 1"));
                    } else if (typeof data.choices[0]?.message?.content !== "string") {
                        reject(new Error("Missing content"));
                    } else {
                        resolve(data.choices[0]?.message?.content);
                    }
                } else {
                    reject(data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    async sendChat(_chatHistory: Array<ChatPart>): Promise<ChatPart> {
        const result = [];
        const chatHistory = _chatHistory.map(x => {
            return {
                role: x.role === Role.Model ? "assistant" : "user",
                content: x.content
            };
        })
        if (!useMarkDown) {
            chatHistory.push({role: "user", content: "Don't use markdown in your response!!! And don't say anything about markdown either"});
        }
        return new Promise((resolve, reject) => {
            fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // or "gpt-3.5-turbo"
                    messages: chatHistory,
                })
            }).then(async response => {
                const data = await response.json();
                debugLog(JSON.stringify(data, null, 2));
                if (response.status === 200) {
                    if (data.choices.length != 1) {
                        reject(new Error("Expected choices length 1"));
                    } else if (typeof data.choices[0]?.message?.content !== "string") {
                        reject(new Error("Missing content"));
                    } else {
                        resolve({
                            role: Role.Model,
                            content: data.choices[0]?.message?.content
                        });
                    }
                } else {
                    reject(data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
}
export const GPTModel = new _GPTModel();
