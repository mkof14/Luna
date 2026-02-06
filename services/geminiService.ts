
import { GoogleGenAI } from "@google/genai";
import { SystemState } from "../types";

export const analyzeLabResults = async (results: string, systemState: SystemState, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a condensed profile/history snapshot for the model
  const profileSummary = `
    Name: ${systemState.profile.name || 'Anonymous'}, 
    Conditions: ${systemState.profile.conditions || 'None listed'}, 
    Sensitivities: ${systemState.profile.sensitivities.join(', ') || 'None listed'},
    Stress Baseline: ${systemState.profile.stressBaseline}
  `;
  
  const recentHistorySummary = systemState.events
    .filter(e => e.type === 'DAILY_CHECKIN')
    .slice(-5)
    .map(e => `Day ${e.payload.day || '?'}: Mood ${e.payload.metrics?.mood}, Energy ${e.payload.metrics?.energy}`)
    .join('; ');

  const prompt = `
    As a women's health quiet companion, analyze these lab results and provide a professional, empathetic "Your Body's Voice" reflection for a State Record.
    
    PHYSIOLOGICAL PARAMETERS:
    - Current Rhythm: Day ${systemState.currentDay} of a ${systemState.cycleLength}-day cycle.
    - Profile Snapshot: ${profileSummary}
    - Recent State Observations: ${recentHistorySummary}
    
    NEW LABORATORY DATA:
    ${results}
    
    SYSTEMIC ANALYTICAL GUIDELINES:
    1. ROLE: You are a professional mirror. Reflect the underlying physiological rhythm.
    2. DEEP PERSONALIZATION: Link these markers specifically to the user's reported sensitivities and recent history.
    3. STRUCTURE: Provide a single, sophisticated, cohesive paragraph (2-3 sentences).
    4. TONE: Professional, poetic, and non-judgmental. Avoid "good" or "bad".
    5. SAFETY: No medical diagnoses or specific treatment advice.
    6. RESPONSE LANGUAGE: ${lang}.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "The system observes a natural rhythm at this temporal point.";
  }
};

export const generateStateNarrative = async (phase: string, day: number, hormones: any[], metrics: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a 1-sentence reflection for "Your Body's Voice" section.
    Parameters: Phase ${phase}, Day ${day}. Metrics: ${JSON.stringify(metrics)}.
    
    TONE & RULES:
    - You are a mirror. Reflect the body's internal echo.
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
    return "Everything is moving as it should.";
  }
};

/**
 * Generates an abstract artistic visualization of a physiological state.
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

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Video generation failed:", error);
    return null;
  }
};
