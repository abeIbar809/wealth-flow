import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function generateFinancialInsights(data) {
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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  try {
    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini parse error:", err);

    return {
      trends: "Unable to analyze data",
      risks: "",
      savings_opportunities: "",
      recommendations: [],
    };
  }
}