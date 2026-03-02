import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SystemState, PartnerNoteInput, PartnerNoteOutput, BridgeReflectionInput, BridgeLetterOutput } from "../types";

export const generateBridgeLetter = async (input: BridgeReflectionInput): Promise<BridgeLetterOutput | { error: any }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the writing engine for Luna’s “The Bridge” module.
    You generate calm, reflective letters that clarify an internal state.

    You must not include:
    - Diagnoses
    - Hormone references
    - Medical explanations
    - Therapy language
    - Behavioral prescriptions
    - Advice to the partner
    - Blame or accusation
    - Emotional exaggeration

    You must:
    - Use first-person language
    - Maintain emotional stability
    - Keep tone restrained and mature
    - Avoid dramatic or poetic style
    - Keep sentences clear and direct
    - Avoid emotional clichés

    The letter must include:
    1. Internal state acknowledgment
    2. Clarification of what the state does not mean
    3. A gentle expression of what would feel kind or supportive
    4. A calm reassurance of relational stability

    Do not add headings.
    Do not format as a report.
    Do not use bullet points.
    Output must be JSON only.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      meta: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          contains_medical: { type: Type.BOOLEAN },
          contains_therapy_language: { type: Type.BOOLEAN },
          contains_blame: { type: Type.BOOLEAN }
        },
        required: ["language", "contains_medical", "contains_therapy_language", "contains_blame"]
      },
      bridge_letter: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING }
        },
        required: ["content"]
      }
    },
    required: ["meta", "bridge_letter"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(input),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    const result = JSON.parse(response.text);
    
    // Safety Filter (Post-Generation Validation)
    const forbiddenTerms = [
      'diagnosis', 'depression', 'disorder', 'anxiety disorder',
      'estrogen', 'progesterone', 'cortisol', 'testosterone',
      'trauma response', 'attachment style', 'emotional regulation',
      'you must', 'you need to', 'you always', 'you never'
    ];
    
    const lowerContent = result.bridge_letter.content.toLowerCase();
    const hasViolation = forbiddenTerms.some(term => lowerContent.includes(term));

    if (hasViolation) {
      // Regenerate once with stricter filtering (simulated by returning error for now as per spec "If still invalid → return SAFETY_VIOLATION error")
      // In a real scenario, we might retry with a stricter prompt.
      return {
        error: {
          code: "SAFETY_VIOLATION",
          message: "Content conflicts with Luna boundaries."
        }
      };
    }

    return result as BridgeLetterOutput;
  } catch (error) {
    console.error("Bridge Letter Generation Error:", error);
    return {
      error: {
        code: "GENERATION_ERROR",
        message: "Failed to generate reflection."
      }
    };
  }
};

export const generatePartnerNote = async (input: PartnerNoteInput): Promise<PartnerNoteOutput | { error: any }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the Luna Relationship Mode generator.
    Generate partner-facing messages that calmly explain a temporary internal state.
    Never provide medical advice, diagnoses, hormonal explanations, therapy language, or prescriptions.
    Never blame the partner.
    Use first-person language only.
    Always include:
    1. Context: A short explanation of current internal state (e.g., "I'm in a lower-energy and more sensitive state today.")
    2. Meaning: Clarification that it is not about the partner (e.g., "This isn't about you or our relationship.")
    3. One Specific Request: Exactly one clear, realistic request (e.g., "It would help if we kept tonight simple and calm.")
    4. Reassurance: Relationship stability statement (e.g., "I care about you, and we're okay.")
    
    Output must be valid JSON in the required schema.
    If user input includes medical or accusatory language, neutralize and remove it.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      meta: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          contains_medical: { type: Type.BOOLEAN },
          contains_blame: { type: Type.BOOLEAN },
          safety_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["language", "contains_medical", "contains_blame", "safety_flags"]
      },
      messages: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["id", "content"]
            }
          },
          note: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["id", "content"]
            }
          },
          letter: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["id", "content"]
            }
          }
        },
        required: ["text", "note", "letter"]
      }
    },
    required: ["meta", "messages"]
  };

  const prompt = `
    Generate partner notes based on these signals:
    ${JSON.stringify(input)}
    
    ${input.preferred_terms ? `IMPORTANT REFINEMENT: ${input.preferred_terms}` : ""}
    
    Strictly follow the structure: Context, Meaning, One Request, Reassurance.
    Provide 3 variations for each size (text, note, letter).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    const result = JSON.parse(response.text);
    
    // Safety Validation Layer (Post-Processing)
    const forbiddenTerms = [
      'depression', 'pmdd', 'disorder', 'anxiety', 'estrogen', 'cortisol', 'progesterone', 
      'hormone', 'medication', 'doctor', 'therapy', 'you always', 'you never', 'you must', 'you need to'
    ];
    
    const validateContent = (content: string) => {
      const lower = content.toLowerCase();
      return !forbiddenTerms.some(term => lower.includes(term));
    };

    const allMessages = [
      ...result.messages.text,
      ...result.messages.note,
      ...result.messages.letter
    ];

    const hasViolation = allMessages.some(m => !validateContent(m.content));

    if (hasViolation) {
      return {
        error: {
          code: "SAFETY_VIOLATION",
          message: "Content conflicts with Luna boundaries."
        }
      };
    }

    return result as PartnerNoteOutput;
  } catch (error) {
    console.error("Partner Note Generation Error:", error);
    return {
      error: {
        code: "GENERATION_ERROR",
        message: "Failed to generate partner note."
      }
    };
  }
};

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
      text: response.text || "No analysis available.",
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
    return response.text || "Equilibrium observed.";
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
    return response.text || "A balanced meal suggestion.";
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
    return response.text || "Support is the best medicine.";
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

export const generatePsychologistResponse = async (text: string, lang: string = 'en'): Promise<{ text: string, audio: string | null }> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.error("CRITICAL: No Gemini API key found in environment variables.");
    return { 
      text: lang === 'ru' ? "Извините, у меня возникли технические сложности с доступом к ИИ." : "I'm sorry, I'm having technical difficulties accessing the AI.", 
      audio: null 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log(`Generating response for: "${text}" in ${lang}`);
    
    // 1. Generate empathetic text response
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User reflection: "${text}". 
      You are Luna, a kind, empathetic, and wise psychologist. 
      Provide a short (1-2 sentences), supportive, and deeply human response to the user's reflection.
      Acknowledge their feelings directly. Use a warm, professional yet approachable tone.
      Language: ${lang === 'ru' ? 'Russian' : 'English'}.
      Do not use clinical jargon or generic advice.`,
    });

    const responseText = textResponse.text?.trim() || (lang === 'ru' ? "Я слышу тебя. Мы вместе пройдем через это." : "I hear you. We are in this together.");
    console.log("AI Text Response:", responseText);

    // 2. Convert to speech using the TTS model
    let audioBase64: string | null = null;
    try {
      const speechResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: responseText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      audioBase64 = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      console.log("AI Audio generated:", !!audioBase64);
    } catch (ttsError) {
      console.error("TTS Generation Error:", ttsError);
      // Continue without audio if TTS fails
    }

    return { text: responseText, audio: audioBase64 };
  } catch (error: any) {
    console.error("Psychologist Response Error:", error);
    
    // Check for specific error types
    const errorMsg = error?.message || "";
    if (errorMsg.includes("API key not valid")) {
      return { text: "API Key Error. Please check your configuration.", audio: null };
    }

    return { 
      text: lang === 'ru' ? "Я слышу тебя. Все будет хорошо." : "I hear you. Everything will be okay.", 
      audio: null 
    };
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