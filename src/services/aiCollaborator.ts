import { ai, MODELS } from "../lib/gemini";
import { GenerateContentResponse } from "@google/genai";

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface AIResponse {
  text: string;
  elementsToCreate?: any[]; // For future implementation of "drawing" functionality
}

export async function analyzeCanvas(
  imageBlob: Blob,
  userMessage: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> {
  const base64Data = await blobToBase64(imageBlob);

  const imagePart = {
    inlineData: {
      mimeType: "image/png",
      data: base64Data,
    },
  };

  const textPart = {
    text: userMessage || "Analyze this drawing and provide feedback or suggestions on how to improve it or what to add next.",
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODELS.vision,
    contents: {
      parts: [imagePart, textPart]
    },
    config: {
      systemInstruction: "You are an AI Collaborator in a digital whiteboard (Excalidraw). You help users by analyzing their sketches, providing design advice, explaining concepts they've drawn, and suggesting enhancements. Be concise, creative, and professional.",
    }
  });

  return response.text || "I'm sorry, I couldn't process that.";
}

export async function getDrawingSuggestions(
  currentElementsJson: string, 
  prompt: string
): Promise<string> {
  // Simple text-based brainstorming for now
  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: `The user is working on an Excalidraw canvas with these elements: ${currentElementsJson}. User says: ${prompt}. Suggest some creative ideas or feedback.`,
  });

  return response.text || "No suggestions available.";
}
