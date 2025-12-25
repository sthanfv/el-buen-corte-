import { vi } from 'vitest';

// --- Shared Mock Registry ---
export const firebaseMocks = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  verifyIdToken: vi.fn().mockResolvedValue({ uid: 'test-user', admin: true }),
};

export const redisMocks = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
};

export const ratelimitMocks = {
  limit: vi
    .fn()
    .mockResolvedValue({
      success: true,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
};

// --- Firebase Admin Mock ---
vi.mock('firebase-admin', () => {
  const mockFirestore = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: firebaseMocks.get,
    set: firebaseMocks.set,
    update: firebaseMocks.update,
    runTransaction: vi.fn(async (cb) =>
      cb({
        get: firebaseMocks.get,
        set: firebaseMocks.set,
        update: firebaseMocks.update,
      })
    ),
  };

  return {
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    auth: vi.fn(() => ({ verifyIdToken: firebaseMocks.verifyIdToken })),
    firestore: vi.fn(() => mockFirestore),
  };
});

// --- Upstash Redis & Ratelimit Mocks ---
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(function () {
    this.get = redisMocks.get;
    this.set = redisMocks.set;
  }),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(function () {
    this.limit = ratelimitMocks.limit;
  }),
}));

// --- App Utilities ---
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), audit: vi.fn() },
}));

vi.mock('@/lib/events-handler', () => ({
  processOrderEvent: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === 'Authorization') return 'Bearer test-token';
      return '127.0.0.1';
    },
  }),
}));
