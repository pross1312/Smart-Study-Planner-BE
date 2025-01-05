import {AIHistory, AIHistoryModel, Role} from "../model/ai.model";
import {TaskModel, TaskStatus} from "../model/task.model"
import {Validator} from "../utility/validator";
import {AIModel} from "../utility/ai/aiModel"
import {GPTModel} from "../utility/ai/gpt"
import {GeminiModel} from "../utility/ai/gemini"
import {debugLog} from "../log/logger";
import AppError from '../exception/appError';

enum AI_MODEL {
    GPT = "gpt",
    Gemini = "gemini",
}
const userToModels: {[key: string]: AI_MODEL} = {
}

function getModel(user_id: any): AIModel {
    if (!(user_id in userToModels)) userToModels[user_id] = AI_MODEL.GPT;
    switch (userToModels[user_id]) {
        case AI_MODEL.GPT: return GPTModel;
        case AI_MODEL.Gemini: return GeminiModel;
        default: throw new Error(`Unexpected model ${userToModels[user_id]}`);
    }
}
export const AIService = {
    async getHistory(user_id: any, start_time: any, end_time: any): Promise<Array<AIHistory>> {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        if (Validator.isValue(start_time) && !Validator.isNumber(start_time)) throw new AppError("Invalid start_time, must be a number (in seconds)", 400);
        if (Validator.isValue(end_time) && !Validator.isNumber(end_time)) throw new AppError("Invalid end_time, must be a number (in seconds)", 400);
        return await AIHistoryModel.find({user_id});
    },

    async prompt(user_id: any, prompt: string): Promise<string> {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        if (!Validator.isValue(prompt)) throw new AppError("Missing prompt", 400);

        const history = await AIHistoryModel.find({user_id});
        const chatHistory = history.map(x => {return {role: x.role, content: x.content}});
        chatHistory.push({role: Role.User, content: prompt});

        const response = await getModel(user_id).sendChat(chatHistory);

        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.User,
            content: prompt
        }));

        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.Model,
            content: response.content
        }));
        return response.content;
    },

    async analyzeSchedule(user_id: any): Promise<string> {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        const tasks = await TaskModel.find({user_id, is_deleted: false});
        if (tasks.length === 0) {
            return "Please add some task first."
        }
        const allTasks = tasks.filter(x => x.status !== TaskStatus.Expired && x.status !== TaskStatus.Done)
                              .map(x => JSON.stringify({
                                  name: x.name,
                                  description: x.description,
                                  status: x.status,
                                  priority: x.priority,
                                  start_time: x.start_time === null ? null : new Date().setTime(x.start_time),
                                  end_time: x.end_time === null ? null : new Date().setTime(x.end_time),
                              }))
                              .map(x => {return {
                                  role: Role.User,
                                  content: x
                              }});
        const chats = [
            {
                role: Role.User,
                content:`Smart Study Planner application.
I need you to review the following tasks (in json format) and give me meaningful suggestion about 'status'('TODO', 'EXPIRED', 'DONE', 'IN_PROGRESS'), 'priority'('HIGH', 'MEDIUM', 'LOW'), 'start_time', 'end_time' of the task.
Each in the same json format the same as i provided.
Current date: ${new Date()}.
Give a short explaination about your suggestion.
Give me time using the following format: YYYY/MM/DD HH:MM:SS
Suggestion for task come first, then short explaination after
`
            },
            ...allTasks
        ];
        debugLog(chats);
        const response = await getModel(user_id).sendChat(chats);
        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.User,
            content: "analyze my tasks schedule",
        }));
        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.Model,
            content: response.content
        }));
        debugLog(response);
        return response.content;
    },

    listModels(): Array<string> {
        return Object.values(AI_MODEL);
    },

    switchModel(user_id: any, model: any) {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        if (!Validator.isEnum(model, AI_MODEL)) throw new AppError(`Invalid ai_model, must be one of ${this.listModels()}`, 400);
        userToModels[user_id] = model;
    },

    async clearChatHistory(user_id: any) {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        await AIHistoryModel.delete({user_id});
    }
};
