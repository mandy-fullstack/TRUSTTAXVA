/**
 * Cookie utilities for TrustTax web-admin.
 * Uses admin_token and admin_user. Secure only on HTTPS.
 */

import Cookies from 'js-cookie';

export const COOKIE_TOKEN = 'admin_token';
export const COOKIE_USER = 'admin_user';

const DEFAULT_EXPIRES = 30;
const COOKIE_PATH = '/';

function defaultOptions(): Cookies.CookieAttributes {
  const isSecure =
    typeof window !== 'undefined' && window.location?.protocol === 'https:';
  return {
    expires: DEFAULT_EXPIRES,
    secure: isSecure,
    sameSite: 'strict',
    path: COOKIE_PATH,
  };
}

export function getToken(): string | undefined {
  return Cookies.get(COOKIE_TOKEN);
}

export function setToken(value: string, options?: Cookies.CookieAttributes): void {
  Cookies.set(COOKIE_TOKEN, value, { ...defaultOptions(), ...options });
}

export function removeToken(): void {
  Cookies.remove(COOKIE_TOKEN, { path: COOKIE_PATH });
}

export function getUser(): Record<string, unknown> | null {
  const raw = Cookies.get(COOKIE_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function setUser(value: Record<string, unknown>, options?: Cookies.CookieAttributes): void {
  Cookies.set(COOKIE_USER, JSON.stringify(value), { ...defaultOptions(), ...options });
}

export function removeUser(): void {
  Cookies.remove(COOKIE_USER, { path: COOKIE_PATH });
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}

export function hasAuth(): boolean {
  return !!getToken();
}
