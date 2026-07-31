export interface OpenRouterDiagnosticResult {
  content: string | null;
  modelUsed?: string;
  apiError?: {
    statusCode: number;
    statusText: string;
    endpoint: string;
    model: string;
    message: string;
  };
}

/**
 * Convert a browser File or Blob into a proper Base64 Data URL
 * (e.g. "data:image/jpeg;base64,/9j/4AAQSk...").
 *
 * This is the ONLY correct way to prepare an uploaded image for OpenRouter.
 * Never send blob: URLs — they are local browser references that the API cannot access.
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log('[Image Base64 Conversion]');
      console.log('  File Name  :', (file as File).name || 'Blob');
      console.log('  MIME Type  :', file.type || 'unknown');
      console.log('  Base64 Len :', result.length);
      console.log('  First 50ch :', result.substring(0, 50));
      resolve(result);
    };
    reader.onerror = () => reject(new Error('FileReader failed to read image'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate and normalize an image string for OpenRouter's `image_url.url` field.
 *
 * - Accepts: `data:image/...;base64,...` or `https://...` URLs.
 * - Rejects: `blob:` URLs (they are browser-local and cannot be decoded by the API).
 */
export function normalizeImageToDataUrl(imageInput?: string): string | undefined {
  if (!imageInput) return undefined;

  // Reject blob: URLs — they MUST be converted to base64 before reaching here
  if (imageInput.startsWith('blob:')) {
    console.error('[Image Validation FAILED] Received a blob: URL. This is a browser-local reference and cannot be sent to OpenRouter.');
    console.error('  Received:', imageInput);
    return undefined;
  }

  // Already a valid data URI or remote URL
  if (imageInput.startsWith('data:image/') || imageInput.startsWith('https://') || imageInput.startsWith('http://')) {
    return imageInput;
  }

  // Bare base64 string — wrap it in a JPEG data URI
  return `data:image/jpeg;base64,${imageInput}`;
}

/**
 * Send a multimodal (text + optional image) request directly to OpenRouter.
 *
 * - No local model whitelist — every configured model is sent to the API.
 * - If OpenRouter rejects the model or payload, the raw API error is captured
 *   and returned so the UI can display it.
 */
export async function executeGemmaMultimodalRequest(
  promptText: string,
  imageUrl?: string,
  modelOverride?: string
): Promise<OpenRouterDiagnosticResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const endpointUrl = 'https://openrouter.ai/api/v1/chat/completions';

  if (!apiKey) {
    console.warn('[Gemma AI Client] OpenRouter API key missing in environment.');
    return { content: null };
  }

  // Determine single configured primary model — NO multi-model fallback list
  const primaryModel = modelOverride || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
  const models = [primaryModel];

  let lastApiError: OpenRouterDiagnosticResult['apiError'] | undefined;

  for (const model of models) {
    const TIMEOUT_MS = 60000; // 60s timeout for vision models
    const controller = new AbortController();
    let isTimedOut = false;

    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      console.warn(`[OpenRouter] Request timed out after ${TIMEOUT_MS / 1000} seconds. Aborting request.`);
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const normalizedImage = normalizeImageToDataUrl(imageUrl);

      // Build the multimodal messages array per OpenRouter spec
      const messages: any[] = normalizedImage
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                { type: 'image_url', image_url: { url: normalizedImage } },
              ],
            },
          ]
        : [
            {
              role: 'user',
              content: promptText,
            },
          ];

      const requestHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kindra.app',
        'X-Title': 'KINDRA Gemma Verification Engine',
      };

      const requestBody = {
        model,
        messages,
        temperature: 0.1,
        max_tokens: 600,
        provider: {
          allow_fallbacks: true,
        },
      };

      // ── Debug: Full Request Diagnostics ──────────────────────────
      console.log('====================================================');
      console.log('[OpenRouter Request Diagnostics]');
      console.log('  Selected Model          :', model);
      console.log('  Request URL             :', endpointUrl);
      console.log('  HTTP Method             : POST');
      console.log('  Timeout Configured      :', `${TIMEOUT_MS / 1000}s`);
      console.log('  Fallback Models Chain   : Disabled (Single Model Mode)');
      console.log('  Provider Allow Fallback :', true);
      console.log('  Image Included          :', Boolean(normalizedImage));
      console.log('  Headers (redacted)      :', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [REDACTED]',
        'HTTP-Referer': 'https://kindra.app',
        'X-Title': 'KINDRA Gemma Verification Engine',
      });
      console.log('  Request Body            :', JSON.stringify(requestBody, null, 2));
      console.log('====================================================');

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Read the full response body once
      const rawResponseText = await response.text();

      // ── Debug: Full Response Diagnostics ─────────────────────────
      console.log('====================================================');
      console.log('[OpenRouter Response Received]');
      console.log('  HTTP Status     :', response.status, response.statusText);
      console.log('  Response OK     :', response.ok);
      console.log('  Raw Response    :', rawResponseText);
      console.log('====================================================');

      if (!response.ok) {
        lastApiError = {
          statusCode: response.status,
          statusText: response.statusText,
          endpoint: endpointUrl,
          model,
          message: rawResponseText,
        };

        console.error(`[OpenRouter API Error] Status ${response.status} ${response.statusText} for model "${model}".`);
        if (response.status === 404) {
          console.error(`[OpenRouter 404] No endpoints found for model "${model}". Stopping execution immediately.`);
        }
        // Do NOT retry or loop to fallback models
        break;
      }

      let data: any;
      try {
        data = JSON.parse(rawResponseText);
      } catch {
        console.error('[OpenRouter] Could not parse JSON response:', rawResponseText);
        break;
      }

      const rawContent = data.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        console.error('[OpenRouter] Model returned empty content response.');
        break;
      }

      const cleanedContent = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      return {
        content: cleanedContent,
        modelUsed: model,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error(`[OpenRouter] Request aborted. Reason: ${isTimedOut ? `Timed out after ${TIMEOUT_MS / 1000}s` : 'Cancelled by caller/page unmount'}`);
      } else {
        console.error(`[OpenRouter] Unexpected Error for model ${model}:`, err);
      }

      lastApiError = {
        statusCode: 500,
        statusText: err.name === 'AbortError' ? 'Request Timeout (60s)' : 'Client Fetch Exception',
        endpoint: endpointUrl,
        model,
        message: String(err?.message || err),
      };
    }
  }

  // Return the raw error for the UI to display cleanly
  return {
    content: null,
    apiError: lastApiError,
  };
}
