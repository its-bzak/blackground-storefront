"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

const label = {
  fontSize: "0.6875rem",
  lineHeight: "1rem",
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
} as const;

// Shown when the root layout itself fails. It replaces that layout, so it
// brings its own document and inline styles: nothing from globals.css or the
// font setup reaches this page.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 1.25rem",
          background: "#080808",
          color: "#f2f0eb",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <title>Something went wrong | Blackground</title>
        <main style={{ width: "100%", maxWidth: "36rem", margin: "0 auto" }}>
          <p style={{ ...label, margin: 0, color: "#d4af00" }}>
            Something went wrong
          </p>
          <h1
            style={{
              margin: "1.25rem 0 0",
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: "3rem",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            We couldn&rsquo;t load this page.
          </h1>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              ...label,
              marginTop: "2.5rem",
              padding: "0 0 0.25rem",
              border: 0,
              borderBottom: "1px solid rgb(242 240 235 / 0.4)",
              background: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
