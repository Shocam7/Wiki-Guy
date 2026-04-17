import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash', generationConfig: { temperature: 0 } });

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const prompt = `
      Classify the topic of the Wikipedia article titled "${title}".
      You must respond with exactly ONE of the following words:
      - physics
      - biology
      - chemistry
      - medicine
      - history
      - technology
      - undefined

      If the topic does not clearly fit into one of the specific categories above, choose "undefined".
      Do not include any punctuation, just the lowercase word.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toLowerCase();

    const validTopics = ['physics', 'biology', 'chemistry', 'medicine', 'history', 'technology', 'undefined'];
    const topic = validTopics.includes(responseText) ? responseText : 'undefined';

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error in topic classification API:', error);
    return NextResponse.json({ error: 'Failed to classify topic', topic: 'undefined' }, { status: 500 });
  }
}
