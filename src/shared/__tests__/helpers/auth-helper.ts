import { auth } from '../../infra/auth/better-auth.config';

/**
 * Create a test user via Better Auth
 */
export async function createTestUser(email: string, password: string, name?: string) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || 'Test User'
      }
    });
    return result;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Sign in and get auth token/session
 */
export async function signInTestUser(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password
      }
    });
    return result;
  } catch (error) {
    console.error('Error signing in test user:', error);
    throw error;
  }
}

/**
 * Extract session token from Better Auth response
 */
export function extractTokenFromResponse(response: any): string {
  // Better Auth typically uses cookies, but you might need to extract from headers
  // This is a placeholder - adjust based on your Better Auth setup
  if (response.session?.token) {
    return response.session.token;
  }
  if (response.headers?.['set-cookie']) {
    const cookies = response.headers['set-cookie'];
    const match = cookies.match(/better-auth\.session_token=([^;]+)/);
    return match ? match[1] : '';
  }
  return '';
}

/**
 * Create auth headers for API requests
 */
export function createAuthHeaders(token: string) {
  return {
    'Cookie': `better-auth.session_token=${token}`
  };
}

/**
 * Create auth headers from session object
 */
export function createAuthHeadersFromSession(session: any) {
  if (session?.token) {
    return createAuthHeaders(session.token);
  }
  return {};
}
