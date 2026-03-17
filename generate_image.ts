import { GoogleGenAI } from "@google/genai";

async function generateCover() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A lush, vibrant forest runner game cover art. A sleek, futuristic character in organic green and white armor is running at high speed through a dense, mystical forest with giant ancient trees, glowing moss, and floating leaves. The lighting is cinematic, with sunbeams filtering through the canopy. High quality, 4k, digital art style, nature-focused, energetic. The title "CLIMAGYN RUNNER" is NOT in the image, just the art.',
        },
      ],
    },
    config: {
      imageConfig: {
            aspectRatio: "16:9",
        },
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      console.log(part.inlineData.data);
    }
  }
}

generateCover();
