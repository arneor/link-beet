'use client';

import { useCallback, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

// ===== Types =====
export type ProfileEventType =
    | 'page_view'
    | 'category_tap'
    | 'product_view'
    | 'link_click'
    | 'social_click'
    | 'share'
    | 'tab_switch'
    | 'banner_click'
    | 'gallery_view';

export interface ProfileEvent {
    eventType: ProfileEventType;
    username: string;
    elementId?: string;
    elementLabel?: string;
    metadata?: Record<string, unknown>;
    sessionId?: string;
    referrer?: string;
}

// ===== Session ID Generator =====
function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    const key = 'lb_session_id';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
}

// ===== Constants =====
const BATCH_INTERVAL_MS = 3000; // Flush every 3 seconds
const MAX_BATCH_SIZE = 20; // Flush if batch reaches this size

// ===== Global Event Queue (shared across hook instances) =====
let eventQueue: ProfileEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

async function flushEvents(): Promise<void> {
    if (isFlushing || eventQueue.length === 0) return;

    isFlushing = true;
    const batch = [...eventQueue];
    eventQueue = [];

    try {
        const response = await fetch(`${API_BASE_URL}/beet-link-events/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: batch }),
            // Use keepalive for page unload scenarios
            keepalive: true,
        });

        if (!response.ok) {
            // Re-queue on failure (don't lose events)
            console.warn('[EventTracker] Flush failed, re-queuing events');
            eventQueue = [...batch, ...eventQueue];
        }
    } catch {
        // Network error: re-queue
        console.warn('[EventTracker] Network error, re-queuing events');
        eventQueue = [...batch, ...eventQueue];
    } finally {
        isFlushing = false;
    }
}

function scheduleFlush(): void {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
        flushTimer = null;
        flushEvents();
    }, BATCH_INTERVAL_MS);
}

function enqueueEvent(event: ProfileEvent): void {
    eventQueue.push(event);

    if (eventQueue.length >= MAX_BATCH_SIZE) {
        // Immediate flush if batch is full
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
        flushEvents();
    } else {
        scheduleFlush();
    }
}

// ===== Page Unload Handler =====
if (typeof window !== 'undefined') {
    // Flush on page hide (covers tab close, navigation, backgrounding)
    window.addEventListener('pagehide', () => {
        if (eventQueue.length > 0) {
            // Use sendBeacon for reliable delivery during unload
            const payload = JSON.stringify({ events: eventQueue });
            navigator.sendBeacon(
                `${API_BASE_URL}/beet-link-events/track`,
                new Blob([payload], { type: 'application/json' })
            );
            eventQueue = [];
        }
    });
}

// ===== Hook =====
/**
 * Reusable hook for tracking user interactions on the public profile.
 * All events are batched and debounced for optimal performance.
 *
 * Usage:
 *   const { trackEvent } = useProfileEventTracker('username');
 *   trackEvent('category_tap', { elementId: 'cat-123', elementLabel: 'Phones' });
 */
export function useProfileEventTracker(username: string) {
    // Track page view on mount (once per session per page)
    const hasTrackedPageView = useRef(false);
    useEffect(() => {
        if (!username || hasTrackedPageView.current) return;
        hasTrackedPageView.current = true;

        enqueueEvent({
            eventType: 'page_view',
            username,
            sessionId: getSessionId(),
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        });
    }, [username]);

    const trackEvent = useCallback(
        (
            eventType: ProfileEventType,
            options?: {
                elementId?: string;
                elementLabel?: string;
                metadata?: Record<string, unknown>;
            }
        ) => {
            enqueueEvent({
                eventType,
                username,
                elementId: options?.elementId,
                elementLabel: options?.elementLabel,
                metadata: options?.metadata,
                sessionId: getSessionId(),
            });
        },
        [username]
    );

    return { trackEvent };
}
