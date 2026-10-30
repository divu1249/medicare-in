export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { message } = await req.json();

  // Fetches from Groq's ultra-fast Llama 3 API
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are MediGuard AI, a clinical assistant. Give fast, structured, highly accurate first-aid advice. Never diagnose. Always recommend calling 112/108 for severe issues.' },
        { role: 'user', content: message }
      ],
      temperature: 0.2, // Low temperature for factual accuracy
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}