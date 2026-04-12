import { useCallback } from "react";
import { useNotify } from "@/components/mobile/Notify";

// ─────────────────────────────────────────────────────────────────────────────
// useApiError — central error normalisation for API call failures.
// Maps raw error strings to user-friendly messages and routes to the
// appropriate notification channel.
// ─────────────────────────────────────────────────────────────────────────────

export type ApiErrorSeverity = "error" | "warning" | "info";

export interface NormalisedError {
  title: string;
  message: string;
  severity: ApiErrorSeverity;
}

function normaliseError(err: unknown): NormalisedError {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("OFFLINE") || message.includes("NETWORK_ERROR")) {
    return {
      title: "You're Offline",
      message: "Check your connection and try again.",
      severity: "warning",
    };
  }

  if (message.includes("API Error 401")) {
    return {
      title: "Session Expired",
      message: "Please sign in again.",
      severity: "error",
    };
  }

  if (message.includes("API Error 403")) {
    return {
      title: "Access Denied",
      message: "You don't have permission to do that.",
      severity: "error",
    };
  }

  if (message.includes("API Error 404")) {
    return {
      title: "Not Found",
      message: "The requested resource was not found.",
      severity: "info",
    };
  }

  if (message.includes("API Error 5")) {
    return {
      title: "Server Error",
      message: "Something went wrong on our end. Please try again.",
      severity: "error",
    };
  }

  // Fallback — pass through the raw message in DEV, generic in prod
  return {
    title: "Something Went Wrong",
    message: __DEV__
      ? message
      : "An unexpected error occurred. Please try again.",
    severity: "error",
  };
}

export function useApiError() {
  const notify = useNotify();

  const handleError = useCallback(
    (err: unknown, context?: string) => {
      const { title, message, severity } = normaliseError(err);
      if (__DEV__ && context) {
        console.error(`[${context}]`, err);
      }
      if (severity === "warning") {
        notify.warning(title, message);
      } else {
        notify.error(title, message);
      }
    },
    [notify]
  );

  return { handleError, normaliseError };
}
