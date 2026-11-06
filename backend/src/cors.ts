export function allowedFrontendOrigins(env: NodeJS.ProcessEnv): string[] {
  return [env.FRONTEND_URL, env.FRONTEND_PREVIEW_URL].filter(
    (origin): origin is string => Boolean(origin),
  );
}
