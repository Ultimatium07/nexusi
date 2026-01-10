// Vercel Serverless Function: AI Chat

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
        const { message, context = [], mode = 'tutor' } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message required' });
        }

        let systemPrompt = '';
        
        switch (mode) {
            case 'tutor':
                systemPrompt = 'Siz NEXUS AI Tutor siz. O\'zbek tilida o\'quv yordamchi bo\'lib, foydalanuvchilarga bilim berishdasiz. Qisqa, aniq va foydali javoblar bering.';
                break;
            case 'quiz_help':
                systemPrompt = 'Siz quiz yordamchisiz. Savollarni tushuntirish va o\'qitishga yordam berasiz. O\'zbek tilida javob bering.';
                break;
            case 'explain':
                systemPrompt = 'Siz tushuntiruvchi o\'qituvchisiz. Murakkab mavzularni sodda tilda tushuntirasiz. O\'zbek tilida javob bering.';
                break;
            default:
                systemPrompt = 'Siz NEXUS AI yordamchisiz. O\'zbek tilida foydali javoblar bering.';
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...context,
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return res.status(200).json({ 
            success: true, 
            reply 
        });

    } catch (error) {
        console.error('AI Chat error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to get AI response',
            reply: 'Kechirasiz, hozir javob bera olmayapman.'
        });
    }
}
