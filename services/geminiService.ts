
import { GoogleGenAI } from "@google/genai";

export const analyzeLabResults = async (results: string, cycleDay: number, age: number, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    As a women's health quiet companion, mirror these lab results in plain, supportive language.
    Context: Day ${cycleDay}, Age ${age}.
    Data: ${results}
    
    QUIET COMPANION GUIDELINES:
    1. Role: You are a mirror, not a coach or therapist.
    2. Mirror experience: "These markers often relate to a feeling of..." 
    3. Be brief: 1-2 sentences max per observation.
    4. Stay neutral. No "good" or "bad" labels.
    5. NO medical diagnoses.
    6. RESPONSE LANGUAGE: ${lang}.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return lang === 'ru' ? "Этот ритм естественен." : "This rhythm is natural.";
  }
};

export const generateStateNarrative = async (phase: string, day: number, hormones: any[], metrics: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a 1-sentence "System Reflection" for a women's health quiet companion.
    Context: Phase ${phase}, Day ${day}. Metrics: ${JSON.stringify(metrics)}.
    
    TONE & RULES:
    - You are a mirror. Reflect, do not instruct.
    - No coaching, no advice, no "shoulds".
    - 1 SENTENCE MAX. Be brief, neutral, and poetic.
    - RESPONSE LANGUAGE: ${lang}.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return lang === 'ru' ? "Все движется как должно." : "Everything is moving as it should.";
  }
};

/**
 * Generates an abstract artistic visualization of a physiological state.
 * Uses gemini-3-pro-image-preview for high-quality (1K/2K/4K) image generation.
 */
export const generateStateVisual = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `An abstract, non-verbal artistic representation of the following physiological and emotional state: ${prompt}. Style: Minimalist medical art, soft bioluminescent gradients, high fidelity, 8k detail.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        },
      },
    });

    // Find the image part in the response candidates
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

/**
 * Initiates and polls for a cinematic video generation using Veo.
 */
export const startVeoVideo = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A slow, cinematic abstract visualization of internal biological flow and cellular state transitions representing: ${prompt}. High-end commercial aesthetic, microscopic detail, serene rhythm.`,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    // Poll for operation completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      // Must append API key when fetching from the download link
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Video generation failed:", error);
    return null;
  }
};
