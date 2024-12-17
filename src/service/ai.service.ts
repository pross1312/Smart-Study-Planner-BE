const axios = require("axios");

const AIService = {
    async callChatGPT({ message }: { message: string }) {
        const apiKey =
            "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";

        try {
            console.log(message);
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini", // or "gpt-3.5-turbo"
                    messages: [
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error(
                "Error calling ChatGPT API:",
                error.response ? error.response.data : error.message
            );

            throw new Error(
                "Rate Limit Exceeded. Please try again later (20s)."
            );
        }
    },
};

export { AIService };
