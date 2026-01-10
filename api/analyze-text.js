// Vercel Serverless Function: Text Analysis

export default async function handler(req, res) {
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
        const { text, action, options = {} } = req.body;

        if (!text || !action) {
            return res.status(400).json({ success: false, error: 'Text and action required' });
        }

        let prompt = '';
        
        switch (action) {
            case 'summarize':
                prompt = `Quyidagi matnni qisqacha xulosa qiling (uzbek tilida):\n\n${text}`;
                break;
            case 'quiz':
                prompt = `Quyidagi matn asosida 5 ta test savoli yarating (uzbek tilida):\n\n${text}`;
                break;
            case 'flashcards':
                prompt = `Quyidagi matndan 10 ta flashcard yarating (uzbek tilida):\n\n${text}`;
                break;
            case 'explain':
                prompt = `Quyidagi matnni sodda tilda tushuntiring (uzbek tilida):\n\n${text}`;
                break;
            case 'keywords':
                prompt = `Quyidagi matndan asosiy kalit so'zlarni ajratib oling (uzbek tilida):\n\n${text}`;
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid action' });
        }

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
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const result = data.choices[0].message.content;

        return res.status(200).json({ 
            success: true, 
            result 
        });

    } catch (error) {
        console.error('Text analysis error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze text' 
        });
    }
}
