export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { message } = await req.json();

  // Route through Perplexity's 'sonar' model for live internet scraping
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro', // This specific model executes live web searches
      messages: [
        { 
          role: 'system', 
          content: 'You are MediGuard AI. You must search the live internet exclusively for board-certified medical documents, peer-reviewed journals (NIH, PubMed), and official health organizations (WHO, CDC) to answer the user. Provide concise, highly accurate summaries of current medical consensus. Always include a disclaimer to consult a doctor.' 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1, // Keeps the model strictly factual
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ reply: "Search services are currently overloaded. Please try again." }), { status: 500 });
  }

  const data = await response.json();
  return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}