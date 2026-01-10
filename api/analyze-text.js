// Netlify Function: Text/Document Analysis using OpenAI
// Analyzes uploaded text content and generates insights, summaries, or quiz questions

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
        const { text, action, options } = JSON.parse(event.body);
        
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        if (!text || text.trim().length < 10) {
            throw new Error('Text too short for analysis');
        }

        // Limit text length to avoid token limits
        const maxLength = 8000;
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

        let systemPrompt, userPrompt;

        switch (action) {
            case 'summarize':
                systemPrompt = `Sen professional matn tahlilchisisan. Berilgan matnni qisqa va aniq qilib xulosa qil. O'zbek tilida javob ber.`;
                userPrompt = `Quyidagi matnni 3-5 ta asosiy nuqtada xulosa qil:\n\n${truncatedText}`;
                break;

            case 'quiz':
                const count = options?.count || 5;
                systemPrompt = `Sen ta'lim bo'yicha mutaxassissan. Berilgan matn asosida test savollari yarat.

JSON formatida javob ber:
{
  "questions": [
    {
      "id": 1,
      "question": "Savol",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Tushuntirish"
    }
  ]
}`;
                userPrompt = `Quyidagi matn asosida ${count} ta test savoli yarat:\n\n${truncatedText}`;
                break;

            case 'explain':
                systemPrompt = `Sen o'qituvchisan. Murakkab tushunchalarni oddiy qilib tushuntir. O'zbek tilida javob ber.`;
                userPrompt = `Quyidagi matnni sodda tilda tushuntir, asosiy tushunchalarni ajratib ko'rsat:\n\n${truncatedText}`;
                break;

            case 'flashcards':
                systemPrompt = `Sen flashcard yaratuvchisan. Matndan muhim ma'lumotlarni ajratib, eslab qolish uchun kartochkalar yarat.

JSON formatida javob ber:
{
  "flashcards": [
    {
      "front": "Savol yoki tushuncha",
      "back": "Javob yoki ta'rif"
    }
  ]
}`;
                userPrompt = `Quyidagi matndan 10 ta flashcard yarat:\n\n${truncatedText}`;
                break;

            case 'keywords':
                systemPrompt = `Sen matn tahlilchisisan. Matndagi asosiy kalit so'zlar va tushunchalarni aniqla.

JSON formatida javob ber:
{
  "keywords": ["keyword1", "keyword2"],
  "concepts": [
    {"term": "Tushuncha", "definition": "Ta'rifi"}
  ]
}`;
                userPrompt = `Quyidagi matndan asosiy kalit so'zlar va tushunchalarni ajrat:\n\n${truncatedText}`;
                break;

            default:
                systemPrompt = `Sen yordamchi AI san. Foydalanuvchiga yordam ber. O'zbek tilida javob ber.`;
                userPrompt = `Quyidagi matn haqida ma'lumot ber:\n\n${truncatedText}`;
        }

        const useJsonFormat = ['quiz', 'flashcards', 'keywords'].includes(action);

        const requestBody = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };

        if (useJsonFormat) {
            requestBody.response_format = { type: "json_object" };
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
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

        let result;
        if (useJsonFormat) {
            result = JSON.parse(content);
        } else {
            result = { text: content };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                action,
                result,
                meta: {
                    original_length: text.length,
                    processed_at: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('Analysis error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Analysis failed'
            })
        };
    }
};
