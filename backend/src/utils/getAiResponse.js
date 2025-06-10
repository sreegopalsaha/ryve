import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "./ApiError.js";

const getAiResponse = async (prompt, extraDetails) => {
  if (!prompt?.trim() || !extraDetails?.trim()) {
    throw new ApiError(400, "Prompt and extra details are required");
  }

  const { GEMINI_KEY, GEMINI_MODEL } = process.env;

  if (!GEMINI_KEY || !GEMINI_MODEL) {
    throw new ApiError(500, "Gemini configuration is missing");
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

      const fullPrompt = `${prompt.trim()}: ${extraDetails.trim()}.
      Return only plain text. Do not use Markdown, line breaks, bullet points, special characters, or formatting.`;

    const result = await model.generateContent(fullPrompt);
    const text = result?.response?.text();

    if (!text) {
      throw new ApiError(500, "Unable to get AI response");
    }

    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, error?.message || "Failed to generate AI response");
  }
};

export default getAiResponse;
