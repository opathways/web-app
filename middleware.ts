import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from './utils/amplifyServerUtils';

export async function middleware(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/company-profile', '/jobs'];
  const path = request.nextUrl.pathname;

  if (protectedRoutes.some((route) => path.startsWith(route))) {
    const response = NextResponse.next();
    
    try {
      const authenticated = await runWithAmplifyServerContext({
        nextServerContext: { request, response },
        operation: async (contextSpec) => {
          const session = await fetchAuthSession(contextSpec);
          const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];
          return Array.isArray(groups) && groups.includes("EMPLOYER");
        }
      });

      if (authenticated) {
        return response;
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/company-profile/:path*', '/jobs/:path*']
};
