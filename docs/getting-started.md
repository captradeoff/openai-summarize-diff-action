---
hide:
    - revision_date
    - revision_history
---

# getting started

this guide will help you quickly set up and configure the openai summarize diff action in your github workflow.

## prerequisites

- a github repository where you want to implement this action
- an openai api key (get one at [openai platform](https://platform.openai.com/api-keys))

## basic setup

### step 1: add your openai api key as a secret

1. navigate to your github repository
2. go to **settings** > **secrets and variables** > **actions**
3. click **new repository secret**
4. name: `OPENAI_API_KEY`
5. value: your openai api key
6. click **add secret**

### step 2: create a workflow file

create a new file in `.github/workflows/summarize-diff.yml` with the following content:

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

that's it! now when a pull request is opened or updated, this action will generate a summary of the changes.

## common customizations

### adding comment to pr

to automatically add the summary as a comment on your pr:

```yaml
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

### custom output formatting

you can customize how the explanation is generated:

```yaml
- name: Explain Diff
  id: explain
  uses: captradeoff/openai-summarize-diff-action@main
  with:
    diff: ${{ env.DIFF }}
    apikey: ${{ secrets.OPENAI_API_KEY }}
    examplePostSummary: "feat: added new login system with improved security"
    maxTokens: 50
    maxCharacters: 200
```

## tips for best results

1. **keep diffs focused**: the action works best with focused changes rather than massive refactorings
2. **use concise example summaries**: the `examplePostSummary` parameter helps guide the style of output
3. **handle large repositories**: for very large repositories, consider using shallow clones to speed up the action

## next steps

- [📘 usage examples](examples.md) - see more examples of the action in use
- [🛠️ configuration options](configuration.md) - learn all the configuration options
- [🧩 api reference](api-reference.md) - detailed information about inputs and outputs 
- [🔍 troubleshooting](development/troubleshooting.md) - solutions for common issues 