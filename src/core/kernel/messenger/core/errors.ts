export type MessengerKernelErrorCode =
  | "MESSENGER_KERNEL_NOT_CONFIGURED"
  | "MESSENGER_KERNEL_UNAUTHORIZED"
  | "MESSENGER_KERNEL_BAD_REQUEST"
  | "MESSENGER_KERNEL_NOT_FOUND"
  | "MESSENGER_KERNEL_CONFLICT"
  | "MESSENGER_KERNEL_NETWORK"
  | "MESSENGER_KERNEL_UNKNOWN"
  | string

export class MessengerKernelError extends Error {
  readonly code: MessengerKernelErrorCode
  readonly status: number | null
  readonly details?: unknown

  constructor(input: {
    code: MessengerKernelErrorCode
    message: string
    status?: number | null
    details?: unknown
  }) {
    super(input.message)
    this.name = "MessengerKernelError"
    this.code = input.code
    this.status = input.status ?? null
    this.details = input.details
  }
}

export function normalizeMessengerKernelError(error: unknown): MessengerKernelError {
  if (error instanceof MessengerKernelError) {
    return error
  }

  if (error instanceof Error) {
    return new MessengerKernelError({
      code: "MESSENGER_KERNEL_UNKNOWN",
      message: error.message,
      status: null,
      details: error,
    })
  }

  return new MessengerKernelError({
    code: "MESSENGER_KERNEL_UNKNOWN",
    message: "Unknown messenger kernel error",
    status: null,
    details: error,
  })
}

export function buildHttpMessengerKernelError(input: {
  status: number
  payload?: unknown
  fallbackMessage?: string
}): MessengerKernelError {
  const fallbackMessage = input.fallbackMessage ?? "Messenger request failed"
  const payload = input.payload as
    | {
        error?: {
          code?: string
          message?: string
          details?: unknown
        }
        message?: string
      }
    | undefined

  const backendCode = payload?.error?.code
  const backendMessage = payload?.error?.message || payload?.message

  if (input.status === 401 || input.status === 403) {
    return new MessengerKernelError({
      code: backendCode || "MESSENGER_KERNEL_UNAUTHORIZED",
      message: backendMessage || "Messenger request unauthorized",
      status: input.status,
      details: payload,
    })
  }

  if (input.status === 400 || input.status === 422) {
    return new MessengerKernelError({
      code: backendCode || "MESSENGER_KERNEL_BAD_REQUEST",
      message: backendMessage || fallbackMessage,
      status: input.status,
      details: payload,
    })
  }

  if (input.status === 404) {
    return new MessengerKernelError({
      code: backendCode || "MESSENGER_KERNEL_NOT_FOUND",
      message: backendMessage || "Messenger resource not found",
      status: input.status,
      details: payload,
    })
  }

  if (input.status === 409) {
    return new MessengerKernelError({
      code: backendCode || "MESSENGER_KERNEL_CONFLICT",
      message: backendMessage || "Messenger conflict",
      status: input.status,
      details: payload,
    })
  }

  return new MessengerKernelError({
    code: backendCode || "MESSENGER_KERNEL_NETWORK",
    message: backendMessage || fallbackMessage,
    status: input.status,
    details: payload,
  })
}
