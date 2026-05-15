import type {
  MessengerKernelEventHandler,
  MessengerKernelEventMap,
} from "./types";

export type MessengerKernelEventBus = {
  emit<K extends keyof MessengerKernelEventMap>(
    eventName: K,
    payload: MessengerKernelEventMap[K],
  ): void;
  on<K extends keyof MessengerKernelEventMap>(
    eventName: K,
    handler: MessengerKernelEventHandler<K>,
  ): () => void;
  clear(): void;
};

type InternalHandler = (payload: unknown) => void;

function getHandlerSet(
  registry: Map<string, Set<InternalHandler>>,
  eventName: string,
): Set<InternalHandler> {
  let bucket = registry.get(eventName);
  if (!bucket) {
    bucket = new Set<InternalHandler>();
    registry.set(eventName, bucket);
  }
  return bucket;
}

export function createMessengerKernelEventBus(): MessengerKernelEventBus {
  const registry = new Map<string, Set<InternalHandler>>();

  return {
    emit(eventName, payload) {
      const bucket = registry.get(String(eventName));
      if (!bucket || bucket.size === 0) {
        return;
      }

      Array.from(bucket).forEach((handler) => {
        handler(payload);
      });
    },

    on(eventName, handler) {
      const bucket = getHandlerSet(registry, String(eventName));
      const wrappedHandler: InternalHandler = (payload) => {
        (handler as (value: unknown) => void)(payload);
      };

      bucket.add(wrappedHandler);

      return () => {
        const currentBucket = registry.get(String(eventName));
        if (!currentBucket) return;

        currentBucket.delete(wrappedHandler);

        if (currentBucket.size === 0) {
          registry.delete(String(eventName));
        }
      };
    },

    clear() {
      registry.clear();
    },
  };
}