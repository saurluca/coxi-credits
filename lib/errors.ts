export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error instanceof Event) {
    return "A resource failed to load. Please try again.";
  }
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

export function reportClientError(context: string, error: unknown): void {
  console.error(context, error);
}
