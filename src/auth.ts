import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { upsertOAuthUser, AccountLinkingConflictError } from "@/lib/auth-db";

/**
 * Sanitize environment variable values to prevent accidental whitespace or surrounding quotes.
 */
function sanitizeEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

let clientId = sanitizeEnv(process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID);
let clientSecret = sanitizeEnv(process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET);

// Defensive Guard: Auto-detect inverted OAuth credentials.
// A modern GitHub Client ID is 20 characters (starts with 'Ov23').
// A GitHub Client Secret is 40 hexadecimal characters.
// If clientId has the format of a 40-char secret and clientSecret has the format of a 20-char Client ID,
// they were accidentally swapped during environment variable setup.
if (
  /^[0-9a-f]{40}$/i.test(clientId) &&
  (clientSecret.startsWith("Ov23") || clientSecret.length === 20)
) {
  console.warn(
    "[Auth Security] Inverted GitHub OAuth credentials detected in environment variables. Auto-rectifying clientId and clientSecret."
  );
  const temp = clientId;
  clientId = clientSecret;
  clientSecret = temp;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret:
    sanitizeEnv(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ||
    (process.env.NODE_ENV === "production" ? undefined : "orbit-blr-secret-development-key-3.2"),
  providers: [
    GitHub({
      clientId,
      clientSecret,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account && user) {
        try {
          const profile = await upsertOAuthUser({
            id: user.id || `usr-${Date.now()}`,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });
          if (profile?.id) {
            user.id = profile.id;
          }
        } catch (err) {
          if (err instanceof AccountLinkingConflictError) {
            console.warn(
              `[Auth Security] Insecure cross-provider linking blocked for email: ${user.email}. Registered via: ${err.existingProvider}, attempted: ${err.attemptedProvider}`
            );
            return `/signin?error=OAuthAccountNotLinked&provider=${err.existingProvider}`;
          }
          console.error("Error upserting OAuth user to database:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
