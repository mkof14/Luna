
import { GoogleGenAI } from "@google/genai";
import { SystemState } from "../types";

/**
 * Enhanced lab analyzer that ingests full profile and historical context.
 * Simulates "learning" by comparing new data against the user's documented baseline.
 */
export const analyzeLabResults = async (results: string, systemState: SystemState, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a sophisticated historical summary to inform the AI of the user's baseline
  const profileSummary = `
    Name: ${systemState.profile.name || 'Anonymous'}, 
    Age: ${systemState.profile.birthDate},
    Health Conditions: ${systemState.profile.conditions || 'None listed'}, 
    Physical Stats: ${systemState.profile.weight}${systemState.profile.units === 'metric' ? 'kg' : 'lb'}, ${systemState.profile.height}${systemState.profile.units === 'metric' ? 'cm' : 'in'},
    Sensitivities: ${systemState.profile.sensitivities.join(', ') || 'None listed'},
    Stress Baseline: ${systemState.profile.stressBaseline}
  `;
  
  const historySummary = systemState.events
    .filter(e => e.type === 'DAILY_CHECKIN')
    .slice(-10) // Look at the last 10 days of sensations
    .map(e => `Day ${e.payload.day || '?'}: Mood ${e.payload.metrics?.mood}/5, Energy ${e.payload.metrics?.energy}/5`)
    .join('; ');

  const prompt = `
    As a women's health quiet companion, perform a systemic mapping of these laboratory markers.
    CONTEXT:
    - Profile Baseline: ${profileSummary}
    - Recent Internal Rhythm (Self-Observation Record): ${historySummary}
    - Current Temporal Point: Day ${systemState.currentDay} of ${systemState.cycleLength}
    - New Data to Integrate: ${results}
    
    REPORT PROTOCOL:
    1. ROLE: You are a professional mirror reflecting "Your Body's Voice".
    2. DEEP PERSONALIZATION: Synthesize the results by specifically referencing the user's known sensitivities and their recent mood/energy trends.
    3. STRUCTURE: Provide a sophisticated, cohesive reflection (2-4 sentences).
    4. TONE: Clinical-grade but empathetic and poetic. Avoid binary "good/bad" labels.
    5. SAFETY: Strictly no diagnoses or treatment plans.
    6. LANGUAGE: ${lang}.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "The system is observing your natural rhythm at this temporal point.";
  }
};

export const generateStateNarrative = async (phase: string, day: number, hormones: any[], metrics: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a 1-sentence reflection for "Your Body's Voice" section based on the current system snapshot.
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
