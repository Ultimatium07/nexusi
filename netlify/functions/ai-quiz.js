// Netlify Function: AI Quiz Generator using OpenAI
// This function securely calls OpenAI API from server-side

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
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
        const { topic, difficulty, count, language } = JSON.parse(event.body);
        
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        // Difficulty descriptions
        const difficultyMap = {
            easy: "oson, boshlang'ich daraja",
            medium: "o'rta qiyinlik, umumiy bilim",
            hard: "qiyin, chuqur bilim talab qiladi"
        };

        // Topic descriptions
        const topicMap = {
            general: "umumiy bilim (tarix, fan, geografiya, madaniyat)",
            science: "fan va texnologiya (fizika, kimyo, biologiya, astronomiya)",
            history: "jahon tarixi va O'zbekiston tarixi",
            tech: "zamonaviy texnologiyalar, dasturlash, IT",
            math: "matematika va mantiq",
            literature: "adabiyot va she'riyat",
            geography: "geografiya va mamlakatlar",
            sports: "sport va olimpiya o'yinlari"
        };

        const topicDesc = topicMap[topic] || topicMap.general;
        const diffDesc = difficultyMap[difficulty] || difficultyMap.medium;
        const lang = language || 'uz';
        const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);

        const systemPrompt = `Sen professional quiz yaratuvchi AI san. Vazifang - ta'limiy va qiziqarli test savollari yaratish.

QOIDALAR:
1. Har bir savol aniq va tushunarli bo'lsin
2. 4 ta javob varianti bo'lsin (A, B, C, D)
3. Faqat BITTA to'g'ri javob bo'lsin
4. Noto'g'ri javoblar ham mantiqiy ko'rinsin (ishonchli distraktorlar)
5. Savollar ${diffDesc} bo'lsin
6. Mavzu: ${topicDesc}
7. Til: ${lang === 'uz' ? "O'zbek tilida" : "Ingliz tilida"}

JSON formatida javob ber:
{
  "questions": [
    {
      "id": 1,
      "question": "Savol matni",
      "options": ["A varianti", "B varianti", "C varianti", "D varianti"],
      "correct": 0,
      "explanation": "Qisqa tushuntirish nima uchun bu javob to'g'ri"
    }
  ]
}`;

        const userPrompt = `${questionCount} ta ${topicDesc} bo'yicha ${diffDesc} darajadagi test savoli yarat. JSON formatida.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 3000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('No content in response');
        }

        const quizData = JSON.parse(content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                quiz: quizData,
                meta: {
                    topic,
                    difficulty,
                    count: quizData.questions?.length || 0,
                    generated_at: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('Quiz generation error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to generate quiz',
                fallback: true
            })
        };
    }
};
