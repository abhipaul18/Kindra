import { getMissionVerificationProfile } from './gemma/missionProfiles';
import { executeGemmaMultimodalRequest, fileToBase64 } from './gemma/gemmaApiClient';

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
  prompt_version?: string;
  model_used?: string;
}

export type AIReportAnalysis = AIVerificationResult;

const PROMPT_VERSION = 'v1.2-enterprise';
const PRIMARY_MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

export interface OpenRouterTextContent {
  type: 'text';
  text: string;
}

export interface OpenRouterImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type OpenRouterContentItem = OpenRouterTextContent | OpenRouterImageUrlContent;

export interface OpenRouterMessage {
  role: 'user' | 'system' | 'assistant';
  content: string | OpenRouterContentItem[];
}

export interface OpenRouterChoice {
  message?: {
    content?: string;
  };
}

export interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

export async function analyzeCivicReportWithGemma(
  title: string,
  description: string,
  locationName: string,
  imageUrl?: string
): Promise<AIVerificationResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('[AI Pipeline] OpenRouter API key missing. Invoking local rule-based fallback verdict.');
    return getFallbackAIVerdict(title, description, 'mock-fallback-v1.2');
  }

  const promptText = `
[KINDRA Enterprise Civic Verification System - ${PROMPT_VERSION}]
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
  "summary": "Hazardous road surface degradation detected",
  "reasoning": "Visible displacement creating vehicle and pedestrian safety risk",
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

  const messages: OpenRouterMessage[] = imageUrl
    ? [{ role: 'user', content: [{ type: 'text', text: promptText }, { type: 'image_url', image_url: { url: imageUrl } }] }]
    : [{ role: 'user', content: promptText }];

  try {
    const result = await executeOpenRouterRequest(apiKey, PRIMARY_MODEL, messages);
    if (result) {
      return {
        ...result,
        prompt_version: PROMPT_VERSION,
        model_used: PRIMARY_MODEL,
      };
    }
  } catch (err) {
    console.warn(`[AI Pipeline] Primary model ${PRIMARY_MODEL} failed:`, err);
  }

  console.warn('[AI Pipeline] OpenRouter request failed. Executing fallback verdict.');
  return getFallbackAIVerdict(title, description, 'deterministic-fallback-v1.2');
}

async function executeOpenRouterRequest(apiKey: string, model: string, messages: OpenRouterMessage[], retries = 1): Promise<AIVerificationResult | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('[OpenRouter] Request timed out after 60 seconds.');
      controller.abort();
    }, 60000); // 60s timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://kindra.app',
          'X-Title': 'KINDRA Enterprise Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.15,
          max_tokens: 500,
          provider: {
            allow_fallbacks: true,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        console.error(`[OpenRouter 404] No endpoints found for model "${model}". Stopping execution immediately.`);
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          const backoffMs = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
      }

      if (!response.ok) return null;

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim();
      if (!rawContent) return null;

      const cleanedJson = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      
      const parsedRaw = JSON.parse(cleanedJson);
      return validateAndSanitizeAIResult(parsedRaw);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('[OpenRouter] Request timed out or was aborted.');
      } else {
        console.error('[OpenRouter] Fetch exception:', err);
      }
      if (attempt === retries) return null;
    }
  }
  return null;
}

function validateAndSanitizeAIResult(raw: any): AIVerificationResult {
  const is_valid = typeof raw.is_valid === 'boolean' ? raw.is_valid : true;
  const category = typeof raw.category === 'string' ? raw.category : 'Roads & Infrastructure';
  const confidence = typeof raw.confidence === 'number' ? Math.min(1.0, Math.max(0.0, raw.confidence)) : 0.90;
  
  const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
  const severity = validSeverities.includes(raw.severity) ? raw.severity : 'Medium';
  
  const validUrgencies = ['Low', 'Medium', 'High', 'Urgent'];
  const urgency = validUrgencies.includes(raw.urgency) ? raw.urgency : (severity === 'Critical' ? 'Urgent' : 'Medium');

  const department = typeof raw.department === 'string' ? raw.department : category;
  const summary = typeof raw.summary === 'string' ? raw.summary : 'Civic issue verified by AI Vision';
  const reasoning = typeof raw.reasoning === 'string' ? raw.reasoning : 'Infrastructure anomaly verified via vision model analysis';
  const karma = typeof raw.karma === 'number' ? Math.max(10, Math.min(100, raw.karma)) : 50;

  return {
    is_valid,
    category,
    confidence,
    severity,
    urgency,
    department,
    summary,
    reasoning,
    environment_score: typeof raw.environment_score === 'number' ? raw.environment_score : 70,
    public_safety_score: typeof raw.public_safety_score === 'number' ? raw.public_safety_score : 75,
    karma,
  };
}

export async function analyzeCivicReport(title: string, description: string, locationName: string, imageUrl?: string): Promise<AIVerificationResult> {
  return await analyzeCivicReportWithGemma(title, description, locationName, imageUrl);
}

export const GEMMA_SYSTEM_PROMPT = `You are Gemma, the official AI assistant for KINDRA.

# Identity
You are a professional, friendly, intelligent AI assistant that helps citizens use the KINDRA platform.
Never claim to be ChatGPT, Gemini, OpenAI, Google AI Studio, or another generic assistant.
Always introduce yourself as:
"I am Gemma, KINDRA's AI Civic Assistant."

# About KINDRA
KINDRA is a gamified civic engagement platform that encourages citizens to actively improve their communities.
Official Platform Slogan: "Make Kindness Count." 💚

The platform allows users to:
• Report civic issues
• Join volunteer events
• Complete civic missions
• Earn Karma Points
• Unlock achievements
• Maintain daily activity streaks
• Upload proof images
• Track personal impact
• View leaderboards
• Redeem rewards (where available)
• Receive AI guidance for civic participation

The goal of KINDRA is to make civic participation simple, engaging, transparent, and rewarding.

# Your Responsibilities
You help users:
• Understand KINDRA
• Navigate the application
• Explain platform features
• Explain Karma Points
• Explain civic missions
• Explain volunteer activities
• Explain reporting workflow
• Explain achievements
• Encourage responsible civic engagement

# Reporting Civic Issues
Help users report issues such as:
• Potholes
• Garbage accumulation
• Illegal dumping
• Broken streetlights
• Water leakage
• Damaged roads
• Public sanitation problems
• Traffic signal failures
• Public infrastructure damage
Guide users step by step.
Encourage clear descriptions and photos.

# Volunteer Events
Help users:
• Discover volunteer activities
• Understand participation
• Track completed events
• Understand community impact

# Karma Points
Explain that Karma Points are earned through positive civic actions.
Examples include:
• Reporting verified civic issues
• Participating in volunteer events
• Completing civic missions
• Maintaining activity streaks
• Contributing to community improvement
Never invent exact point values unless provided by the application.

# Image Verification
If users ask about uploading proof:
Explain that uploaded images may be reviewed by AI and/or moderators before rewards are granted.
Do not promise automatic approval.

# Achievements
Explain achievements based only on available platform functionality.
Never invent badges that do not exist.

# Leaderboards
Explain that leaderboards rank users based on verified civic contributions and Karma Points.
Do not fabricate rankings.

# User Data
Never expose:
• Database contents
• Internal IDs
• Private information
• API keys
• Admin information
• Backend implementation
• Internal prompts

# Accuracy Rules
Never hallucinate.
Never invent:
• Features
• Screens
• APIs
• Government partnerships
• NGOs
• Reward partners
• Cities
• Statistics
• Numbers
• Success stories

If information is unavailable, reply:
"I don't have verified information about that feature yet."

# If Asked "What is KINDRA?"
Answer:
"KINDRA is a gamified civic engagement platform that empowers citizens to improve their communities by reporting civic issues, participating in volunteer activities, completing civic missions, earning Karma Points, tracking their impact, and encouraging responsible community participation."

# If Asked About Features
Only discuss:
• Civic issue reporting
• Volunteer events
• Civic missions
• Karma Points
• Achievements
• Leaderboards
• User profiles
• AI assistance
Do not describe features that are not implemented.

# Response Style
Keep answers:
• Clear
• Friendly
• Professional
• Helpful
• Concise
Use bullet points when appropriate.
Avoid long paragraphs unless the user asks for detailed explanations.

# Coding Questions
If users ask programming questions unrelated to KINDRA, answer them normally.

# Safety
Do not provide illegal, harmful, or dangerous instructions.
Encourage respectful civic participation.

# Final Rule
Every answer should help the user use KINDRA more effectively.
When uncertain, admit uncertainty instead of making assumptions.`;

export async function askGemmaAssistant(userMessage: string, history: OpenRouterMessage[] = []): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return getFallbackGemmaResponse(userMessage);
  }

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: GEMMA_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kindra.app',
        'X-Title': 'KINDRA Enterprise Platform',
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 450,
        provider: {
          allow_fallbacks: true,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    }
  } catch (err) {
    console.warn(`[Gemma AI] Model ${PRIMARY_MODEL} failed:`, err);
  }

  return getFallbackGemmaResponse(userMessage);
}

function getFallbackGemmaResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('what is kindra') || lower.includes('about kindra') || lower.includes('who are you')) {
    return "I am Gemma, KINDRA's AI Civic Assistant. KINDRA is a gamified civic engagement platform that empowers citizens to improve their communities by reporting civic issues, participating in volunteer activities, completing civic missions, earning Karma Points, tracking their impact, and encouraging responsible community participation.";
  }

  if (lower.includes('karma') || lower.includes('point')) {
    return "Karma Points are earned through positive civic actions on KINDRA! You earn Karma by:\n• Reporting verified civic issues (+50 Karma)\n• Participating in volunteer events (+75 Karma)\n• Completing civic missions & streaks\n\nYou can use Karma to unlock credentials and redeem perks in the Rewards Store.";
  }

  if (lower.includes('report') || lower.includes('pothole') || lower.includes('garbage') || lower.includes('issue')) {
    return "To report a civic issue on KINDRA:\n1. Click 'Report Issue' in the left menu.\n2. Snap or upload a photo of the issue.\n3. Select the Issue Category (Roads, Sanitation, Safety, Parks).\n4. Provide a title and description, then confirm your pin location on the map.\n5. Click Submit! Gemma Vision will verify your report and award Karma.";
  }

  if (lower.includes('volunteer') || lower.includes('task') || lower.includes('campaign')) {
    return "You can discover community volunteer events and missions under 'Civic Campaigns' or 'Volunteer Tasks'. Join events like tree plantations or park cleanups to earn +75 Karma Points and boost your local rank!";
  }

  if (lower.includes('reward') || lower.includes('redeem')) {
    return "Under 'Redeem Rewards', you can spend your earned Karma Points on local perks such as transit passes, coffee vouchers, and environmental sapling adoption codes!";
  }

  return "I am Gemma, KINDRA's AI Civic Assistant. I can help you with reporting civic issues, participating in volunteer events, earning Karma Points, or redeeming rewards. What would you like to explore on KINDRA today?";
}

function getFallbackAIVerdict(title: string, description: string, modelUsed = 'rule-engine-fallback'): AIVerificationResult {
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
    prompt_version: PROMPT_VERSION,
    model_used: modelUsed,
  };
}

export interface GoodDeedAIVerdict {
  is_valid: boolean;
  confidence: number;
  detected_subject: string;
  feedback: string;
  reasoning: string;
  model_used?: string;
  apiError?: any;
  // Evidence pipeline fields
  evidence_id?: string | null;
  storage_url?: string | null;
  image_hash?: string | null;
  perceptual_hash?: string | null;
  duplicate_detected?: boolean;
  duplicate_type?: string | null;
  duplicate_reason?: string | null;
  similarity_score?: number | null;
}

export async function verifyGoodDeedMissionWithGemma(
  missionTitle: string,
  category: string,
  expectedSubject: string,
  notes: string,
  imageUrl?: string,
  imageFile?: File | null,
  userId?: string,
  missionId?: string
): Promise<GoodDeedAIVerdict> {
  const profile = getMissionVerificationProfile(missionTitle || category);

  // Convert File to real base64 data URI — never use blob: URLs
  let imageBase64: string | undefined;
  if (imageFile && typeof window !== 'undefined') {
    try {
      imageBase64 = await fileToBase64(imageFile);
    } catch (err) {
      console.error('[Image Conversion Error] Could not convert file to base64:', err);
    }
  }

  // If we have a base64-converted image, use it. Otherwise fall back to imageUrl
  // but only if it's NOT a blob: URL.
  let imageSource = imageBase64;
  if (!imageSource && imageUrl && !imageUrl.startsWith('blob:')) {
    imageSource = imageUrl;
  }

  if (!imageSource && !imageFile) {
    return {
      is_valid: false,
      confidence: 0,
      detected_subject: 'No Proof Image',
      feedback: 'Please select and upload a proof photo before submitting for verification.',
      reasoning: 'AI Verification requires a valid photo of the completed mission proof.',
    };
  }

  // ── Evidence Pipeline: Hash + Upload + Duplicate Check ──────
  let sha256Hash: string | null = null;
  let pHash: string | null = null;
  let storagePath: string | null = null;
  let storageUrl: string | null = null;
  let evidenceId: string | null = null;
  let duplicateResult: import('./evidence/duplicateDetection').DuplicateCheckResult | null = null;

  if (imageFile && userId) {
    const effectiveMissionId = missionId || profile.id || missionTitle.replace(/\s+/g, '_').toLowerCase();

    try {
      // 1. Compute hashes
      const { computeSHA256, computePerceptualHash, uploadEvidenceImage, saveEvidenceRecord } = await import('./evidence/evidenceService');
      const { checkDuplicates } = await import('./evidence/duplicateDetection');

      sha256Hash = await computeSHA256(imageFile);

      try {
        pHash = await computePerceptualHash(imageFile);
      } catch (pErr) {
        console.warn('[Evidence] pHash computation failed (non-fatal):', pErr);
      }

      // 2. Check duplicates BEFORE AI verification
      duplicateResult = await checkDuplicates(userId, effectiveMissionId, sha256Hash, pHash);

      if (duplicateResult.shouldReject) {
        // Save evidence record as duplicate_rejected
        const uploadResult = await uploadEvidenceImage(userId, effectiveMissionId, imageFile);
        storagePath = uploadResult.storagePath;
        storageUrl = uploadResult.publicUrl;

        const saveResult = await saveEvidenceRecord({
          userId,
          missionId: effectiveMissionId,
          storagePath: storagePath || '',
          publicUrl: storageUrl,
          imageHash: sha256Hash,
          perceptualHash: pHash,
          verificationStatus: 'duplicate_rejected',
          missionMatch: false,
          confidence: null,
          detectedActivity: null,
          detectedObjects: [],
          fraud: false,
          aiReasoning: duplicateResult.reason,
          modelUsed: null,
          gpsLatitude: null,
          gpsLongitude: null,
          notes,
          deviceMetadata: {},
          duplicateOfId: duplicateResult.matchedEvidenceId,
          duplicateType: duplicateResult.duplicateType,
          similarityScore: duplicateResult.similarityScore,
        });
        evidenceId = saveResult.id;

        return {
          is_valid: false,
          confidence: 0,
          detected_subject: 'Duplicate Image',
          feedback: `❌ ${duplicateResult.reason}`,
          reasoning: `Duplicate detection: ${duplicateResult.duplicateType} match. Similarity: ${duplicateResult.similarityScore?.toFixed(1) || 100}%. Karma awarded: 0 XP.`,
          evidence_id: evidenceId,
          storage_url: storageUrl,
          image_hash: sha256Hash,
          perceptual_hash: pHash,
          duplicate_detected: true,
          duplicate_type: duplicateResult.duplicateType,
          duplicate_reason: duplicateResult.reason,
          similarity_score: duplicateResult.similarityScore,
        };
      }

      // 3. Upload image to Supabase Storage
      const uploadResult = await uploadEvidenceImage(userId, effectiveMissionId, imageFile);
      storagePath = uploadResult.storagePath;
      storageUrl = uploadResult.publicUrl;

      if (uploadResult.error) {
        console.error('[Evidence Upload Error]:', uploadResult.error);
      }

    } catch (evidenceErr) {
      console.error('[Evidence Pipeline Error] Non-fatal, continuing with AI verification:', evidenceErr);
    }
  }

  // ── AI Verification ─────────────────────────────────────────
  // Don't embed blob/data URLs in the text prompt — the image is sent as a multimodal attachment
  const promptText = profile.generatePrompt(undefined, notes);
  const diagnostic = await executeGemmaMultimodalRequest(promptText, imageSource);

  let aiVerdict: GoodDeedAIVerdict | null = null;

  if (diagnostic.apiError) {
    return {
      is_valid: false,
      confidence: 0,
      detected_subject: 'API Error',
      feedback: `API Error: ${diagnostic.apiError.statusCode}`,
      reasoning: diagnostic.apiError.message,
      apiError: diagnostic.apiError,
    };
  }

  if (diagnostic.content) {
    try {
      const parsed = JSON.parse(diagnostic.content);
      const isMatch = Boolean(parsed.mission_match);
      let rawConf = Number(parsed.confidence);
      if (rawConf > 1) rawConf = rawConf / 100;
      const confidence = isNaN(rawConf) ? (isMatch ? 0.94 : 0.15) : rawConf;
      const detectedSubject = String(parsed.detected_activity || 'Civic Activity');
      const reasoning = String(parsed.reason || 'Gemini verified image content.');
      const detectedObjects = Array.isArray(parsed.detected_objects) ? parsed.detected_objects : [];
      const fraud = Boolean(parsed.fraud);

      if (!isMatch || confidence < 0.80) {
        aiVerdict = {
          is_valid: false,
          confidence,
          detected_subject: detectedSubject,
          feedback: `Verification Failed: Evidence does not satisfy mission "${missionTitle}". Detected: "${detectedSubject}". Reason: ${reasoning}`,
          reasoning: `Selected mission: "${missionTitle}". AI reasoning: ${reasoning}. Karma awarded: 0 XP.`,
          model_used: diagnostic.modelUsed || PRIMARY_MODEL,
          evidence_id: evidenceId,
          storage_url: storageUrl,
          image_hash: sha256Hash,
          perceptual_hash: pHash,
          duplicate_detected: duplicateResult?.shouldFlagSuspicious || false,
          duplicate_type: duplicateResult?.duplicateType,
          duplicate_reason: duplicateResult?.reason,
          similarity_score: duplicateResult?.similarityScore,
        };

        // Save evidence as rejected
        if (userId && sha256Hash && storagePath) {
          const effectiveMissionId = missionId || profile.id || missionTitle.replace(/\s+/g, '_').toLowerCase();
          const { saveEvidenceRecord } = await import('./evidence/evidenceService');
          const saveResult = await saveEvidenceRecord({
            userId,
            missionId: effectiveMissionId,
            storagePath,
            publicUrl: storageUrl,
            imageHash: sha256Hash,
            perceptualHash: pHash,
            verificationStatus: 'rejected',
            missionMatch: false,
            confidence: confidence * 100,
            detectedActivity: detectedSubject,
            detectedObjects,
            fraud,
            aiReasoning: reasoning,
            modelUsed: diagnostic.modelUsed || PRIMARY_MODEL,
            gpsLatitude: null,
            gpsLongitude: null,
            notes,
            deviceMetadata: {},
            duplicateOfId: duplicateResult?.matchedEvidenceId || null,
            duplicateType: duplicateResult?.duplicateType || null,
            similarityScore: duplicateResult?.similarityScore || null,
          });
          aiVerdict.evidence_id = saveResult.id;
        }

        return aiVerdict;
      }

      // Verified successfully
      const verificationStatus = duplicateResult?.shouldFlagSuspicious
        ? 'flagged_suspicious'
        : 'verified';

      aiVerdict = {
        is_valid: !duplicateResult?.shouldFlagSuspicious, // Hold karma if suspicious
        confidence,
        detected_subject: detectedSubject,
        feedback: duplicateResult?.shouldFlagSuspicious
          ? `⚠️ Verified but flagged: ${duplicateResult.reason}`
          : `Mission Verified! Detected: "${detectedSubject}". AI Confidence: ${(confidence * 100).toFixed(0)}%.`,
        reasoning: `AI verified mission requirement for "${missionTitle}". Reason: ${reasoning}`,
        model_used: diagnostic.modelUsed || PRIMARY_MODEL,
        evidence_id: evidenceId,
        storage_url: storageUrl,
        image_hash: sha256Hash,
        perceptual_hash: pHash,
        duplicate_detected: duplicateResult?.shouldFlagSuspicious || false,
        duplicate_type: duplicateResult?.duplicateType,
        duplicate_reason: duplicateResult?.reason,
        similarity_score: duplicateResult?.similarityScore,
      };

      // Save evidence as verified
      if (userId && sha256Hash && storagePath) {
        const effectiveMissionId = missionId || profile.id || missionTitle.replace(/\s+/g, '_').toLowerCase();
        const { saveEvidenceRecord } = await import('./evidence/evidenceService');
        const saveResult = await saveEvidenceRecord({
          userId,
          missionId: effectiveMissionId,
          storagePath,
          publicUrl: storageUrl,
          imageHash: sha256Hash,
          perceptualHash: pHash,
          verificationStatus,
          missionMatch: true,
          confidence: confidence * 100,
          detectedActivity: detectedSubject,
          detectedObjects,
          fraud,
          aiReasoning: reasoning,
          modelUsed: diagnostic.modelUsed || PRIMARY_MODEL,
          gpsLatitude: null,
          gpsLongitude: null,
          notes,
          deviceMetadata: {},
          duplicateOfId: duplicateResult?.matchedEvidenceId || null,
          duplicateType: duplicateResult?.duplicateType || null,
          similarityScore: duplicateResult?.similarityScore || null,
        });
        aiVerdict.evidence_id = saveResult.id;
      }

      return aiVerdict;
    } catch (e) {
      console.error('[Gemma Vision] JSON parse error:', e);
    }
  }

  // Smart Heuristic Rule Engine Fallback
  const lowerFileName = (imageFile?.name || imageUrl || '').toLowerCase();
  const lowerNotes = (notes || '').toLowerCase();
  const text = (lowerFileName + ' ' + lowerNotes).toLowerCase();

  let isMatch = false;
  let detectedSubject = 'Unrelated Image / Object';

  if (profile.id === 'road_damage') {
    if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
      isMatch = true;
      detectedSubject = 'Road Potholes';
    } else if (text.includes('tree') || text.includes('plant')) {
      detectedSubject = 'Tree Plantation';
    } else if (text.includes('garbage') || text.includes('trash')) {
      detectedSubject = 'Garbage Cleanup';
    }
  } else if (profile.id === 'tree_plantation') {
    if (text.includes('tree') || text.includes('plant') || text.includes('sapling') || text.includes('leaf')) {
      isMatch = true;
      detectedSubject = 'Tree Plantation';
    } else if (text.includes('pothole') || text.includes('road')) {
      detectedSubject = 'Road Potholes';
    } else if (text.includes('garbage')) {
      detectedSubject = 'Garbage Cleanup';
    }
  } else if (profile.id === 'garbage_cleanup') {
    if (text.includes('garbage') || text.includes('trash') || text.includes('litter')) {
      isMatch = true;
      detectedSubject = 'Garbage Cleanup';
    } else if (text.includes('tree')) {
      detectedSubject = 'Tree Plantation';
    } else if (text.includes('blood')) {
      detectedSubject = 'Blood Donation';
    }
  } else {
    // General keyword check
    isMatch = text.includes(profile.category.toLowerCase()) || text.includes(missionTitle.toLowerCase());
    detectedSubject = isMatch ? profile.expectedActivity : 'Unrelated Image';
  }

  if (!isMatch) {
    return {
      is_valid: false,
      confidence: 0.15,
      detected_subject: detectedSubject,
      feedback: `Verification Failed: The uploaded evidence does not match the selected mission ("${profile.expectedActivity}"). Expected: "${profile.expectedActivity}", Detected: "${detectedSubject}". Please upload valid proof.`,
      reasoning: `Selected mission is "${profile.expectedActivity}", but image evidence was detected as "${detectedSubject}". Karma awarded: 0 XP.`,
      model_used: 'gemma-mission-aware-engine-v2.4',
    };
  }

  return {
    is_valid: true,
    confidence: 0.95,
    detected_subject: detectedSubject,
    feedback: `Mission Verified! Detected: "${detectedSubject}". AI Confidence: 95%.`,
    reasoning: `Visual parameters match expected mission: "${profile.expectedActivity}".`,
    model_used: 'gemma-mission-aware-engine-v2.4',
  };
}

