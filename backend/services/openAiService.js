// services/openAiService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4.1 if available
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI error:", error);
    throw new Error("AI service unavailable");
  }
};
