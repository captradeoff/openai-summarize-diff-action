---
hide:
    - revision_date
    - revision_history
---

# usage examples

this page provides a variety of examples for using the openai summarize diff action in different scenarios.

## basic examples

### summarize pr changes

the most basic usage is to summarize changes in a pull request and display the result in the workflow logs:

```yaml
name: Summarize PR Changes

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
        uses: captradeoff/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Output explanation
        run: echo "${{ steps.explain.outputs.explanation }}"
```

## github integration examples

### add summary as pr comment

automatically add the generated summary as a comment on the pr:

```yaml
name: Summarize PR Changes and Comment

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
        uses: captradeoff/openai-summarize-diff-action@main
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

### update pr description

add the summary to the pr description instead of as a comment:

```yaml
name: Update PR Description with Summary

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-pr:
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
        uses: captradeoff/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Get PR Description
        id: pr
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const pr = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            return pr.data.body || '';
          result-encoding: string
          
      - name: Update PR Description
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const explanation = process.env.EXPLANATION;
            const currentBody = process.env.CURRENT_BODY;
            
            // Remove old summary if it exists
            let newBody = currentBody.replace(/## 🤖 AI Summary of Changes[\s\S]*?(?=##|$)/, '');
            
            // Add new summary
            newBody = `${newBody}\n\n## 🤖 AI Summary of Changes\n\n${explanation}\n\n`;
            
            await github.rest.pulls.update({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              body: newBody
            });
        env:
          EXPLANATION: ${{ steps.explain.outputs.explanation }}
          CURRENT_BODY: ${{ steps.pr.outputs.result }}
```

## advanced examples

### generate release notes

automatically create release notes when a tag is pushed:

```yaml
name: Generate Release Notes

on:
  push:
    tags:
      - 'v*'

jobs:
  release-notes:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Get previous tag
        id: previoustag
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -z "$PREV_TAG" ]; then
            PREV_TAG=$(git rev-list --max-parents=0 HEAD)
          fi
          echo "PREV_TAG=$PREV_TAG" >> $GITHUB_ENV
          
      - name: Get diff
        id: diff
        run: |
          DIFF=$(git diff $PREV_TAG..HEAD)
          echo "DIFF<<EOF" >> $GITHUB_ENV
          echo "$DIFF" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          
      - name: Generate release notes
        id: notes
        uses: captradeoff/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          examplePostSummary: "Release includes: improved performance, new UI components, and better error handling"
          maxTokens: 100
          maxCharacters: 500
          
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref_name }}
          body: |
            # AI-Generated Release Notes
            
            ${{ steps.notes.outputs.explanation }}
            
            ---
            
            *Generated automatically by OpenAI Summarize Diff Action*
          draft: false
          prerelease: false
```

### custom diff format and filtering

filter the diff to exclude certain files before summarizing:

```yaml
name: Summarize PR with Filtering

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  explain-filtered-diff:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Get filtered diff
        id: diff
        run: |
          git fetch origin ${{ github.event.pull_request.base.ref }}
          # Exclude package-lock.json, node_modules, and build outputs
          DIFF=$(git diff origin/${{ github.event.pull_request.base.ref }}..HEAD -- . ':(exclude)package-lock.json' ':(exclude)node_modules/**' ':(exclude)dist/**')
          echo "DIFF<<EOF" >> $GITHUB_ENV
          echo "$DIFF" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
          
      - name: Explain Diff
        id: explain
        uses: captradeoff/openai-summarize-diff-action@main
        with:
          diff: ${{ env.DIFF }}
          apikey: ${{ secrets.OPENAI_API_KEY }}
          
      - name: Output explanation
        run: echo "${{ steps.explain.outputs.explanation }}"
```

## additional resources

- [configuration options](configuration.md) - learn about all available configuration options
- [api reference](api-reference.md) - detailed information about inputs and outputs
- [development guide](development/index.md) - contribute to this project 