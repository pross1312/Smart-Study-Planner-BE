import {AIHistory, AIHistoryModel, Role} from "../model/ai.model";
import {TaskModel, TaskStatus, TaskUpdate, TaskPriority} from "../model/task.model"
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

const defaultExplainations = [
    "The current timing for this task ensures it is completed efficiently without interfering with other responsibilities.",
    "The schedule for this task allows enough time to focus on it thoroughly without feeling rushed.",
    "The placement of this task in the schedule ensures it aligns well with other related activities.",
    "This task is set at an optimal time, allowing for maximum productivity and minimal distractions.",
    "The current schedule ensures this task is tackled during the best time of day for focus and efficiency.",
    "The timing for this task provides a clear and consistent routine, making it easy to maintain progress.",
    "This task is perfectly scheduled to ensure it is completed before any critical deadlines.",
    "The allotted time for this task balances well with other priorities, ensuring everything stays on track.",
    "This task is scheduled at a time that allows for proper preparation and follow-through.",
    "The current timing ensures this task is handled at the most effective and practical point in the schedule.",
];

// end_time and start_time will be in Date format
const SuggestionKey = ["description", "status", "priority", "start_time", "end_time"] as const;
type SuggestionKeyType = (typeof SuggestionKey)[number];
interface AISuggestion {
    id: number,
    changes: Record<SuggestionKeyType, any>,
    explaination: string,
}

function getModel(user_id: any): AIModel {
    if (!(user_id in userToModels)) userToModels[user_id] = AI_MODEL.Gemini;
    switch (userToModels[user_id]) {
        case AI_MODEL.GPT: return GPTModel;
        case AI_MODEL.Gemini: return GeminiModel;
        default: throw new Error(`Unexpected model ${userToModels[user_id]}`);
    }
}
function secondToDate(seconds: number | null): Date | null {
    if (seconds === null) return null;
    const result = new Date();
    result.setTime(seconds * 1000);
    return result;
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

    async analyzeSchedule(user_id: any): Promise<Array<AISuggestion>> {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        const tasks = await TaskModel.find({user_id, is_deleted: false});
        if (tasks.length === 0) {
            return [];
        }
        const allTasks = tasks.filter(x => x.status !== TaskStatus.Expired && x.status !== TaskStatus.Done);
        const allTasksFormated = allTasks.map(x => JSON.stringify({
                                             id: x.id,
                                             name: x.name,
                                             description: x.description,
                                             status: x.status,
                                             priority: x.priority,
                                             start_time: secondToDate(x.start_time),
                                             end_time: secondToDate(x.end_time),
                                         }))
                                         .map(x => {return {
                                             role: Role.User,
                                             content: x
                                         }});
        const chats = [
            {
                role: Role.User,
                content:`
Smart Study Planner application.
I need you to review the following tasks (in json format) and give me meaningful suggestion (changes) about 'status'('TODO', 'EXPIRED', 'DONE', 'IN_PROGRESS'), 'priority'('HIGH', 'MEDIUM', 'LOW'), 'start_time', 'end_time' of the task.
Each in THE SAME JSON FORMAT as i provided. Keep "id" and "name" the same so i know which one you are talking about.

Response format:
[
    {
        id: ...,
        name: ...,
        changes: ...,
        explaination: ...,
    },
    ....
]

Current date: ${new Date()}.
Give me time using the following format: YYYY/MM/DD HH:MM:SS.
`
            },
            ...allTasksFormated
        ];
        debugLog(chats);
        const response = await getModel(user_id).sendChat(chats);
        debugLog(response);
        let suggestions = [];
        try {
            suggestions = [];
            if (response.content.startsWith("```json")) {
                response.content = response.content.slice(7, -3).trim();
            }
            const aiResponse = JSON.parse(response.content);
            for (const suggestion of aiResponse) {
                if (!Validator.isNumber(suggestion?.id) || !("name" in suggestion) || !("explaination" in suggestion) || !("changes" in suggestion)) {
                    throw new Error(`Invalid response format from ai ${JSON.stringify(suggestion, null, 2)}`);
                }

                const keys = Object.keys(suggestion.changes);
                for (const key in keys) {
                    if (!(key in SuggestionKey)) delete suggestion.changes[key];
                }

                suggestions.push({
                    id: suggestion.id,
                    name: suggestion.name,
                    changes: suggestion.changes,
                    explaination: suggestion.explaination,
                });
            }
        } catch (err) {
            console.log(err);
            suggestions = [];
            for (const task of allTasks) {
                suggestions.push({
                    id: task.id!,
                    name: task.name,
                    changes: {} as Record<SuggestionKeyType, any>,
                    explaination: defaultExplainations[((Math.random()*defaultExplainations.length) >> 0)],
                })
            }
        }
        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.User,
            content: "analyze my tasks schedule",
        }));
        await AIHistoryModel.save(new AIHistory({
            user_id,
            role: Role.Model,
            content: JSON.stringify(suggestions, null, 2)
        }));
        return suggestions;
    },

    listModels(user_id: any): {models: Array<string>, current: string} {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        let model = AI_MODEL.GPT;
        if (user_id in userToModels) model = userToModels[user_id];
        return {
            models: Object.values(AI_MODEL),
            current: model,
        }
    },

    switchModel(user_id: any, model: any) {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        if (!Validator.isEnum(model, AI_MODEL)) throw new AppError(`Invalid ai_model, must be one of ${Object.values(AI_MODEL)}`, 400);
        userToModels[user_id] = model;
    },

    async applySuggestion(user_id: any, suggestion: AISuggestion) {
        debugLog(suggestion);
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");

        let {id, changes: {description, status, priority, start_time, end_time}} = suggestion;
        if (!Validator.isNumber(id, {start: 1})) {
            debugLog("AI: Invalid id");
            throw new AppError("Can't apply ai suggestion, something unexpected happen", 400);
        }
        if (Validator.isValue(start_time)) {
            start_time = Date.parse(start_time);
            if (!Validator.isNumber(start_time)) {
                debugLog("AI: Invalid start_time");
                throw new AppError("Can't apply ai suggestion, something unexpected happen", 400);
            }
        }
        if (Validator.isValue(end_time)) {
            end_time = Date.parse(end_time);
            if (!Validator.isNumber(end_time)) {
                debugLog("AI: Invalid end_time");
                throw new AppError("Can't apply ai suggestion, something unexpected happen", 400);
            }
        }
        if (Validator.isValue(status) && !Validator.isEnum(status, TaskStatus)) {
            debugLog("AI: Invalid status");
            throw new AppError("Can't apply ai suggestion, something unexpected happen", 400);
        }
        if (Validator.isValue(priority) && !Validator.isEnum(priority, TaskPriority)) {
            debugLog("AI: Invalid priority");
            throw new AppError("Can't apply ai suggestion, something unexpected happen", 400);
        }

        await TaskModel.update({id}, {description, status, priority, start_time, end_time});
    },

    async clearChatHistory(user_id: any) {
        if (!Validator.isNumber(user_id, {start: 1})) throw new Error("Invalid userId from controller");
        await AIHistoryModel.delete({user_id});
    }
};
