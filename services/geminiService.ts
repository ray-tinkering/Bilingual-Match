import { GoogleGenAI, Type } from "@google/genai";
import { WordPair } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchWordPairs = async (level: number = 1): Promise<WordPair[]> => {
  // Increased to 10 pairs (20 cards) for a bigger game board
  const numberOfPairs = 10;
  
  let difficultyDescription = "simple, distinct English words suitable for a 2nd grader (e.g., common animals, foods, colors)";
  
  if (level === 2) {
    difficultyDescription = "slightly harder English words suitable for a 3rd grader (including verbs and adjectives)";
  } else if (level >= 3) {
    difficultyDescription = "challenging English words suitable for a 4th or 5th grader (abstract nouns, complex verbs)";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of ${numberOfPairs} ${difficultyDescription} and their Spanish translations. Avoid cognates if possible to make it a fun challenge (e.g., avoid "Elephant/Elefante", prefer "Red/Rojo"). Ensure all words are distinct from each other.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              spanish: { type: Type.STRING }
            },
            required: ["english", "spanish"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const words = JSON.parse(text) as WordPair[];
    return words;
  } catch (error) {
    console.error("Error fetching words:", error);
    // Fallback data in case of API failure or rate limit - increased to 10 pairs
    return [
      { english: "Dog", spanish: "Perro" },
      { english: "Sun", spanish: "Sol" },
      { english: "Water", spanish: "Agua" },
      { english: "Book", spanish: "Libro" },
      { english: "Green", spanish: "Verde" },
      { english: "Milk", spanish: "Leche" },
      { english: "Bread", spanish: "Pan" },
      { english: "Moon", spanish: "Luna" },
      { english: "Shoe", spanish: "Zapato" },
      { english: "Fish", spanish: "Pez" }
    ];
  }
};