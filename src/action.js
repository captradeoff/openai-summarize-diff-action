const core = require('@actions/core');
const { generateDiffExplanation } = require('./openai');

/**
 * Main function to run the GitHub Action
 */
async function run() {
  try {
    // Get inputs from GitHub Action
    const diff = core.getInput('diff', { required: true });
    const apiKey = core.getInput('apikey', { required: true });
    const examplePostSummary = core.getInput('examplePostSummary', { required: false });
    const maxTokensInput = core.getInput('maxTokens', { required: false });
    const maxCharactersInput = core.getInput('maxCharacters', { required: false });
    
    // Parse numeric inputs with better validation
    let maxTokens = 30; // Default value
    if (maxTokensInput) {
      const parsedTokens = parseInt(maxTokensInput);
      if (isNaN(parsedTokens)) {
        throw new Error('maxTokens must be a valid number');
      }
      maxTokens = parsedTokens;
    }
    
    let maxCharacters = 140; // Default value
    if (maxCharactersInput) {
      const parsedChars = parseInt(maxCharactersInput);
      if (isNaN(parsedChars)) {
        throw new Error('maxCharacters must be a valid number');
      }
      maxCharacters = parsedChars;
    }
    
    // Generate explanation
    const explanation = await generateDiffExplanation({
      diff,
      apiKey,
      examplePostSummary,
      maxTokens,
      maxCharacters
    });
    
    // Set output
    core.setOutput('explanation', explanation);
    console.log('Explanation generated successfully');
    
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

module.exports = { run }; 