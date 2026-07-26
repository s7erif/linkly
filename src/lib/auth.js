import CredentialsProvider from "next-auth/providers/credentials";
import { ensureBootstrapAdmin } from "@/lib/composition-root";

/** Admin-only auth configuration. Credentials only — no Google, no OAuth. */
export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USERNAME || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || "admin";

        if (credentials.username === adminUser && credentials.password === adminPass) {
          const email = "admin@oicards.local";
          const actor = await ensureBootstrapAdmin.execute(email, "Shop Admin");
          return { id: actor.id, name: "Shop Admin", email: actor.email };
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
  pages: { signIn: "/admin/login" },
};
