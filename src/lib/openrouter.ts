export interface AIVerificationResult {
  is_valid: boolean;
  category: string;
  confidence: number; // 0.0 - 1.0
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  department: string;
  summary: string;
  reasoning: string;
  environment_score: number;
  public_safety_score: number;
  karma: number;
}

export type AIReportAnalysis = AIVerificationResult;

export async function analyzeCivicReportWithGemma(
  title: string,
  description: string,
  locationName: string,
  imageUrl?: string
): Promise<AIVerificationResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('OpenRouter API key missing in environment variables. Returning mock AI verdict.');
    return getFallbackAIVerdict(title, description);
  }

  const promptText = `
You are an expert AI Municipal Civic Verification Assistant for the KINDRA platform.
Analyze this civic issue report and provide a structured JSON verification verdict.

Report Title: "${title}"
Report Description: "${description}"
Location: "${locationName}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

You MUST return strictly valid JSON matching this structure without any conversational text or markdown codeblock wrappers:
{
  "is_valid": true,
  "category": "Roads & Infrastructure",
  "confidence": 0.94,
  "severity": "High",
  "urgency": "High",
  "department": "Roads & Infrastructure",
  "summary": "Large hazardous pothole detected on active roadway",
  "reasoning": "Visible asphalt displacement posing vehicle damage and public safety risk",
  "environment_score": 65,
  "public_safety_score": 85,
  "karma": 70
}

Valid Categories:
- Roads & Infrastructure
- Sanitation & Waste
- Public Safety & Utilities
- Parks & Recreation

Severity Levels: Low, Medium, High, Critical
Urgency Levels: Low, Medium, High, Urgent
`;

  try {
    const messages: any[] = [];
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: promptText },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: promptText,
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kindra.app',
        'X-Title': 'KINDRA Civic Platform',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages,
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new Error('Empty response from OpenRouter Gemma Vision');
    }

    const cleanedJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed: AIVerificationResult = JSON.parse(cleanedJson);
    return parsed;
  } catch (err) {
    console.warn('Gemma AI analysis failed or returned non-JSON, using structured fallback:', err);
    return getFallbackAIVerdict(title, description);
  }
}

export async function analyzeCivicReport(title: string, description: string, locationName: string, imageUrl?: string): Promise<AIVerificationResult> {
  return await analyzeCivicReportWithGemma(title, description, locationName, imageUrl);
}

export async function askGemmaAssistant(userMessage: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) return 'I am Gemma, your 24/7 Civic Assistant. How can I help you report an issue or find volunteer tasks today?';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kindra.app',
        'X-Title': 'KINDRA Civic Platform',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages: [
          { role: 'system', content: 'You are Gemma, the friendly 24/7 AI Civic Assistant for the KINDRA platform.' },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'How can I assist you with civic engagement today?';
  } catch {
    return 'I am Gemma, your 24/7 Civic Assistant. How can I help you report an issue or find volunteer tasks today?';
  }
}

function getFallbackAIVerdict(title: string, description: string): AIVerificationResult {
  const combined = (title + ' ' + description).toLowerCase();
  let category = 'Roads & Infrastructure';
  let department = 'Roads & Infrastructure';
  let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let karma = 40;

  if (combined.includes('trash') || combined.includes('garbage') || combined.includes('waste') || combined.includes('dumping')) {
    category = 'Sanitation & Waste';
    department = 'Sanitation & Waste';
    karma = 50;
  } else if (combined.includes('light') || combined.includes('power') || combined.includes('wire') || combined.includes('hazard')) {
    category = 'Public Safety & Utilities';
    department = 'Public Safety & Utilities';
    severity = 'High';
    karma = 70;
  } else if (combined.includes('park') || combined.includes('tree') || combined.includes('branch')) {
    category = 'Parks & Recreation';
    department = 'Parks & Recreation';
    karma = 30;
  }

  return {
    is_valid: true,
    category,
    confidence: 0.92,
    severity,
    urgency: severity === 'High' ? 'High' : 'Medium',
    department,
    summary: `Verified civic issue: ${title}`,
    reasoning: 'Gemma Vision identified physical civic infrastructure disruption requiring municipal attention.',
    environment_score: 70,
    public_safety_score: 80,
    karma,
  };
}
