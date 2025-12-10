import { POST } from '@/app/api/upload/blob/route';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/firebase', () => ({
  adminAuth: {
    verifyIdToken: jest.fn().mockResolvedValue({ admin: true }),
  },
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === 'Authorization') return 'Bearer valid_token';
      return null;
    },
  }),
}));

global.fetch = jest.fn();

describe('Upload API', () => {
  const mockFile = new File(['dummy content'], 'test.png', {
    type: 'image/png',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'mock_token';
  });

  it.skip('should return 400 if no file is provided', async () => {
    // Mock FormData behavior
    const formDataMock = new FormData();

    // Create request with mocked formData method
    const req = new Request('http://localhost/api/upload/blob', {
      method: 'POST',
    });

    // Inject formData method manually to avoid polyfill parsing issues
    Object.defineProperty(req, 'formData', {
      value: async () => formDataMock,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('No file provided');
  });

  it.skip('should return 400 if file is not an image', async () => {
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' });
    const formDataMock = new FormData();
    formDataMock.append('file', textFile);

    const req = new Request('http://localhost/api/upload/blob', {
      method: 'POST',
    });

    // Inject formData method manually
    Object.defineProperty(req, 'formData', {
      value: async () => formDataMock,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Only images are allowed');
  });
});
