import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineTripSyncQueue, StorageAdapter } from './sync-queue';

class MockStorage implements StorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

describe('OfflineTripSyncQueue', () => {
  let mockStorage: MockStorage;
  let queue: OfflineTripSyncQueue;

  beforeEach(() => {
    mockStorage = new MockStorage();
    queue = new OfflineTripSyncQueue(mockStorage);
  });

  it('enqueues milestone events with idempotency keys', async () => {
    await queue.enqueue({
      trip_id: 'trip-123',
      child_id: 'child-456',
      event_type: 'PICKED_UP',
      idempotency_key: 'unique-uuid-1',
      location: { latitude: 17.4194, longitude: 78.3688 },
      recorded_at: new Date().toISOString(),
    });

    const items = await queue.getQueue();
    expect(items).toHaveLength(1);
    expect(items[0]?.idempotency_key).toBe('unique-uuid-1');
    expect(items[0]?.event_type).toBe('PICKED_UP');
  });

  it('supports clearing the queue', async () => {
    await queue.enqueue({
      trip_id: 'trip-123',
      event_type: 'TRIP_STARTED',
      idempotency_key: 'unique-uuid-2',
      location: { latitude: 17.4194, longitude: 78.3688 },
      recorded_at: new Date().toISOString(),
    });

    expect(await queue.getQueue()).toHaveLength(1);
    await queue.clear();
    expect(await queue.getQueue()).toHaveLength(0);
  });
});
