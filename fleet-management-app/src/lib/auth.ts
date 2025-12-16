import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

// Validate required environment variables
const requiredEnvVars = {
  KEYCLOAK_ID: process.env.KEYCLOAK_ID,
  KEYCLOAK_SECRET: process.env.KEYCLOAK_SECRET,
  KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  AUTHENTICATION CONFIGURATION ERROR                         ║
╚════════════════════════════════════════════════════════════════╝

Missing required environment variables:
${missingVars.map(v => `  ❌ ${v}`).join('\n')}

To fix this:

See KEYCLOAK_SETUP.txt for detailed setup instructions.
`;
  
  throw new Error(errorMessage);
}

// Helper function to refresh the token
async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID || "",
        client_secret: process.env.KEYCLOAK_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "",
      clientSecret: process.env.KEYCLOAK_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 1. Initial Sign In
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      
        // Add user role from Keycloak
        if (profile) {
          const keycloakProfile = profile as any;
          
          // Debug: Log the entire profile to see what we're getting
          console.log('🔍 Keycloak Profile:', JSON.stringify(keycloakProfile, null, 2));
          
          // Try multiple locations for roles (Keycloak can put them in different places)
          let roles: string[] = [];
          
          // Try realm_access.roles (most common)
          if (keycloakProfile.realm_access?.roles) {
            roles = keycloakProfile.realm_access.roles;
            console.log('📍 Found roles in realm_access:', roles);
          }
          // Try resource_access (client-specific roles)
          else if (keycloakProfile.resource_access?.['fleet-management-frontend']?.roles) {
            roles = keycloakProfile.resource_access['fleet-management-frontend'].roles;
            console.log('📍 Found roles in resource_access:', roles);
          }
          // Try groups (if using group-based roles)
          else if (keycloakProfile.groups && Array.isArray(keycloakProfile.groups)) {
            roles = keycloakProfile.groups;
            console.log('📍 Found roles in groups:', roles);
          }
          // Try roles claim directly (some configurations)
          else if (keycloakProfile.roles && Array.isArray(keycloakProfile.roles)) {
            roles = keycloakProfile.roles;
            console.log('📍 Found roles in direct roles claim:', roles);
          }
          
          token.roles = roles;
          console.log('🎭 Extracted roles from Keycloak:', roles);
          
          // Map Keycloak roles to app roles
          if (roles.includes('fleet-admin') || roles.includes('admin')) {
            token.role = 'admin';
            console.log('✅ User identified as ADMIN');
          } else if (roles.includes('fleet-employee') || roles.includes('employee')) {
            token.role = 'employee';
            console.log('✅ User identified as EMPLOYEE');
          } else {
            token.role = 'employee'; // Default role
            console.log('⚠️  No fleet role found, defaulting to EMPLOYEE. Available roles:', roles);
          }
          
          console.log('🎯 Final mapped role:', token.role);
        }
        return token;
      }

      // 2. Return previous token if the access token has not expired yet
      // Buffer of 10 seconds
      if (Date.now() < ((token.expiresAt as number) * 1000 - 10000)) {
        return token;
      }

      // 3. Access token has expired, try to update it
      console.log("⚠️ Access token expired, refreshing...");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      
      session.user = {
        ...session.user,
        id: token.sub as string,
        role: token.role as 'admin' | 'employee',
        roles: token.roles as string[],
      };
      
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to false for localhost
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        maxAge: 900, // 15 minutes
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        maxAge: 900, // 15 minutes
      },
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see more detailed logs
};
