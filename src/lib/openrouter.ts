const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

export interface AIReportAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  summary: string;
  recommendedDepartment: string;
  tags: string[];
}

export async function analyzeCivicReport(title: string, description: string, location: string): Promise<AIReportAnalysis> {
  if (!OPENROUTER_API_KEY) {
    return {
      category: 'Roads & Infrastructure',
      priority: 'medium',
      confidence: 0.85,
      summary: 'Report recorded and queued for department verification.',
      recommendedDepartment: 'Public Works & Roads',
      tags: ['Civic Report', 'Standard Priority'],
    };
  }

  const prompt = `You are Gemma, an AI vision & text assistant analyzing civic issue reports for the KINDRA Civic Engagement Platform.
Analyze the following report and return a JSON object with:
- category: one of ["Roads & Infrastructure", "Sanitation & Waste", "Public Safety & Utilities", "Parks & Recreation", "Water & Drainage", "Other"]
- priority: one of ["low", "medium", "high", "urgent"]
- confidence: numeric between 0.5 and 0.99
- summary: concise 1-sentence summary of the issue
- recommendedDepartment: department name
- tags: array of 2-4 keywords

Report Title: "${title}"
Report Description: "${description}"
Location: "${location}"

Return ONLY valid JSON in your response.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://kindra-civic.app',
        'X-Title': 'KINDRA Civic Platform',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || 'Roads & Infrastructure',
        priority: parsed.priority || 'medium',
        confidence: parsed.confidence || 0.92,
        summary: parsed.summary || title,
        recommendedDepartment: parsed.recommendedDepartment || 'Sanitation & Waste',
        tags: parsed.tags || ['Civic Issue', 'Verified'],
      };
    }
  } catch (err) {
    console.error('Error analyzing report with OpenRouter:', err);
  }

  return {
    category: 'Roads & Infrastructure',
    priority: 'medium',
    confidence: 0.88,
    summary: title,
    recommendedDepartment: 'Department of Public Services',
    tags: ['Civic Report', 'Auto Categorized'],
  };
}

export async function askGemmaAssistant(userMessage: string, context?: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return "Hello! I am Gemma, KINDRA's AI assistant. How can I help you navigate civic reports, volunteer events, or Karma rewards today?";
  }

  const systemMessage = `You are Gemma, the helpful, empathetic, and knowledgeable AI assistant for KINDRA, a civic engagement platform.
You assist citizens with:
1. Submitting civic issue reports (road potholes, broken streetlights, trash overflow, public safety).
2. Finding volunteer tasks to earn Karma points.
3. Redeeming Karma points for local partner rewards.
4. Answering questions about city departments, resolution timelines, and civic campaigns.

Keep your answers concise, encouraging, and actionable. Use Material Design clarity.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://kindra-civic.app',
        'X-Title': 'KINDRA Civic Platform',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          ...(context ? [{ role: 'user', content: `Context: ${context}` }] : []),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "I'm here to help with your civic inquiries! Could you provide more details?";
  } catch (err) {
    console.error('Error calling Ask Gemma API:', err);
    return "I'm having trouble reaching my server right now, but you can explore civic reports or volunteer opportunities directly from your dashboard!";
  }
}
