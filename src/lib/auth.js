import CredentialsProvider from "next-auth/providers/credentials";
import { legacyAdminUserService } from "@/lib/composition-root";

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
          // Resolve the temporary legacy admin identity through the compatibility service.
          const email = "admin@oicards.local";
          const user = await legacyAdminUserService.ensure(email, "Shop Admin");
          const { ensureBootstrapAdmin } = await import("@/lib/composition-root");
          await ensureBootstrapAdmin.execute(email, "Shop Admin");
          return { id: user.id, name: user.name, email: user.email };
        }
        return null; // Login failed
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
  pages: {
    signIn: "/admin/login",
  },
};
