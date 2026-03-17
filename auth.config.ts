import type { NextAuthConfig } from "next-auth";
import type { JWT as BaseJWT } from "@auth/core/jwt";

// Extend the JWT payload type for Dynamic Labs
export interface DynamicJwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  verified_credentials?: Array<{
    address?: string;
    chain?: string;
    format?: string;
    wallet_name?: string;
  }>;
  [key: string]: unknown;
}

// Extended JWT type with our custom fields
export interface JWT extends BaseJWT {
  id: string;
  walletAddress: string;
}

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    walletAddress: string;
  }

  interface Session {
    user: User;
  }
}

/**
 * Extracts the primary wallet address from Dynamic Labs JWT payload
 */
export function extractWalletAddress(payload: DynamicJwtPayload): string | null {
  // Dynamic Labs stores verified credentials in the JWT
  const credentials = payload.verified_credentials;

  if (!credentials || credentials.length === 0) {
    return null;
  }

  // Find the first EVM wallet address
  const evmCredential = credentials.find(
    (cred) => cred.format === "blockchain" && cred.address
  );

  if (evmCredential?.address) {
    return evmCredential.address;
  }

  // Fallback: return the first credential with an address
  const anyCredential = credentials.find((cred) => cred.address);
  return anyCredential?.address || null;
}

/**
 * Edge-compatible auth configuration (no Node.js modules)
 * Used by middleware
 */
export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        const jwt = token as JWT;
        jwt.id = user.id;
        jwt.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        const jwt = token as JWT;
        session.user.id = jwt.id;
        session.user.walletAddress = jwt.walletAddress;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return !!auth;
      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;

