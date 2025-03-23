const core = require('@actions/core');
const { run } = require('../src/action');
const openai = require('../src/openai');

// Mock dependencies
jest.mock('@actions/core');
jest.mock('../src/openai');

describe('GitHub Action', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default input values
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'diff':
          return 'mock diff content';
        case 'apikey':
          return 'mock-api-key';
        case 'examplePostSummary':
          return 'mock example summary';
        case 'maxTokens':
          return '50';
        case 'maxCharacters':
          return '200';
        default:
          return '';
      }
    });
    
    // Setup successful API response
    openai.generateDiffExplanation.mockResolvedValue('This is a mock explanation');
  });
  
  test('sets output when successful', async () => {
    await run();
    
    // Verify API was called with correct parameters
    expect(openai.generateDiffExplanation).toHaveBeenCalledWith({
      diff: 'mock diff content',
      apiKey: 'mock-api-key',
      examplePostSummary: 'mock example summary',
      maxTokens: 50,
      maxCharacters: 200
    });
    
    // Verify output was set
    expect(core.setOutput).toHaveBeenCalledWith('explanation', 'This is a mock explanation');
  });
  
  test('uses default values when optional inputs are not provided', async () => {
    // Setup missing optional inputs
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'diff':
          return 'mock diff content';
        case 'apikey':
          return 'mock-api-key';
        default:
          return '';
      }
    });
    
    await run();
    
    // Verify API was called with default parameters
    expect(openai.generateDiffExplanation).toHaveBeenCalledWith({
      diff: 'mock diff content',
      apiKey: 'mock-api-key',
      examplePostSummary: '',
      maxTokens: 30,
      maxCharacters: 140
    });
  });
  
  test('handles invalid maxTokens', async () => {
    // Setup invalid maxTokens input
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'diff':
          return 'mock diff content';
        case 'apikey':
          return 'mock-api-key';
        case 'maxTokens':
          return 'not-a-number';
        default:
          return '';
      }
    });
    
    await run();
    
    // Verify setFailed was called with appropriate error message
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('maxTokens must be a valid number')
    );
  });
  
  test('handles API errors', async () => {
    // Setup API error
    openai.generateDiffExplanation.mockRejectedValue(new Error('API error'));
    
    await run();
    
    // Verify setFailed was called with appropriate error message
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('API error')
    );
  });
}); 