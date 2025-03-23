const nock = require('nock');
const { createOpenAIClient, generateDiffExplanation } = require('../src/openai');

// Mock the OpenAI API
beforeEach(() => {
  // Clear all nock interceptors
  nock.cleanAll();
});

afterEach(() => {
  // Ensure all nock interceptors were used
  expect(nock.isDone()).toBe(true);
});

describe('createOpenAIClient', () => {
  test('throws error when no API key is provided', () => {
    expect(() => createOpenAIClient()).toThrow('OpenAI API key is required');
    expect(() => createOpenAIClient('')).toThrow('OpenAI API key is required');
  });

  test('returns OpenAI client when API key is provided', () => {
    const client = createOpenAIClient('test-api-key');
    expect(client).toBeDefined();
  });
});

describe('generateDiffExplanation', () => {
  test('throws error when no diff is provided', async () => {
    await expect(generateDiffExplanation({ apiKey: 'test-api-key' }))
      .rejects.toThrow('Diff is required');
    await expect(generateDiffExplanation({ diff: '', apiKey: 'test-api-key' }))
      .rejects.toThrow('Diff is required');
  });

  test('returns explanation when diff is provided', async () => {
    // Split the diff string to stay within line length limits
    const mockDiff = 'diff --git a/file.js b/file.js\nindex 123..456 789\n' + 
      '--- a/file.js\n+++ b/file.js\n@@ -1,3 +1,4 @@\n ' +
      'const a = 1;\n+const b = 2;\n const c = 3;';
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'added variable b with value 2'
          }
        }
      ]
    };

    // Mock the OpenAI API call
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(200, mockResponse);

    const explanation = await generateDiffExplanation({
      diff: mockDiff,
      apiKey: 'test-api-key'
    });

    expect(explanation).toBe('added variable b with value 2');
  });

  test('handles API errors gracefully', async () => {
    const mockDiff = 'diff --git a/file.js b/file.js\nsome diff content';

    // Mock the OpenAI API call to return an error
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .replyWithError('API rate limit exceeded');

    await expect(generateDiffExplanation({
      diff: mockDiff,
      apiKey: 'test-api-key'
    // Use a more general assertion that checks for the presence of the error message
    })).rejects.toThrow(/Failed to generate explanation/);
  });
}); 