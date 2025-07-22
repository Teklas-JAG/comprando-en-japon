import { GoogleGenAI, Type } from "@google/genai";
import type { TranslationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const JPY_TO_EUR_RATE = 170;

export const getManualConversion = async (amount: number): Promise<number> => {
  if (isNaN(amount) || amount <= 0) {
    return 0;
  }
  
  try {
    const prompt = `Convert ${amount} JPY to EUR. Use the exchange rate 1 EUR = ${JPY_TO_EUR_RATE} JPY. Respond with ONLY the numerical value, without currency symbols or any other text. For example, if the result is 123.45, respond with '123.45'.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const textResponse = response.text.trim();
    const convertedAmount = parseFloat(textResponse);
    
    return isNaN(convertedAmount) ? 0 : convertedAmount;
  } catch (error) {
    console.error("Error getting manual conversion from Gemini:", error);
    // Fallback to manual calculation on API error
    return amount / JPY_TO_EUR_RATE;
  }
};


export const translateAndConvertFromImage = async (base64ImageData: string): Promise<TranslationResult> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const promptPart = {
    text: `Analyze the image. Identify all Japanese text and translate it to Spanish. Also, find all prices listed in Japanese Yen (¥ or 円) and convert them to Euros (EUR). Use an exchange rate of 1 EUR = ${JPY_TO_EUR_RATE} JPY. Format your response according to the provided JSON schema. If no text or prices are found, return an empty translation and an empty array for conversions.`
  };
  
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [promptPart, imagePart] },
      config: {
          systemInstruction: "You are a helpful assistant specialized in translating Japanese text to Spanish and converting JPY to EUR from images.",
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  fullTranslationSpanish: {
                      type: Type.STRING,
                      description: "The complete translation of all Japanese text in the image into Spanish."
                  },
                  currencyConversions: {
                      type: Type.ARRAY,
                      description: "A list of all detected prices and their conversion from JPY to EUR.",
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              originalJPY: {
                                  type: Type.STRING,
                                  description: "The original price string detected in Japanese Yen (e.g., '1500円')."
                              },
                              amountEUR: {
                                  type: Type.NUMBER,
                                  description: "The converted amount in Euros."
                              }
                          },
                          required: ["originalJPY", "amountEUR"]
                      }
                  }
              },
              required: ["fullTranslationSpanish", "currencyConversions"]
          },
      },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as TranslationResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The API returned an invalid response format.");
  }
};