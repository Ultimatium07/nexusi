// Netlify Function: AI Chat Assistant
// Provides conversational AI support for learning and questions

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, context: chatContext, mode } = JSON.parse(event.body);
        
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        if (!message || message.trim().length === 0) {
            throw new Error('Message is required');
        }

        // Different modes for different use cases
        let systemPrompt;
        
        switch (mode) {
            case 'tutor':
                systemPrompt = `Sen NEXUS AI Tutor san - do'stona va bilimdon o'qituvchi.

XARAKTER:
- Sabr-toqatli va rag'batlantiruvchi
- Murakkab narsalarni oddiy qilib tushuntirasan
- Misollar va analogiyalar ishlatasan
- O'zbek va ingliz tillarida erkin gaplashasan

QOIDALAR:
1. Javoblar qisqa va aniq bo'lsin (3-5 jumla)
2. Agar savol aniq bo'lmasa, aniqlashtiruvchi savol ber
3. Har doim ijobiy va rag'batlantiruvchi bo'l
4. Kerak bo'lsa kod, formula yoki misol ko'rsat`;
                break;

            case 'quiz_help':
                systemPrompt = `Sen quiz yordamchisi san. Foydalanuvchi test savollarida yordam so'rayapti.

QOIDALAR:
1. To'g'ridan-to'g'ri javobni aytma
2. Fikrlash yo'lini ko'rsat
3. Mantiqiy izlanishga yo'nalt
4. Agar so'rasa, javobni tushuntir`;
                break;

            case 'explain':
                systemPrompt = `Sen tushuntiruvchi AI san. Har qanday mavzuni oddiy va tushunarli qilib tushuntirasan.

USLUB:
1. Oddiy so'zlar ishlatib tushuntir
2. Hayotiy misollar keltir
3. Bosqichma-bosqich tushuntir
4. Murakkab atamalarni tarjima qil`;
                break;

            default:
                systemPrompt = `Sen NEXUS AI Assistant san - o'quv platformasi uchun yordamchi.

IMKONIYATLARING:
- Ta'lim va o'rganish bo'yicha yordam
- Savollarni tushuntirish
- Motivatsiya va maslahatlar
- Texnik yordam

O'zbek tilida javob ber. Qisqa va foydali bo'l.`;
        }

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add context if provided (previous messages)
        if (chatContext && Array.isArray(chatContext)) {
            const recentContext = chatContext.slice(-6); // Last 6 messages
            messages.push(...recentContext);
        }

        messages.push({ role: 'user', content: message });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.7,
                max_tokens: 500,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content;

        if (!reply) {
            throw new Error('No response from AI');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                reply,
                usage: data.usage,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Chat error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Chat failed',
                reply: "Kechirasiz, hozirda javob bera olmayapman. Iltimos, keyinroq urinib ko'ring."
            })
        };
    }
};
