import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authStorage = request.cookies.get('auth-storage')?.value;

    let user = null;
    if (authStorage) {
        try {
            const parsed = JSON.parse(authStorage);
            user = parsed.state?.user;
        } catch {
            // Invalid storage
        }
    }

    const { pathname } = request.nextUrl;

    // Public routes (accessible without auth)
    const publicRoutes = ['/login', '/signup', '/verify-otp'];
    const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route));

    // Onboarding routes
    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // Dashboard routes
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // Not authenticated
    if (!user) {
        if (isOnboardingRoute || isDashboardRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // Authenticated

    // Check if effectively complete (flag OR data presence)
    const nextStep = determineNextStep(user);
    const isEffectiveComplete = user.onboardingCompleted || nextStep === 'dashboard';

    console.log(`Middleware Debug: Path=${pathname} User=${user.email} Category=${user.category} BusinessID=${user.businessId} NextStep=${nextStep} Complete=${isEffectiveComplete}`);

    // Redirect to dashboard if trying to access auth pages
    if (isPublicRoute && pathname !== '/') {
        if (isEffectiveComplete) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL(`/onboarding/${nextStep}`, request.url));
        }
    }

    // Onboarding not completed - redirect to onboarding
    if (!isEffectiveComplete && isDashboardRoute) {
        return NextResponse.redirect(new URL(`/onboarding/${nextStep}`, request.url));
    }

    // Onboarding completed - redirect to dashboard if on onboarding pages
    if (isEffectiveComplete && isOnboardingRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineNextStep(user: any): string {
    // Priority 1: Use explicit onboardingStep if available
    const step = user.onboardingStep;
    if (step !== undefined && step !== null) {
        if (step <= 1) return 'category';
        if (step === 2) return 'profile';
        if (step === 3) return 'username';
        return 'dashboard';
    }

    // Priority 2: Fallback to data presence (Legacy/Backup)
    if (!user.category) return 'category';
    if (!user.displayName && !user.businessName) return 'profile';
    if (!user.username || user.username.includes('-')) return 'username'; // Heuristic: temp usernames usually contain '-'

    return 'dashboard';
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
