export async function onRequestError(
  error: { digest?: string } & Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  const { reportError } = await import("@/lib/sentry");
  await reportError(error, {
    path: request.path,
    extra: {
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      digest: error.digest,
    },
  });
}
