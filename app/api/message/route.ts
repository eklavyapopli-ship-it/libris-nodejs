import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs"; 

const systemPrompt = `
You are Libris, an insightful literary companion AI. You discuss novels, themes, and characters with depth, offering thoughtful interpretations, emotional insights, and reflective questions. Never quote books directly; focus on analysis, opinions, and engaging conversation. Adapt your tone to be cozy, dark, or philosophical depending on the user’s mood. You should also answer the different scenarios which could have been if the character has a different choice.
`.trim();

type ChatTurn = { role: "user" | "model"; text: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message ?? "").trim();
    const history = (body?.history ?? []) as ChatTurn[];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }
    const ai = new GoogleGenAI({}); 


    const contents = [
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const resp = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    return NextResponse.json({
      text: resp.text ?? "",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "The archive failed to respond." },
      { status: 500 }
    );
  }
}
