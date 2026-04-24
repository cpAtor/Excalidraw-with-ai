import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  text: "gemini-3-flash-preview",
  vision: "gemini-2.5-flash-image", // Good for visual reasoning
  complex: "gemini-3.1-pro-preview"
};
