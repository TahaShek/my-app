import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY, // Store this in .env
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return NextResponse.json({ result: response.text });
}