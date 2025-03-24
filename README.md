# openai summarize diff action
[![node.js ci](https://github.com/captradeoff/openai-summarize-diff-action/actions/workflows/node.js.yml/badge.svg)](https://github.com/captradeoff/openai-summarize-diff-action/actions/workflows/node.js.yml)
![github license](https://img.shields.io/github/license/captradeoff/openai-summarize-diff-action)
[![github stars](https://img.shields.io/github/stars/captradeoff/openai-summarize-diff-action?style=social)](https://github.com/captradeoff/openai-summarize-diff-action/stargazers)
[![github forks](https://img.shields.io/github/forks/captradeoff/openai-summarize-diff-action?style=social)](https://github.com/captradeoff/openai-summarize-diff-action/network/members)
[![twitter follow](https://img.shields.io/twitter/follow/captradeoff?style=social)](https://twitter.com/captradeoff)

this github action receives a git diff (e.g., a pr diff) and uses openai to summarize and explain the changes made in that diff in a clear, concise way.

## features

- generates concise explanations of code changes
- customizable output length and style
- easy to integrate into your ci/cd workflow
- now includes comprehensive tests and error handling

## inputs

### `diff`

**required** the diff to be explained.

### `apikey`

**required** your openai api key. get one at [openai platform](https://platform.openai.com/api-keys).

### `examplepostsummary`

**optional** an example summary to guide the model's output style.
default: "update the code with new features: parallelisation, caching, and better error handling"

### `maxtokens`

**optional** maximum number of tokens to generate. default: `30`

### `maxcharacters`

**optional** maximum characters in the generated explanation. default: `140`

## outputs

### `explanation`

the explanation and summary of the diff generated by openai.

## example usage

### to explain the changes made in a pr

```yaml
name: Explain PR Changes

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  explain-diff:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Get PR diff
        id: diff
        run: |
          git fetch origin ${{ github.event.pull_request.base.ref }}
          DIFF=$(git diff origin/${{ github.event.pull_request.base.ref }}..HEAD)
          echo "DIFF<<EOF" >> $GITHUB_ENV
          echo "$DIFF" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          
      - name: Explain Diff
        id: explain
        uses: grey/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Output explanation
        run: echo "${{ steps.explain.outputs.explanation }}"
```

### to explain the changes and post the result as a comment in the pr

```yaml
name: Explain PR Changes and Comment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  explain-diff:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Get PR diff
        id: diff
        run: |
          git fetch origin ${{ github.event.pull_request.base.ref }}
          DIFF=$(git diff origin/${{ github.event.pull_request.base.ref }}..HEAD)
          echo "DIFF<<EOF" >> $GITHUB_ENV
          echo "$DIFF" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          
      - name: Explain Diff
        id: explain
        uses: grey/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Post comment
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const explanation = process.env.EXPLANATION;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 AI Summary of Changes\n\n${explanation}`
            });
        env:
          EXPLANATION: ${{ steps.explain.outputs.explanation }}
```

## local development

### setup

1. clone the repository:
   ```bash
   git clone https://github.com/your-username/openai-summarize-diff-action.git
   cd openai-summarize-diff-action
   ```

2. install dependencies:
   ```bash
   npm install
   ```

3. create a `.env` file with your openai api key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

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

## notes

- this action uses openai's gpt-4o-mini model by default.
- make sure to store your openai api key as a secret in your repository settings.
- the action will ignore library folders to focus on meaningful code changes.

## license

[mit](https://github.com/captradeoff/openai-summarize-diff-action/blob/main/LICENSE)