const { OpenAI } = require('openai');

/**
 * Creates an OpenAI client
 * @param {string} apiKey - The OpenAI API key
 * @returns {OpenAI} - The OpenAI client
 */
function createOpenAIClient(apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  return new OpenAI({
    apiKey: apiKey
  });
}

/**
 * Generates an explanation of a Git diff using OpenAI
 * @param {Object} params - Parameters for the explanation
 * @param {string} params.diff - The Git diff to explain
 * @param {string} params.apiKey - The OpenAI API key
 * @param {string} params.examplePostSummary - Example summary to guide the model
 * @param {number} params.maxTokens - Maximum tokens to generate
 * @param {number} params.maxCharacters - Maximum characters in the explanation
 * @returns {Promise<string>} - The generated explanation
 */
async function generateDiffExplanation({
  diff,
  apiKey,
  examplePostSummary = 'update the code with new features: parallelisation, caching, and better error handling',
  maxTokens = 30,
  maxCharacters = 140
}) {
  if (!diff) {
    throw new Error('Diff is required');
  }
  
  const openai = createOpenAIClient(apiKey);
  
  try {
    // Format the system message to be more readable while staying within line length limits
    const systemMessage = 
      'you are an x.com tpot poster that explains git diffs in a clear and concise way ' +
      `in all lowercase under ${maxCharacters} characters. ` + 
      `here's an example post summary:\n\n${examplePostSummary}`;

    // Format the user message to be more readable
    const userMessage = 
      'please explain the changes in the following diff, while ignoring any ' +
      `libraries folders that were added:\n\n${diff}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.5
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
}

module.exports = {
  createOpenAIClient,
  generateDiffExplanation
}; 