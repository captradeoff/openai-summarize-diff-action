---
hide:
    - revision_date
    - revision_history
---

# Troubleshooting

This guide provides solutions for common issues you might encounter when using or developing with the OpenAI Summarize Diff Action.

## GitHub Action Issues

### Action Fails with "OpenAI API key is required"

**Problem**: The action fails with the error message "OpenAI API key is required."

**Possible causes**:
1. The API key secret is not set in your repository
2. The secret name in your workflow doesn't match the secret name in your repository
3. The `apikey` input parameter is not properly referenced in your workflow file

**Solution**:
1. Check that you've added the OpenAI API key as a secret in your repository:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Verify that your OpenAI API key is added as a secret (e.g., `OPENAI_API_KEY`)

2. Ensure your workflow file correctly references the secret:
   ```yaml
   - name: Explain Diff
     id: explain
     uses: captradeoff/openai-summarize-diff-action@main
     with:
       diff: ${{ env.DIFF }}
       apikey: ${{ secrets.OPENAI_API_KEY }}  # Make sure this matches your secret name
   ```

### Action Fails with "Diff is required"

**Problem**: The action fails with the error message "Diff is required."

**Possible causes**:
1. The diff generation in your workflow is failing
2. The diff is empty (no changes between the compared branches/commits)
3. The environment variable setting is incorrect

**Solution**:
1. Debug your diff generation step by adding an output step:
   ```yaml
   - name: Get PR diff
     id: diff
     run: |
       git fetch origin ${{ github.event.pull_request.base.ref }}
       DIFF=$(git diff origin/${{ github.event.pull_request.base.ref }}..HEAD)
       echo "DIFF<<EOF" >> $GITHUB_ENV
       echo "$DIFF" >> $GITHUB_ENV
       echo "EOF" >> $GITHUB_ENV
       
   - name: Debug diff
     run: echo "${{ env.DIFF }}"
   ```

2. If the diff is empty, check that:
   - There are actual changes between the branches
   - Your Git fetch depth is sufficient (`fetch-depth: 0` is recommended)

### Action Fails with "maxTokens must be a valid number"

**Problem**: The action fails with the error message "maxTokens must be a valid number."

**Possible causes**:
1. The `maxTokens` parameter is provided but contains a non-numeric value
2. There's a syntax error in how the parameter is defined

**Solution**:
1. Ensure the `maxTokens` parameter is a number:
   ```yaml
   maxTokens: 50  # Correct
   ```
   
   Not:
   ```yaml
   maxTokens: "fifty"  # Incorrect
   ```

2. If you're setting it dynamically, ensure it's properly converted to a number.

## OpenAI API Issues

### Action Fails with "Failed to generate explanation: 429 Too Many Requests"

**Problem**: The action fails with a rate limit error from the OpenAI API.

**Possible causes**:
1. You've exceeded your OpenAI API rate limits
2. Your account has billing issues

**Solution**:
1. Implement retry logic in your workflow for transient rate limit issues
2. Check your OpenAI account for any billing or rate limit issues
3. Consider adding a delay between action runs if you're running many in parallel

### Action Returns Empty or Incomplete Explanation

**Problem**: The action runs successfully but returns an empty or truncated explanation.

**Possible causes**:
1. The `maxTokens` parameter is set too low
2. The diff is very complex or large
3. The API response was cut off

**Solution**:
1. Increase the `maxTokens` parameter:
   ```yaml
   maxTokens: 100  # Try a higher value
   ```

2. Increase the `maxCharacters` parameter:
   ```yaml
   maxCharacters: 500  # Allow for longer explanations
   ```

3. For large diffs, consider filtering to focus on meaningful changes.

## Development Environment Issues

### Tests Failing with "Cannot find module 'openai'"

**Problem**: Tests fail with module not found errors.

**Possible causes**:
1. Dependencies are not installed
2. The package has been updated and requires a reinstall

**Solution**:
1. Reinstall dependencies:
   ```bash
   npm ci  # Clean install from package-lock.json
   ```

2. If the issue persists, try deleting node_modules and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

### OpenAI Tests Failing Without API Key

**Problem**: OpenAI integration tests fail when no API key is available.

**Possible causes**:
1. You're running tests that require a real OpenAI API key
2. Mocks are not properly set up

**Solution**:
1. For local development, create a `.env` file with your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. For CI environments, use mocks instead of real API calls:
   ```javascript
   // Example of mocking the OpenAI API in tests
   jest.mock('openai', () => {
     return {
       OpenAI: jest.fn().mockImplementation(() => {
         return {
           chat: {
             completions: {
               create: jest.fn().mockResolvedValue({
                 choices: [{ message: { content: 'Mocked explanation' } }]
               })
             }
           }
         };
       })
     };
   });
   ```

## Build and Deployment Issues

### Action Build Fails

**Problem**: Build process fails with errors.

**Possible causes**:
1. Linting errors
2. Test failures
3. Compilation errors

**Solution**:
1. Run each step individually to isolate the issue:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

2. Fix any issues found in the specific step that fails.

### Action Works Locally but Fails in GitHub

**Problem**: The action works in your local testing but fails when deployed to GitHub.

**Possible causes**:
1. Environment differences
2. Secret configuration issues
3. Permissions problems

**Solution**:
1. Enable debug logs in GitHub Actions:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new repository secret named `ACTIONS_STEP_DEBUG` with the value `true`

2. Check action runs with debug enabled to see detailed logs.

3. Ensure all required permissions are specified in your workflow:
   ```yaml
   jobs:
     explain-diff:
       runs-on: ubuntu-latest
       permissions:
         pull-requests: write  # If needed for commenting
   ```

## Common Errors and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "OpenAI API key is required" | Missing or incorrect API key | Check API key configuration |
| "Diff is required" | Empty or missing diff | Debug diff generation step |
| "maxTokens must be a valid number" | Invalid parameter value | Ensure parameters are numeric |
| "429 Too Many Requests" | API rate limiting | Check OpenAI usage and billing |
| "Failed to generate explanation" | Generic API error | Check API key, request format, and logs |

## Getting Additional Help

If you're encountering issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/captradeoff/openai-summarize-diff-action/issues) to see if others have reported similar problems
2. Review the [API Reference](../api-reference.md) for correct parameter usage
3. Consult the [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) for API-specific issues
4. Open a new issue with detailed information about the problem, including:
   - Your workflow file (with secrets redacted)
   - Error messages
   - Environment details 