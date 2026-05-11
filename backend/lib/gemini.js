import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI client
const ai = new GoogleGenAI({apiKey: process.env.GoogleGenAI});

// Function to generate financial insights from data
export async function generateFinancialInsights(data) {

  // Prompt sent to AI (forces it to return JSON only)
  const prompt = `
You are a financial analyst.

Return ONLY valid JSON:

{
  "trends": "",
  "risks": "",
  "savings_opportunities": "",
  "recommendations": []
}

Analyze this:
${JSON.stringify(data, null, 2)}
`;

  // Send request to Gemini model
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  try {
    // Get raw text response from AI
    const raw = response.text;

    // Remove markdown formatting (```json ... ```)
    const cleaned = raw.replace(/```json|```/g, "").trim();

    // Convert JSON string into JavaScript object
    return JSON.parse(cleaned);

  } catch (err) {
    // If parsing fails, log error and return fallback
    console.error("Gemini parse error:", err);

    return {
      trends: "Unable to analyze data",
      risks: "",
      savings_opportunities: "",
      recommendations: [],
    };
  }
}