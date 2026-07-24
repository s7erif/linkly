let normalizedBaseUrl: string | undefined;

export function getBaseUrl(): string {
  if (normalizedBaseUrl) return normalizedBaseUrl;
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  normalizedBaseUrl = configuredBaseUrl?.replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL must be configured");
  }
  return normalizedBaseUrl;
}

function segment(value: string): string {
  return encodeURIComponent(value.trim());
}

export function buildActivationPath(token: string): string {
  return `/a/${segment(token.toUpperCase())}`;
}

export function buildActivationUrl(token: string): string {
  return `${getBaseUrl()}${buildActivationPath(token)}`;
}

export function buildProfileUrl(username: string): string {
  return `${getBaseUrl()}/@${segment(username.replace(/^@/, ""))}`;
}

export function buildWorkspaceUrl(slug: string): string {
  return `${getBaseUrl()}${buildWorkspaceBuilderPath(slug)}`;
}

export function buildWorkspaceBuilderPath(slug: string): string {
  return `/workspace?slug=${segment(slug)}`;
}
