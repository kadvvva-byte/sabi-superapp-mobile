const isWebRuntime =
  typeof window !== "undefined" &&
  typeof document !== "undefined";

function isSafeWebTimeoutError(value: unknown) {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : String((value as any)?.message || value || "");

  return message.includes("timeout exceeded");
}

if (isWebRuntime) {
  window.addEventListener("unhandledrejection", (event) => {
    if (isSafeWebTimeoutError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener("error", (event) => {
    if (isSafeWebTimeoutError(event.error || event.message)) {
      event.preventDefault();
    }
  });
}

export {};
