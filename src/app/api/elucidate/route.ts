import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash', generationConfig: { temperature: 0.7 } });

export async function POST(request: Request) {
  try {
    const { text, articleTitle } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompt = `
      I am reading a Wikipedia article titled "${articleTitle || 'Unknown'}".
      I need you to explain the following text to me like I am a 5th grader. Keep it short, simple, and easy to understand.

      Text to explain:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in elucidate API:', error);
    return NextResponse.json({ error: 'Failed to explain text' }, { status: 500 });
  }
}
