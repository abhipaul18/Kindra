export interface UserFriendlyApiError {
  statusCode: number | 'NETWORK_ERROR';
  title: string;
  message: string;
  iconName: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  rawErrorLog?: string;
}

export function handleGemmaApiError(
  errorInput: any,
  rawResponseBody?: any
): UserFriendlyApiError {
  // Always log complete raw OpenRouter JSON response to browser/server console for developer debugging
  console.error('====================================================');
  console.error('[Developer Console - Gemma OpenRouter Raw Error Debug]');
  console.error('Error Input:', errorInput);
  if (rawResponseBody) {
    console.error('Raw Response Body:', JSON.stringify(rawResponseBody, null, 2));
  }
  console.error('====================================================');

  let statusCode: number | 'NETWORK_ERROR' = 500;

  if (typeof errorInput === 'number') {
    statusCode = errorInput;
  } else if (errorInput?.statusCode) {
    statusCode = Number(errorInput.statusCode) || 500;
  } else if (errorInput?.status) {
    statusCode = Number(errorInput.status) || 500;
  } else if (
    errorInput?.message?.includes('NetworkError') ||
    errorInput?.message?.includes('fetch failed') ||
    errorInput?.message?.includes('Timeout') ||
    errorInput?.message?.includes('ECONNREFUSED') ||
    errorInput?.name === 'TypeError'
  ) {
    statusCode = 'NETWORK_ERROR';
  }

  // 1. 429 Rate Limit
  if (statusCode === 429) {
    return {
      statusCode: 429,
      title: 'Daily AI Limit Reached',
      message: "You've reached today's free AI verification limit. Please try again tomorrow or upgrade the AI service.",
      iconName: 'schedule',
      primaryActionLabel: 'Retry Later',
      secondaryActionLabel: 'Close',
      rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : '429 Rate Limit',
    };
  }

  // 2. 401 Unauthorized
  if (statusCode === 401) {
    return {
      statusCode: 401,
      title: 'Authentication Error',
      message: 'The AI verification service could not be authenticated. Please contact support.',
      iconName: 'vpn_key',
      primaryActionLabel: 'Close',
      secondaryActionLabel: 'Contact Support',
      rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : '401 Unauthorized',
    };
  }

  // 3. 403 Forbidden
  if (statusCode === 403) {
    return {
      statusCode: 403,
      title: 'Access Denied',
      message: 'Your AI verification request was denied.',
      iconName: 'block',
      primaryActionLabel: 'Close',
      rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : '403 Forbidden',
    };
  }

  // 4. 404 Model Not Found
  if (statusCode === 404) {
    return {
      statusCode: 404,
      title: 'AI Model Unavailable',
      message: 'The selected AI model is currently unavailable. Please try again later.',
      iconName: 'cloud_off',
      primaryActionLabel: 'Retry Later',
      secondaryActionLabel: 'Close',
      rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : '404 Model Not Found',
    };
  }

  // 5. Network / Timeout Error
  if (statusCode === 'NETWORK_ERROR') {
    return {
      statusCode: 'NETWORK_ERROR',
      title: 'Connection Error',
      message: 'Unable to contact the AI verification service. Check your internet connection.',
      iconName: 'wifi_off',
      primaryActionLabel: 'Retry Connection',
      secondaryActionLabel: 'Close',
      rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : 'Network Connection Error',
    };
  }

  // 6. 500 / 502 / 503 / 504 Server Error (Default Fallback)
  return {
    statusCode: typeof statusCode === 'number' ? statusCode : 500,
    title: 'Verification Service Unavailable',
    message: 'The AI service is temporarily unavailable. Please try again shortly.',
    iconName: 'dns',
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Close',
    rawErrorLog: typeof errorInput === 'object' ? errorInput?.message : '500 Server Error',
  };
}
