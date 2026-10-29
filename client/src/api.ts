// Empty locally: Vite proxies /api. Render static builds set the API origin.
const apiOrigin = (import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");
export const apiUrl = (path: string) => `${apiOrigin}/api/v1${path}`;
let refreshing: Promise<boolean> | null = null;
function refreshSession() {
  if (!refreshing) {
    refreshing = fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const send = () =>
    fetch(apiUrl(path), {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  let response = await send();
  if (
    response.status === 401 &&
    (!path.startsWith("/auth/") || path === "/auth/me")
  ) {
    if (await refreshSession()) response = await send();
  }
  const body = await response
    .json()
    .catch(() => ({
      error: {
        message:
          response.status === 429
            ? "Too many requests. Please wait a minute and try again."
            : "The care service is unavailable. Please try again shortly.",
      },
    }));
  if (!response.ok || body.error)
    throw new Error(body.error?.message || "Unable to complete your request");
  return body.data;
}
export const post = (path: string, data: unknown = {}) =>
  api(path, { method: "POST", body: JSON.stringify(data) });
export const patch = (path: string, data: unknown) =>
  api(path, { method: "PATCH", body: JSON.stringify(data) });
export const money = (paise: number = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
export const date = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
