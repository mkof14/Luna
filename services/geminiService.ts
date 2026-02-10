import { GoogleGenAI } from "@google/genai";
import { SystemState } from "../types";

export const analyzeLabResults = async (results: string, systemState: SystemState, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    .slice(-10)
    .map(e => `Day ${e.payload.day || '?'}: Mood ${e.payload.metrics?.mood}/5, Energy ${e.payload.metrics?.energy}/5`)
    .join('; ');

  const prompt = `
    As a professional women's health companion, perform a systemic mapping of these laboratory markers.
    PARAMETERS:
    - Profile Baseline: ${profileSummary}
    - Recent Internal Rhythm: ${historySummary}
    - New Data: ${results}
    
    REPORT PROTOCOL:
    1. USE GOOGLE SEARCH to verify current clinical reference ranges for the user's age/sex if the data seems critical.
    2. Synthesize with current cycle phase (Day ${systemState.currentDay}).
    3. LANGUAGE: ${lang}. 
    4. NO DIAGNOSIS. POETIC BUT CLINICAL TONE. 
    5. IMPORTANT: DO NOT use the word "Context" in the response. Use Architecture, Logic, or Foundation instead.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] 
      }
    });
    
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "The system is observing your natural rhythm at this temporal point.", sources: [] };
  }
};

export const generateStateNarrative = async (phase: string, day: number, hormones: any[], metrics: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate a 1-sentence reflection for "Your Body's Voice" section.
    Parameters: Phase ${phase}, Day ${day}. Metrics: ${JSON.stringify(metrics)}.
    RULES: 1 SENTENCE MAX. poetic, neutral, mirror-like. LANGUAGE: ${lang}.
    DO NOT use the word "Context".
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

export const generateCulinaryInsight = async (phase: string, priorities: string[], sensitivities: string[], lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Create a highly aesthetic, phase-specific meal suggestion.
    PHASE: ${phase}. PRIORITIES: ${priorities.join(', ')}. SENSITIVITIES: ${sensitivities.join(', ')}.
    OUTPUT FORMAT:
    1. Title: Creative name of the dish.
    2. Logic: Why this is good for this phase in 1 sentence.
    3. Components: 3-4 key ingredients.
    STYLE: Professional nutritionist, poetic, minimalist. LANGUAGE: ${lang === 'ru' ? 'Russian' : 'English'}.
    DO NOT use the word "Context".
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Enjoy a balanced meal rich in whole foods.";
  }
};

export const generateEmpathyBridgeMessage = async (phase: string, metrics: any, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are Luna, an aesthetic and empathetic health assistant acting as a 'Digital Mediator' in a relationship.
    TASK: Generate a message hint for a partner. STYLE: Poetic, warm. LANGUAGE: ${lang === 'ru' ? 'Russian' : 'English'}.
    DO NOT use the word "Context".
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Support is the best medicine.";
  }
};

export const generateStateVisual = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `Minimalist medical art, soft bioluminescent gradients, high fidelity, representing: ${prompt}.` }],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const startVeoVideo = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Slow, cinematic abstract visualization of internal biological flow: ${prompt}.`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return downloadLink ? `${downloadLink}&key=${process.env.API_KEY}` : null;
  } catch (error) {
    return null;
  }
};