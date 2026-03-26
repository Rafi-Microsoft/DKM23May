import { GetDocuments, GetSingleDocument, SearchDocuments } from './documentsService';
import { httpClient } from '../utils/httpClient/httpClient';

// Mock the httpClient
jest.mock('../utils/httpClient/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('documentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    import.meta.env.VITE_API_ENDPOINT = 'https://api.test.com';
  });

  describe('GetDocuments', () => {
    it('should fetch documents with pagination parameters', async () => {
      const mockResponse = {
        documents: [
          { DocumentId: 'doc1', FileName: 'test1.pdf' },
          { DocumentId: 'doc2', FileName: 'test2.pdf' },
        ],
        TotalRecords: 50,
        CurrentPage: 1,
        TotalPages: 5,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await GetDocuments(1, 10);

      expect(httpClient.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.documents).toHaveLength(2);
    });

    it('should handle different page numbers and sizes', async () => {
      const mockResponse = {
        documents: [],
        TotalRecords: 100,
        CurrentPage: 5,
        TotalPages: 10,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await GetDocuments(5, 10);

      expect(result.CurrentPage).toBe(5);
      expect(result.TotalPages).toBe(10);
    });

    it('should handle empty result set', async () => {
      const mockResponse = {
        documents: [],
        TotalRecords: 0,
        CurrentPage: 1,
        TotalPages: 0,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await GetDocuments(1, 10);

      expect(result.documents).toHaveLength(0);
      expect(result.TotalRecords).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      (httpClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(GetDocuments(1, 10)).rejects.toThrow('Network error');
    });
  });

  describe('GetSingleDocument', () => {
    it('should fetch a single document by ID', async () => {
      const mockDocument = {
        DocumentId: 'doc123',
        FileName: 'important-doc.pdf',
        UploadDate: '2024-01-15T10:30:00Z',
        Keywords: { Category: ['keyword1', 'keyword2'] },
      };

      (httpClient.get as jest.Mock).mockResolvedValueOnce(mockDocument);

      const result = await GetSingleDocument('doc123');

      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('doc123')
      );
      expect(result).toEqual(mockDocument);
      expect(result.DocumentId).toBe('doc123');
    });

    it('should handle non-existent document', async () => {
      (httpClient.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await GetSingleDocument('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error on API failure', async () => {
      (httpClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('Document not found')
      );

      await expect(GetSingleDocument('invalid-id')).rejects.toThrow(
        'Document not found'
      );
    });
  });

  describe('SearchDocuments', () => {
    it('should search documents with search term and pagination', async () => {
      const mockResponse = {
        documents: [
          { DocumentId: 'doc1', FileName: 'matching-doc.pdf' },
        ],
        TotalRecords: 1,
        CurrentPage: 1,
        TotalPages: 1,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await SearchDocuments('search term', 1, 10);

      expect(httpClient.post).toHaveBeenCalled();
      expect(result.documents).toHaveLength(1);
    });

    it('should handle search with no results', async () => {
      const mockResponse = {
        documents: [],
        TotalRecords: 0,
        CurrentPage: 1,
        TotalPages: 0,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await SearchDocuments('nonexistent term', 1, 10);

      expect(result.documents).toHaveLength(0);
      expect(result.TotalRecords).toBe(0);
    });

    it('should handle empty search term', async () => {
      const mockResponse = {
        documents: [],
        TotalRecords: 0,
        CurrentPage: 1,
        TotalPages: 0,
        keywordFilterInfo: {},
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await SearchDocuments('', 1, 10);

      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should handle search with filters', async () => {
      const mockResponse = {
        documents: [
          { DocumentId: 'doc1', FileName: 'filtered-doc.pdf' },
          { DocumentId: 'doc2', FileName: 'another-doc.pdf' },
        ],
        TotalRecords: 2,
        CurrentPage: 1,
        TotalPages: 1,
        keywordFilterInfo: {
          Category: ['finance', 'reports'],
        },
      };

      (httpClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await SearchDocuments('finance', 1, 20);

      expect(result.keywordFilterInfo).toHaveProperty('Category');
      expect(result.documents).toHaveLength(2);
    });
  });
});
