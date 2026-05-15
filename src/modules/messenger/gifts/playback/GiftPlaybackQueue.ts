import { GiftPlaybackItem } from "../types";

type Listener = (item: GiftPlaybackItem | null) => void;

class GiftPlaybackQueueManager {
  private queue: GiftPlaybackItem[] = [];
  private active: GiftPlaybackItem | null = null;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.active);
    return () => {
      this.listeners.delete(listener);
    };
  }

  enqueue(item: GiftPlaybackItem) {
    this.queue.push(item);
    this.flush();
  }

  completeActive() {
    this.active = null;
    this.emit();
    this.flush();
  }

  clear() {
    this.queue = [];
    this.active = null;
    this.emit();
  }

  getActive() {
    return this.active;
  }

  private flush() {
    if (this.active || this.queue.length === 0) return;
    this.active = this.queue.shift() ?? null;
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) {
      listener(this.active);
    }
  }
}

export const GiftPlaybackQueue = new GiftPlaybackQueueManager();