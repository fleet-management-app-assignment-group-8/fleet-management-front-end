import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

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
      // Persist the OAuth access_token and id_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Add user role from Keycloak
      if (profile) {
        const keycloakProfile = profile as any;
        // Extract roles from realm_access or resource_access
        const roles = keycloakProfile.realm_access?.roles || [];
        token.roles = roles;
        
        // Map Keycloak roles to app roles
        if (roles.includes('fleet-admin')) {
          token.role = 'admin';
        } else if (roles.includes('fleet-employee')) {
          token.role = 'employee';
        } else {
          token.role = 'employee'; // Default role
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
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
  secret: process.env.NEXTAUTH_SECRET,
};

