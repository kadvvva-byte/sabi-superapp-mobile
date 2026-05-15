declare module "socket.io-client/dist/socket.io" {
  import { io, type Socket } from "socket.io-client";

  export * from "socket.io-client";
  export { io };
  export type { Socket };
  export default io;
}

declare module "socket.io-client/dist/socket.io.js" {
  import { io, type Socket } from "socket.io-client";

  export * from "socket.io-client";
  export { io };
  export type { Socket };
  export default io;
}