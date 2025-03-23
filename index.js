const core = require('@actions/core');
const { OpenAI } = require('openai');

async function run() {
  try {
    // Get inputs
    const diff = core.getInput('diff', { required: true });
    const apiKey = core.getInput('apikey', { required: true });
    
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
          content: "you are an x.com poster that explains git diffs in a clear and concise way in all lowercase under 250 characters."
        },
        {
          role: "user",
          content: `please explain the changes in the following diff, while ignoring any libraries folders that were added:\n\n${diff}`
        }
      ],
      max_tokens: 250,
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
