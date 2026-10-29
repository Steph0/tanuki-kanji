export function isSafeAuthorizationOrigin(
  origin: URL,
  isSecureContext: boolean,
  hasSubtleCryptography: boolean,
): boolean {
  if (!isSecureContext || !hasSubtleCryptography) {
    return false;
  }
  if (origin.protocol === "https:") {
    return true;
  }
  if (origin.protocol !== "http:") {
    return false;
  }
  return isLoopbackHost(origin.hostname);
}

function isLoopbackHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "[::1]") {
    return true;
  }
  const octets = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (octets === null) {
    return false;
  }
  return octets.slice(1).every((octet) => Number(octet) <= 255);
}
