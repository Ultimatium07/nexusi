// Vercel Serverless Function: AI Quiz Generator

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { topic, difficulty, count = 5, language = 'uz' } = req.body;

        if (!topic || !difficulty) {
            return res.status(400).json({ success: false, error: 'Topic and difficulty required' });
        }

        const prompt = `
Siz ${language} tilida quiz savollarini yaratasiz.
Mavzu: ${topic}
Qiyinlik: ${difficulty}
Savollar soni: ${count}

JSON formatida qaytaring:
{
  "quiz": [
    {
      "question": "savol matni",
      "options": ["A javob", "B javob", "C javob", "D javob"],
      "correct": 0,
      "explanation": "tushuntirish"
    }
  ]
}
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const quizData = JSON.parse(data.choices[0].message.content);

        return res.status(200).json({ 
            success: true, 
            quiz: quizData.quiz 
        });

    } catch (error) {
        console.error('AI Quiz error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to generate quiz' 
        });
    }
}
