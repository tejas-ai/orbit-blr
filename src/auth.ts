import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { upsertOAuthUser, AccountLinkingConflictError } from "@/lib/auth-db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : "orbit-blr-secret-development-key-3.2"),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
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
