declare module "socket.io-client" {
  export type DefaultEventsMap = Record<string, (...args: any[]) => void>;

  export interface ManagerOptions {
    autoConnect?: boolean;
    transports?: string[];
    path?: string;
    timeout?: number;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    forceNew?: boolean;
    query?: Record<string, string | number | boolean | undefined>;
  }

  export interface SocketOptions {
    auth?:
      | Record<string, unknown>
      | ((cb: (data: Record<string, unknown>) => void) => void);
    query?: Record<string, string | number | boolean | undefined>;
    extraHeaders?: Record<string, string>;
  }

  export interface Manager {
    opts: ManagerOptions & SocketOptions;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener?: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
  }

  export interface Socket<
    ListenEvents extends DefaultEventsMap = DefaultEventsMap,
    EmitEvents extends DefaultEventsMap = ListenEvents,
  > {
    connected: boolean;
    active: boolean;
    id?: string;
    auth?: Record<string, unknown>;
    io: Manager;

    on<E extends keyof ListenEvents>(event: E, listener: ListenEvents[E]): this;
    on(event: string, listener: (...args: any[]) => void): this;

    once<E extends keyof ListenEvents>(event: E, listener: ListenEvents[E]): this;
    once(event: string, listener: (...args: any[]) => void): this;

    off<E extends keyof ListenEvents>(event: E, listener?: ListenEvents[E]): this;
    off(event: string, listener?: (...args: any[]) => void): this;

    emit<E extends keyof EmitEvents>(
      event: E,
      ...args: EmitEvents[E] extends (...payload: infer P) => any ? P : any[]
    ): this;
    emit(event: string, ...args: any[]): this;

    connect(): this;
    disconnect(): this;
    removeAllListeners(event?: string): this;
  }

  export function io<
    ListenEvents extends DefaultEventsMap = DefaultEventsMap,
    EmitEvents extends DefaultEventsMap = ListenEvents,
  >(
    uri?: string,
    opts?: Partial<ManagerOptions & SocketOptions>,
  ): Socket<ListenEvents, EmitEvents>;

  export default io;
}