import { httpClient, fetch } from './httpClient';

// Mock window.fetch
global.fetch = jest.fn();

describe('httpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe('fetch', () => {
    it('should return parsed JSON on successful response', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await fetch<typeof mockData>('https://api.test.com/data');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/data', {});
    });

    it('should handle responses with no JSON body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('No JSON')),
      });

      const result = await fetch('https://api.test.com/data');

      expect(result).toEqual({});
    });

    it('should reject with error message on failed response', async () => {
      const errorMessage = 'Not Found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValueOnce(errorMessage),
      });

      await expect(fetch('https://api.test.com/data')).rejects.toThrow(errorMessage);
    });

    it('should use status code as error message if response text is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValueOnce(''),
      });

      await expect(fetch('https://api.test.com/data')).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(fetch('https://api.test.com/data')).rejects.toThrow('Network error');
    });

    it('should pass custom headers in config', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const config = {
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json',
        },
      };

      await fetch('https://api.test.com/data', config);

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/data', config);
    });

    it('should handle notifyOnError option', async () => {
      const errorMessage = 'Bad Request';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValueOnce(errorMessage),
      });

      await expect(
        fetch('https://api.test.com/data', { notifyOnError: false })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('get', () => {
    it('should call fetch with GET method', async () => {
      const mockData = { id: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await httpClient.get<typeof mockData>('https://api.test.com/users/1');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'GET',
      });
    });

    it('should pass additional config to GET request', async () => {
      const mockData = { id: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await httpClient.get('https://api.test.com/users/1', {
        headers: { 'Authorization': 'Bearer token' },
      });

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' },
      });
    });
  });

  describe('post', () => {
    it('should call fetch with POST method and JSON body', async () => {
      const requestBody = { name: 'New User', email: 'user@test.com' };
      const mockResponse = { id: 1, ...requestBody };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await httpClient.post('https://api.test.com/users', requestBody);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    });

    it('should handle POST without body', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await httpClient.post('https://api.test.com/action');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/action', {
        method: 'POST',
        body: 'undefined',
      });
    });

    it('should include custom headers in POST request', async () => {
      const requestBody = { data: 'test' };
      const mockResponse = { success: true };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await httpClient.post('https://api.test.com/data', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/data', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('put', () => {
    it('should call fetch with PUT method and JSON body', async () => {
      const requestBody = { name: 'Updated User' };
      const mockResponse = { id: 1, ...requestBody };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await httpClient.put('https://api.test.com/users/1', requestBody);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });
    });
  });

  describe('delete', () => {
    it('should call fetch with DELETE method', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await httpClient.delete('https://api.test.com/users/1');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'DELETE',
      });
    });
  });

  describe('patch', () => {
    it('should call fetch with PATCH method and JSON body', async () => {
      const requestBody = { status: 'active' };
      const mockResponse = { id: 1, ...requestBody };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await httpClient.patch('https://api.test.com/users/1', requestBody);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/users/1', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });
    });
  });

  describe('download', () => {
    it('should trigger file download', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValueOnce(mockBlob),
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Mock DOM methods
      const mockLink = {
        href: '',
        setAttribute: jest.fn(),
        click: jest.fn(),
        parentNode: { removeChild: jest.fn() },
      };
      
      document.createElement = jest.fn().mockReturnValueOnce(mockLink);
      document.body.appendChild = jest.fn();
      
      global.URL.createObjectURL = jest.fn().mockReturnValueOnce('blob:mock-url');

      await httpClient.download('https://api.test.com/files/doc.pdf', 'document.pdf');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/files/doc.pdf', {
        method: 'GET',
      });
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'document.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('fetchRaw', () => {
    it('should return raw response without parsing', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await httpClient.fetchRaw('https://api.test.com/data');

      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('status', 200);
    });

    it('should handle errors in fetchRaw', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        httpClient.fetchRaw('https://api.test.com/data')
      ).rejects.toThrow('Network failure');
    });
  });
});
