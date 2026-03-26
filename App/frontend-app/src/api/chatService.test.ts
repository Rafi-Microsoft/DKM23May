import { Completion, PostFeedback } from './chatService';
import { httpClient } from '../utils/httpClient/httpClient';
import { ChatRequest, FeedbackRequest } from './apiTypes/chatTypes';

// Mock the httpClient
jest.mock('../utils/httpClient/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    import.meta.env.VITE_API_ENDPOINT = 'https://api.test.com';
  });

  describe('Completion', () => {
    it('should call httpClient.post with correct parameters', async () => {
      const mockRequest: ChatRequest = {
        Question: 'What is the document about?',
        ChatSessionId: 'session-123',
        DocumentIds: ['doc1', 'doc2'],
      };

      const mockResponse = {
        ChatSessionId: 'session-123',
        Answer: 'The document is about testing.',
        DocumentIds: ['doc1', 'doc2'],
        SuggestingQuestions: ['What else?', 'Tell me more'],
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await Completion(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.test.com/chat',
        mockRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle successful response with all fields', async () => {
      const mockRequest: ChatRequest = {
        Question: 'Tell me about the project',
        ChatSessionId: 'session-456',
        DocumentIds: ['doc5'],
      };

      const mockResponse = {
        ChatSessionId: 'session-456',
        Answer: 'This is a comprehensive project about document knowledge mining.',
        DocumentIds: ['doc5', 'doc6'],
        SuggestingQuestions: [
          'What are the key features?',
          'How does it work?',
          'What are the requirements?',
        ],
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await Completion(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.Answer).toBe('This is a comprehensive project about document knowledge mining.');
      expect(result.SuggestingQuestions).toHaveLength(3);
    });

    it('should throw error when API request fails', async () => {
      const mockRequest: ChatRequest = {
        Question: 'What is this?',
        ChatSessionId: 'session-789',
      };

      const errorMessage = 'Failed to fetch the API response.';
      (httpClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(Completion(mockRequest)).rejects.toThrow(errorMessage);
      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should handle request without DocumentIds', async () => {
      const mockRequest: ChatRequest = {
        Question: 'General question',
        ChatSessionId: 'session-111',
      };

      const mockResponse = {
        ChatSessionId: 'session-111',
        Answer: 'General answer',
        DocumentIds: [],
        SuggestingQuestions: [],
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await Completion(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.test.com/chat',
        mockRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should handle request without ChatSessionId', async () => {
      const mockRequest: ChatRequest = {
        Question: 'New conversation',
      };

      const mockResponse = {
        ChatSessionId: 'new-session-222',
        Answer: 'Starting new conversation',
        DocumentIds: [],
        SuggestingQuestions: ['Ask me anything'],
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await Completion(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.ChatSessionId).toBe('new-session-222');
    });

    it('should include Content-Type header', async () => {
      const mockRequest: ChatRequest = {
        Question: 'Test question',
        ChatSessionId: 'test-session',
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce({});

      await Completion(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should log and throw error on failure', async () => {
      const mockRequest: ChatRequest = {
        Question: 'Error test',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (httpClient.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(Completion(mockRequest)).rejects.toThrow('Failed to fetch the API response.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during API request:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('PostFeedback', () => {
    beforeEach(() => {
      // Mock window.ENV for PostFeedback
      (window as any).ENV = {
        API_URL: 'https://api.test.com',
      };
    });

    it('should call httpClient.post with feedback request', async () => {
      const mockFeedbackRequest: FeedbackRequest = {
        SessionId: 'session-123',
        Rating: 5,
        Comment: 'Great response!',
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(true);

      const result = await PostFeedback(mockFeedbackRequest);

      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.test.com/api/Chat/Feedback',
        mockFeedbackRequest
      );
      expect(result).toBe(true);
    });

    it('should handle successful feedback submission', async () => {
      const mockFeedbackRequest: FeedbackRequest = {
        SessionId: 'session-456',
        Rating: 4,
        Comment: 'Good answer',
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(true);

      const result = await PostFeedback(mockFeedbackRequest);

      expect(result).toBe(true);
    });

    it('should handle failed feedback submission', async () => {
      const mockFeedbackRequest: FeedbackRequest = {
        SessionId: 'session-789',
        Rating: 1,
        Comment: 'Not helpful',
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(false);

      const result = await PostFeedback(mockFeedbackRequest);

      expect(result).toBe(false);
    });

    it('should handle feedback without comment', async () => {
      const mockFeedbackRequest: FeedbackRequest = {
        SessionId: 'session-999',
        Rating: 3,
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(true);

      const result = await PostFeedback(mockFeedbackRequest);

      expect(result).toBe(true);
      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          SessionId: 'session-999',
          Rating: 3,
        })
      );
    });
  });
});
