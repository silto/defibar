export function allowedFrontendOrigins(env: NodeJS.ProcessEnv): (string | RegExp)[] {
  const exact = [env.FRONTEND_URL, env.FRONTEND_PREVIEW_URL].filter((origin): origin is string =>
    Boolean(origin),
  );
  const project = /^https:\/\/([a-z0-9-]+)\.pages\.dev$/.exec(env.FRONTEND_PREVIEW_URL ?? "")?.[1];
  if (!project) return exact;
  return [...exact, new RegExp("^https://[a-z0-9-]+\\." + project + "\\.pages\\.dev$")];
}
