import { User, AuthTokens } from '@/types/auth';

/**
 * Sets the auth-storage cookie to sync with Zustand persist state.
 * This is required for Middleware to access the auth state.
 */
export function setAuthCookie(user: User, tokens: AuthTokens) {
    const state = {
        state: {
            user,
            tokens,
            isAuthenticated: true,
        },
        version: 0,
    };

    // Calculate expiration based on token expiry or default to 7 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    document.cookie = `auth-storage=${encodeURIComponent(JSON.stringify(state))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Removes the auth-storage cookie.
 */
export function removeAuthCookie() {
    document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
