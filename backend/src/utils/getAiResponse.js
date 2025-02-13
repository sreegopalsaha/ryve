import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "./ApiError.js";

const getAiResponse = async (prompt, extraDetails) => {
    if (!prompt || !extraDetails) return;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    const fullPrompt = `
        ${prompt}: ${extraDetails}
        Please provide the response in plain text format 
        without any markdown formatting, line breaks, or special characters.
    `;

    const result = await model.generateContent(fullPrompt);
    if (!result) throw new ApiError(500, "Unable to get AI response");
    
    const cleanText = result.response.text()
        .replace(/\*\*/g, '')
        .replace(/\n/g, ' ') 
        .trim();

    return cleanText;
}

export default getAiResponse;