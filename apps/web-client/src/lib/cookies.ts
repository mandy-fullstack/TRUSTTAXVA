/**
 * Professional cookie utilities for TrustTax web-client.
 * Wraps js-cookie with app-specific keys, secure defaults, and consistent options.
 * Use for auth token and user snapshot only; never store passwords.
 */

import Cookies from 'js-cookie';

/** Cookie key for auth token */
export const COOKIE_TOKEN = 'token';

/** Cookie key for serialized user (JSON). No sensitive data. */
export const COOKIE_USER = 'user';

/** Default expiry in days */
const DEFAULT_EXPIRES = 7;

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

/**
 * Get auth token from cookies.
 */
export function getToken(): string | undefined {
    return Cookies.get(COOKIE_TOKEN);
}

/**
 * Store auth token. Uses secure/sameSite when on HTTPS.
 */
export function setToken(value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(COOKIE_TOKEN, value, { ...defaultOptions(), ...options });
}

/**
 * Remove auth token. Uses same path as set.
 */
export function removeToken(): void {
    Cookies.remove(COOKIE_TOKEN, { path: COOKIE_PATH });
}

/**
 * Get stored user JSON from cookies. Returns parsed object or null.
 */
export function getUser(): Record<string, unknown> | null {
    const raw = Cookies.get(COOKIE_USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/**
 * Store user as JSON. Do not store password or other secrets.
 */
export function setUser(value: Record<string, unknown>, options?: Cookies.CookieAttributes): void {
    Cookies.set(COOKIE_USER, JSON.stringify(value), { ...defaultOptions(), ...options });
}

/**
 * Remove stored user.
 */
export function removeUser(): void {
    Cookies.remove(COOKIE_USER, { path: COOKIE_PATH });
}

/**
 * Clear all auth-related cookies (token + user).
 */
export function clearAuth(): void {
    removeToken();
    removeUser();
}

/**
 * True if an auth token cookie exists. Use for quick checks; validate with API when needed.
 */
export function hasAuth(): boolean {
    return !!getToken();
}
