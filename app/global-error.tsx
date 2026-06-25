"use client";

import { reportClientError } from "@/lib/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-gray-600">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                reset();
              } catch (error) {
                reportClientError("Global error boundary reset failed:", error);
              }
            }}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
