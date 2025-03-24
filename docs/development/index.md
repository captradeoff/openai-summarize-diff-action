---
hide:
    - revision_date
    - revision_history
---

# development guide

this guide provides information for developers who want to contribute to the openai summarize diff action or understand its inner workings.

## overview

the openai summarize diff action is a github action that uses openai's apis to generate human-readable explanations of code changes. this document covers local development setup, testing, and contribution guidelines.

## local development setup

to set up your development environment:

1. clone the repository:
   ```bash
   git clone https://github.com/captradeoff/openai-summarize-diff-action.git
   cd openai-summarize-diff-action
   ```

2. install dependencies:
   ```bash
   npm install
   ```

3. set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your OpenAI API key
   ```

## project structure

the project is organized as follows:

```
openai-summarize-diff-action/
├── .github/           # GitHub workflows and configuration
├── dist/              # Compiled JavaScript (don't edit directly)
├── src/               # Source code
│   ├── index.js       # Main entry point
│   ├── openai.js      # OpenAI API integration
│   └── utils.js       # Utility functions
├── tests/             # Test files
├── docs/              # Documentation
├── action.yml         # GitHub Action definition
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## development workflow

### testing

run tests:
```bash
npm test
```

run tests with coverage:
```bash
npm run test:coverage
```

run tests in watch mode (useful during development):
```bash
npm run test:watch
```

### linting

run linting:
```bash
npm run lint
```

### building

build the action:
```bash
npm run build
```

this will run linting, tests, and then build the action into the `dist` directory.

### manual testing

you can test the action locally by creating a test script:

```javascript
// test-local.js
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
```

run the test script:
```bash
node test-local.js
```

## creating a release

to create a new release:

1. update the version in package.json
2. update the changelog.md file
3. commit and push your changes
4. create a new release on github with a new tag (e.g., v1.0.0)

## additional resources

- [architecture documentation](architecture.md) - understand the codebase structure
- [troubleshooting guide](troubleshooting.md) - solutions for common issues
- [contributing guidelines](../contributing.md) - how to contribute effectively

## getting help

if you encounter issues during development, please:

1. check the [troubleshooting guide](troubleshooting.md)
2. search for existing issues in the github repository
3. create a new issue if your problem hasn't been reported yet 