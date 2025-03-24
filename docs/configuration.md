---
hide:
    - revision_date
    - revision_history
---

# configuration options

this page documents all the configuration options available for the openai summarize diff action.

## input parameters

the action accepts the following inputs, which can be specified in your workflow file:

| parameter | required | default | description |
|-----------|----------|---------|-------------|
| `diff` | yes | - | the git diff to be explained. typically generated via `git diff` command. |
| `apikey` | yes | - | your openai api key. should be stored as a secret. |
| `examplePostSummary` | no | "update the code with new features: parallelisation, caching, and better error handling" | an example summary to guide the model's output style. |
| `maxTokens` | no | 30 | maximum number of tokens to generate. this affects the length of the generated explanation. |
| `maxCharacters` | no | 140 | maximum characters in the generated explanation. useful for ensuring the explanation fits in limited spaces. |

## detailed parameter information

### `diff`

the git diff to be explained. this should be the output from a git diff command. you'll typically generate this in your workflow using a command like:

```bash
git diff origin/${{ github.event.pull_request.base.ref }}..HEAD
```

the diff should be provided in the standard git diff format:

```diff
diff --git a/file.js b/file.js
index 123..456 789
--- a/file.js
+++ b/file.js
@@ -1,3 +1,4 @@
 const a = 1;
+const b = 2;
 const c = 3;
```

### `apikey`

your openai api key. this should be stored as a github repository secret and referenced in your workflow like this:

```yaml
apikey: ${{ secrets.OPENAI_API_KEY }}
```

never hardcode your api key directly in the workflow file.

### `examplePostSummary`

an example summary to guide the model's output style. this helps the openai model understand the tone, format, and style you want for the generated explanation.

examples:

- `"feat: added user authentication and improved error handling"`
- `"fix: resolved memory leak in data processing pipeline"`
- `"refactor: simplified API response handling for better maintainability"`

### `maxTokens`

maximum number of tokens to generate. openai models use tokens, which are chunks of text (roughly 4 characters per token in english). this parameter limits the length of the generated explanation.

recommended values:
- short summaries: 20-30
- medium explanations: 50-100
- detailed explanations: 100-200

note that higher values may result in higher api costs.

### `maxCharacters`

maximum characters in the generated explanation. this parameter ensures the explanation fits within specific character limits (like tweet length, commit message limits, etc.)

recommended values:
- tweet-like: 140-280
- commit message: ~50-72
- pr comment: 500-1000

## output parameters

| parameter | description |
|-----------|-------------|
| `explanation` | the generated explanation of the diff. |

## usage examples

### basic usage

```yaml
- name: Explain Diff
  id: explain
  uses: captradeoff/openai-summarize-diff-action@main
  with:
    diff: ${{ env.DIFF }}
    apikey: ${{ secrets.OPENAI_API_KEY }}
```

### custom summary style

```yaml
- name: Explain Diff
  id: explain
  uses: captradeoff/openai-summarize-diff-action@main
  with:
    diff: ${{ env.DIFF }}
    apikey: ${{ secrets.OPENAI_API_KEY }}
    examplePostSummary: "feat: updated api with improved performance and better error messages"
```

### longer output

```yaml
- name: Explain Diff
  id: explain
  uses: captradeoff/openai-summarize-diff-action@main
  with:
    diff: ${{ env.DIFF }}
    apikey: ${{ secrets.OPENAI_API_KEY }}
    maxTokens: 100
    maxCharacters: 500
```

## using the output

you can use the `explanation` output in subsequent steps:

```yaml
- name: Output explanation
  run: echo "${{ steps.explain.outputs.explanation }}"
```

or add it as a pr comment:

```yaml
- name: Post comment
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## 🤖 AI Summary of Changes\n\n${{ steps.explain.outputs.explanation }}`
      });
```

## best practices

1. **store api keys securely**: always use github secrets for your openai api key.
2. **optimize token usage**: use the minimum number of tokens needed to get a good summary to minimize costs.
3. **provide example summaries**: for more consistent results, provide example summaries that match your desired style.
4. **filter large diffs**: consider filtering out large auto-generated files from diffs for better results.
5. **handle error cases**: add error handling in your workflow for cases where the openai api might fail. 