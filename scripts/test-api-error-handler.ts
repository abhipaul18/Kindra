import { handleGemmaApiError } from '../src/lib/gemma/gemmaApiErrorHandler';

function testGemmaApiErrorHandler() {
  console.log('========================================================================');
  console.log(' KINDRA — CENTRALIZED GEMMA API ERROR HANDLER TEST SUITE               ');
  console.log('========================================================================\n');

  const testCases = [
    {
      name: '429 Rate Limit',
      input: { statusCode: 429, message: 'Rate limit exceeded: free-models-per-day' },
      expectedTitle: 'Daily AI Limit Reached',
      expectedMessage: "You've reached today's free AI verification limit. Please try again tomorrow or upgrade the AI service.",
    },
    {
      name: '401 Unauthorized',
      input: { statusCode: 401, message: 'Invalid API Key' },
      expectedTitle: 'Authentication Error',
      expectedMessage: 'The AI verification service could not be authenticated. Please contact support.',
    },
    {
      name: '403 Forbidden',
      input: { statusCode: 403, message: 'Access denied to provider endpoint' },
      expectedTitle: 'Access Denied',
      expectedMessage: 'Your AI verification request was denied.',
    },
    {
      name: '404 Model Not Found',
      input: { statusCode: 404, message: 'No endpoints found for model google/gemma-4' },
      expectedTitle: 'AI Model Unavailable',
      expectedMessage: 'The selected AI model is currently unavailable. Please try again later.',
    },
    {
      name: '500 Internal Server Error',
      input: { statusCode: 500, message: 'Internal Server Error' },
      expectedTitle: 'Verification Service Unavailable',
      expectedMessage: 'The AI service is temporarily unavailable. Please try again shortly.',
    },
    {
      name: 'Network Connection Error',
      input: { name: 'TypeError', message: 'fetch failed' },
      expectedTitle: 'Connection Error',
      expectedMessage: 'Unable to contact the AI verification service. Check your internet connection.',
    },
  ];

  let passed = true;

  testCases.forEach((tc, idx) => {
    console.log(`------------------------------------------------------------------------`);
    console.log(` TEST ${idx + 1}: ${tc.name}`);
    console.log(`------------------------------------------------------------------------`);

    const result = handleGemmaApiError(tc.input);

    const titleMatch = result.title === tc.expectedTitle;
    const msgMatch = result.message === tc.expectedMessage;
    const isSuccess = titleMatch && msgMatch;

    if (!isSuccess) passed = false;

    console.log(`  Mapped Title     : "${result.title}"`);
    console.log(`  Expected Title   : "${tc.expectedTitle}"`);
    console.log(`  Mapped Icon      : "${result.iconName}"`);
    console.log(`  Mapped Action 1  : "${result.primaryActionLabel}"`);
    console.log(`  Mapped Action 2  : "${result.secondaryActionLabel || 'None'}"`);
    console.log(`  Test Result      : ${isSuccess ? '✅ PASSED' : '❌ FAILED'}\n`);
  });

  console.log('========================================================================');
  console.log(' SUMMARY RESULTS                                                        ');
  console.log('========================================================================');
  if (passed) {
    console.log('🎉 ALL API ERROR HANDLER TEST CASES COMPLETED SUCCESSFULLY!');
  } else {
    console.error('❌ API error handler test suite encountered failures!');
    process.exit(1);
  }
}

testGemmaApiErrorHandler();
