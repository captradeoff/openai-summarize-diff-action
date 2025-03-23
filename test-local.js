require('dotenv').config();
const { generateDiffExplanation } = require('./src/openai');

async function test() {
  const diff = `diff --git a/file.js b/file.js
index 123..456 789
--- a/file.js
+++ b/file.js
@@ -1,3 +1,4 @@
 const a = 1;
+const b = 2;
 const c = 3;`;

  try {
    const explanation = await generateDiffExplanation({
      diff,
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 50,
      maxCharacters: 200
    });
    
    console.log('Explanation:', explanation);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test(); 