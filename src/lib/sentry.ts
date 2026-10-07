type SentryContext = {
  path?: string;
  extra?: Record<string, unknown>;
};

function parseDsn(dsn: string) {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "").replace(/\/$/, "");
    if (!publicKey || !projectId) return null;
    return {
      publicKey,
      ingest: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

function dsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";
}

export function sentryEnabled() {
  return Boolean(parseDsn(dsn()));
}

export async function reportError(error: unknown, context: SentryContext = {}) {
  const parsed = parseDsn(dsn());
  if (!parsed) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const header = { event_id: eventId, sent_at: new Date().toISOString(), dsn: dsn() };
  const item = { type: "event", content_type: "application/json" };
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: "javascript",
    level: "error",
    environment: process.env.NODE_ENV,
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          stacktrace: {
            frames: (err.stack ?? "")
              .split("\n")
              .slice(1)
              .map((line) => ({ filename: line.trim() })),
          },
        },
      ],
    },
    request: context.path ? { url: context.path } : undefined,
    extra: context.extra,
    tags: { app: "cartel-deportivo" },
  };

  const body = `${JSON.stringify(header)}\n${JSON.stringify(item)}\n${JSON.stringify(event)}`;
  try {
    await fetch(`${parsed.ingest}?sentry_version=7&sentry_key=${parsed.publicKey}&sentry_client=cartel/1`, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body,
    });
  } catch {
    /* swallow: reporting must never break the app */
  }
}
