const core = require('@actions/core');
const { OpenAI } = require('openai');

const defaultExamplePostSummary = "update the code with new features: parallelisation, caching, and better error handling"

async function run() {
  try {
    // Get inputs
    const diff = core.getInput('diff', { required: true });
    const apiKey = core.getInput('apikey', { required: true });
    const examplePostSummary = core.getInput('examplePostSummary', { required: false }) || defaultExamplePostSummary;
    const maxTokens = core.getInput('maxTokens', { required: false }) || 30;
    const maxCharacters = core.getInput('maxCharacters', { required: false }) || 140;
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Make request to OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "you are an x.com tpot poster that explains git diffs in a clear and concise way\
           in all lowercase under " + maxCharacters + " characters. here's an example post summary:\n\n" + examplePostSummary
        },
        {
          role: "user",
          content: `please explain the changes in the following diff, while ignoring any libraries folders that were added:\n\n${diff}`
        }
      ],
      max_tokens: parseInt(maxTokens),
      temperature: 0.5,
    });

    // Extract explanation from response
    const explanation = response.choices[0].message.content.trim();
    
    // Set output
    core.setOutput('explanation', explanation);
    console.log('Explanation generated successfully');
    
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
