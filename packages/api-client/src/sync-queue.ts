import { TripEvent } from '@tinyride/types';
import { getTinyRideClient } from './client';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

export class OfflineTripSyncQueue {
  private storageKey = '@tinyride_offline_trip_events';
  private storage: StorageAdapter;
  private isSyncing = false;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  /**
   * Adds a trip milestone event to the local persistent queue
   */
  async enqueue(event: Omit<TripEvent, 'id' | 'synced_at'>): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...event,
      queued_at: new Date().toISOString(),
    });
    await this.storage.setItem(this.storageKey, JSON.stringify(queue));
  }

  /**
   * Retrieves pending events from local storage
   */
  async getQueue(): Promise<Array<Omit<TripEvent, 'id' | 'synced_at'> & { queued_at: string }>> {
    try {
      const data = await this.storage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Flushes pending events to Supabase via idempotent batch upsert or RPC
   */
  async flush(): Promise<{ successCount: number; failureCount: number }> {
    if (this.isSyncing) {
      return { successCount: 0, failureCount: 0 };
    }

    this.isSyncing = true;
    const client = getTinyRideClient();
    const queue = await this.getQueue();

    if (queue.length === 0) {
      this.isSyncing = false;
      return { successCount: 0, failureCount: 0 };
    }

    const remainingQueue: typeof queue = [];
    let successCount = 0;
    let failureCount = 0;

    for (const item of queue) {
      try {
        const { error } = await client.from('trip_events').insert({
          trip_id: item.trip_id,
          child_id: item.child_id,
          event_type: item.event_type,
          idempotency_key: item.idempotency_key,
          location: item.location,
          recorded_at: item.recorded_at,
          notes: item.notes,
        });

        // PostgreSQL code 23505 is unique_violation (already processed) -> count as success
        if (error && error.code !== '23505') {
          console.error('Failed to sync trip event:', error.message);
          failureCount++;
          remainingQueue.push(item);
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Unexpected sync error:', err);
        failureCount++;
        remainingQueue.push(item);
      }
    }

    await this.storage.setItem(this.storageKey, JSON.stringify(remainingQueue));
    this.isSyncing = false;

    return { successCount, failureCount };
  }

  /**
   * Clears the entire offline queue (useful for testing or session reset)
   */
  async clear(): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify([]));
  }
}
