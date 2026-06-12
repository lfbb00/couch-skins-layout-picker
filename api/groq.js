
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
 
  try {
    const { prompt } = req.body;
 
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'You are a creative director for a DTC brand. You respond only with valid JSON arrays, no markdown, no explanation, nothing outside the JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      const message = data?.error?.message || JSON.stringify(data);
      return res.status(response.status).json({ error: message });
    }
 
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: 'Empty response from Groq' });
 
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
